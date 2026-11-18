// Renders film.html to an MP4 (and a poster) with headless Chromium + ffmpeg.
//
//   node media-source/brand-story/render.mjs <chrome-binary> [--stills 1,5,12] [--out dir]
//
// --stills writes PNG frames at those seconds instead of the film (for
// storyboard review). Without it, every frame is captured and encoded to
// public/media/buzzly-brand-story.mp4 plus a poster from the end card.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const [chrome, ...rest] = process.argv.slice(2);
const flag = name => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
const stills = flag("--stills")?.split(",").map(Number);
const outDir = resolve(flag("--out") ?? join(here, "out"));
if (!chrome) { console.error("usage: render.mjs <chrome-binary> [--stills 1,5] [--out dir]"); process.exit(1); }

const types = { ".html": "text/html", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".js": "text/javascript" };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path === "/film.html" ? join(here, "film.html") : join(root, "public", path);
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(8766);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = spawn(chrome, ["--headless", "--remote-debugging-port=9334", "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
await sleep(1500);
const target = (await (await fetch("http://127.0.0.1:9334/json")).json()).find(t => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const capture = async () => Buffer.from((await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 } })).result.data, "base64");

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://127.0.0.1:8766/film.html?render" });
await sleep(1200);
await evaluate("window.ready.then(() => true)");
const { DURATION, FPS } = await evaluate("window.FILM");

mkdirSync(outDir, { recursive: true });
if (stills) {
  for (const s of stills) { await evaluate(`renderFrame(${s})`); writeFileSync(join(outDir, `still-${String(s).replace(".", "_")}.png`), await capture()); }
  console.log(`wrote ${stills.length} stills to ${outDir}`);
} else {
  const frames = join(outDir, "frames"); rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
  const total = Math.round(DURATION * FPS);
  for (let f = 0; f < total; f++) {
    await evaluate(`renderFrame(${f / FPS})`);
    writeFileSync(join(frames, `${String(f).padStart(5, "0")}.png`), await capture());
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  const media = join(root, "public/media");
  const ff = args => { const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" }); if (r.status) throw new Error("ffmpeg failed"); };
  ff(["-framerate", String(FPS), "-i", join(frames, "%05d.png"), "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-vf", "scale=864:1080", "-movflags", "+faststart", "-an", join(media, "buzzly-brand-story.mp4")]);
  ff(["-i", join(frames, `${String(total - 30).padStart(5, "0")}.png`), "-vf", "scale=864:1080", "-q:v", "3", join(media, "buzzly-brand-story-poster.jpg")]);
  console.log("wrote public/media/buzzly-brand-story.mp4 and buzzly-brand-story-poster.jpg");
}
browser.kill(); server.close(); process.exit(0);
