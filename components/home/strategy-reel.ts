/**
 * The strategy reel inside the homepage phone: a motion-graphics story of how
 * Buzzly builds a brand through content, from planning and filming to editing,
 * posting, reach and clients. White background, ink and red, the site's fonts.
 *
 * It is drawn, not played: `drawStrategyReel(ctx, t, width, height)` paints
 * the frame at story-time `t` (0 → REEL_DURATION). Every frame is a pure
 * function of `t`, so the homepage can scrub it with the scroll position and
 * it stays sharp at any size. Coordinates are in a 360-unit-wide space; the
 * caller scales the context. Keep REEL_TRANSCRIPT in step with the scenes.
 */

export const REEL_DURATION = 50;

export const REEL_CHAPTERS = [
  { no: "01", name: "Plan", start: 5, end: 12 },
  { no: "02", name: "Film", start: 12, end: 20 },
  { no: "03", name: "Edit", start: 20, end: 28 },
  { no: "04", name: "Post", start: 28, end: 35 },
  { no: "05", name: "Reach", start: 35, end: 42 },
  { no: "06", name: "Clients", start: 42, end: 47.5 },
] as const;

export const REEL_TRANSCRIPT = [
  "How brands are built through content: a six-step system.",
  "01 Plan the idea: a person writes the plan in a notebook; a script types itself (hook, story, call to action); sticky notes ask who it is for, what they should remember and where they scroll; the plan becomes a week of content.",
  "02 Film it for real: a camera operator films with a cinema camera; the viewfinder locks focus; the camera's monitor shows the shot; the slate closes and the takes roll past on a film strip.",
  "03 Edit for the scroll: an editor at a desk; the takes land on the monitor; we zoom into the timeline where the hook, the cut, captions and sound are added; the footage is graded from raw to warm and exported as a reel.",
  "04 Post with a strategy: the reel lands on a phone; a checklist ticks off a hook in the first seconds, a cover that reads small, keywords in the caption, posting when the audience is online and replying to every comment; one shoot becomes a reel, a carousel and a story in the profile grid.",
  "05 Reach the right people: they watch, save, share and follow, and pass it on.",
  "06 Turn viewers into clients: messages and enquiries arrive, viewers become followers, followers become clients.",
  "Then repeat, learning from every post. We build brands through content.",
];

const INK = "#151313", RED = "#ef342d", CREAM = "#f5efdf", WHITE = "#ffffff";
const SERIF = "'Instrument Serif', serif", SANS = "'DM Sans', sans-serif", MONO = "'Geist Mono', monospace";

type Ctx = CanvasRenderingContext2D;

// ---------- timing helpers ----------
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const raw = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const seg = (t: number, a: number, b: number, e: (x: number) => number = io) => e(raw(t, a, b));
/** In over a–b, out over c–d. */
const fade = (t: number, a: number, b: number, c: number, d: number) => seg(t, a, b, out) * (1 - seg(t, c, d));
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ink = (a: number) => `rgba(21,19,19,${clamp(a)})`;
const red = (a: number) => `rgba(239,52,45,${clamp(a)})`;

// ---------- drawing helpers ----------
function txt(c: Ctx, s: string, x: number, y: number, font: string, color: string, a = 1, align: CanvasTextAlign = "left") {
  if (a <= 0.001) return;
  c.save(); c.globalAlpha *= a; c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic"; c.fillText(s, x, y); c.restore();
}
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function box(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lw = 1.5) {
  rr(c, x, y, w, h, r);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
function circle(c: Ctx, x: number, y: number, r: number, fill?: string, stroke?: string, lw = 1.5) {
  c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
function heart(c: Ctx, x: number, y: number, s: number, color: string) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.beginPath();
  c.moveTo(0, 6); c.bezierCurveTo(-12, -2, -9, -12, 0, -6); c.bezierCurveTo(9, -12, 12, -2, 0, 6);
  c.fillStyle = color; c.fill(); c.restore();
}
function bubble(c: Ctx, x: number, y: number, s: number, color: string) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20);
  rr(c, -9, -8, 18, 13, 5); c.moveTo(-4, 5); c.lineTo(-7, 10); c.lineTo(1, 5);
  c.fillStyle = color; c.fill(); c.restore();
}
function plane(c: Ctx, x: number, y: number, s: number, color: string) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.beginPath();
  c.moveTo(-9, -1); c.lineTo(9, -8); c.lineTo(3, 9); c.lineTo(0, 2); c.closePath();
  c.fillStyle = color; c.fill(); c.restore();
}
function bookmark(c: Ctx, x: number, y: number, s: number, color: string) {
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.beginPath();
  c.moveTo(-6, -9); c.lineTo(6, -9); c.lineTo(6, 9); c.lineTo(0, 4); c.lineTo(-6, 9); c.closePath();
  c.fillStyle = color; c.fill(); c.restore();
}
function person(c: Ctx, x: number, y: number, s: number, color: string) {
  circle(c, x, y - s * 0.32, s * 0.24, color);
  c.beginPath(); c.arc(x, y + s * 0.42, s * 0.44, Math.PI, 0); c.closePath(); c.fillStyle = color; c.fill();
}
function play(c: Ctx, x: number, y: number, s: number, color: string) {
  c.beginPath(); c.moveTo(x - s * 0.4, y - s * 0.5); c.lineTo(x + s * 0.55, y); c.lineTo(x - s * 0.4, y + s * 0.5); c.closePath(); c.fillStyle = color; c.fill();
}
function check(c: Ctx, x: number, y: number, s: number, color: string, lw = 2.2) {
  c.beginPath(); c.moveTo(x - s * 0.45, y); c.lineTo(x - s * 0.1, y + s * 0.35); c.lineTo(x + s * 0.5, y - s * 0.35);
  c.strokeStyle = color; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
}
// ---------- chrome drawn into the reel ----------
/** Set per frame: true while the frame is a dark, full-bleed photo. */
let DARK = false;
function chapterBars(c: Ctx, t: number, W: number) {
  const x0 = 20, x1 = W - 20, gap = 5, n = REEL_CHAPTERS.length, w = (x1 - x0 - gap * (n - 1)) / n, y = 84;
  const show = seg(t, 4.2, 5.2, out) * (1 - seg(t, 47.4, 48.2));
  if (show <= 0) return;
  c.save(); c.globalAlpha = show;
  REEL_CHAPTERS.forEach((ch, i) => {
    const x = x0 + i * (w + gap), p = raw(t, ch.start, ch.end);
    c.fillStyle = DARK ? "rgba(255,255,255,.28)" : ink(0.12); c.fillRect(x, y, w, 2.5);
    c.fillStyle = t >= ch.end ? (DARK ? WHITE : INK) : RED; c.fillRect(x, y, w * p, 2.5);
  });
  const cur = REEL_CHAPTERS.find(ch => t >= ch.start && t < ch.end);
  if (cur) {
    txt(c, cur.no, x0, y + 18, `500 10px ${MONO}`, RED);
    txt(c, cur.name.toUpperCase(), x0 + 20, y + 18, `500 10px ${MONO}`, DARK ? WHITE : INK);
  }
  c.restore();
}
function headline(c: Ctx, t: number, a: number, b: number, l1: string, l2: string) {
  const i1 = seg(t, a, a + 0.6, out), i2 = seg(t, a + 0.15, a + 0.75, out), o = seg(t, b - 0.4, b);
  txt(c, l1, 20, 150 + (1 - i1) * 18 - o * 10, `400 36px ${SERIF}`, DARK ? WHITE : INK, i1 * (1 - o));
  txt(c, l2, 20, 186 + (1 - i2) * 18 - o * 10, `italic 400 36px ${SERIF}`, RED, i2 * (1 - o));
}
function note(c: Ctx, t: number, a: number, b: number, s: string, y: number) {
  const v = fade(t, a, a + 0.6, b - 0.5, b);
  txt(c, s, 20, y, `500 11px ${MONO}`, DARK ? "rgba(255,255,255,.85)" : ink(0.7), v);
}

// ---------- scenes ----------
function intro(c: Ctx, t: number, W: number, mid: number) {
  if (t > 5.4) return;
  const o = seg(t, 2.9, 3.6);
  const lines: [string, string, string][] = [["How brands", INK, `400 50px ${SERIF}`], ["are built", INK, `400 50px ${SERIF}`], ["through content.", RED, `italic 400 50px ${SERIF}`]];
  lines.forEach(([s, col, font], i) => {
    txt(c, s, W / 2, mid - 70 + i * 52 - o * 30 - i * o * 6, font, col, 1 - o, "center");
  });
  // the brand: a small mark that will travel through every step
  const m = seg(t, 3.3, 4.0, back) * (1 - seg(t, 4.7, 5.3));
  if (m > 0) {
    c.save(); c.translate(W / 2, mid); c.scale(m, m);
    box(c, -34, -34, 68, 68, 18, RED);
    txt(c, "b", 0, 16, `italic 400 52px ${SERIF}`, WHITE, 1, "center");
    c.restore();
    txt(c, "YOUR BRAND", W / 2, mid + 62, `500 11px ${MONO}`, INK, m, "center");
    txt(c, "a six-step content system", W / 2, mid + 82, `400 13px ${SANS}`, ink(0.6), m, "center");
  }
}

// ---------- photographs (Pexels licence; see docs/13-STRATEGY-REEL-SCRIPT.md) ----------
const PHOTO_SOURCES = {
  plan: "/media/reel/plan-notebook.jpg",
  operator: "/media/reel/film-camera-operator.jpg",
  rig: "/media/reel/film-camera-rig.jpg",
  desk: "/media/reel/edit-desk.jpg",
  timeline: "/media/reel/edit-timeline.jpg",
  phone: "/media/reel/post-phone.jpg",
} as const;
type PhotoKey = keyof typeof PHOTO_SOURCES;
const photos: Partial<Record<PhotoKey, HTMLImageElement>> = {};
let photosLoading: Promise<void> | null = null;

/** Starts loading the reel's photographs (once); resolves when all have loaded or failed. */
export function loadReelPhotos(): Promise<void> {
  if (!photosLoading) {
    photosLoading = Promise.all((Object.keys(PHOTO_SOURCES) as PhotoKey[]).map(key => new Promise<void>(resolve => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { photos[key] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = PHOTO_SOURCES[key];
    }))).then(() => undefined);
  }
  return photosLoading;
}

/** Whether the frame at `t` is a dark, full-bleed photo (the Reels chrome turns white over it). */
export function reelToneAt(t: number): "dark" | "light" {
  return t >= 12 && t < 27.95 ? "dark" : "light";
}

type Fit = { dx: number; dy: number; dw: number; dh: number };
const at = (m: Fit, u: number, v: number): [number, number] => [m.dx + u * m.dw, m.dy + v * m.dh];

/** Draws a photo to cover the rect, zoomed about a focus point (u, v in 0–1). No clipping. */
function photo(c: Ctx, key: PhotoKey, x: number, y: number, w: number, h: number, zoom = 1, fu = 0.5, fv = 0.5): Fit {
  const img = photos[key];
  const iw = img?.naturalWidth || 1067, ih = img?.naturalHeight || 1600;
  const s = Math.max(w / iw, h / ih) * zoom, dw = iw * s, dh = ih * s;
  const dx = Math.min(x, Math.max(x + w - dw, x + w / 2 - fu * dw)), dy = Math.min(y, Math.max(y + h - dh, y + h / 2 - fv * dh));
  if (img) c.drawImage(img, dx, dy, dw, dh);
  else { c.fillStyle = "#2a2524"; c.fillRect(x, y, w, h); }
  return { dx, dy, dw, dh };
}
/** Same, clipped to a rounded rect. */
function framed(c: Ctx, key: PhotoKey, x: number, y: number, w: number, h: number, r: number, zoom = 1, fu = 0.5, fv = 0.5): Fit {
  c.save(); rr(c, x, y, w, h, r); c.clip(); const m = photo(c, key, x, y, w, h, zoom, fu, fv); c.restore(); return m;
}
function desaturate(c: Ctx, x: number, y: number, w: number, h: number, k: number) {
  if (k <= 0 || w <= 0) return;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.globalCompositeOperation = "saturation"; c.fillStyle = `rgba(128,128,128,${clamp(k)})`; c.fillRect(x, y, w, h);
  c.globalCompositeOperation = "source-over"; c.fillStyle = `rgba(200,200,200,${0.18 * k})`; c.fillRect(x, y, w, h);
  c.restore();
}
function warmGrade(c: Ctx, x: number, y: number, w: number, h: number, k: number) {
  if (k <= 0 || w <= 0) return;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.globalCompositeOperation = "soft-light"; c.fillStyle = `rgba(255,140,50,${0.6 * k})`; c.fillRect(x, y, w, h);
  c.restore();
}
/** A hand-drawn marker stroke along points, drawn up to fraction p. */
function marker(c: Ctx, pts: [number, number][], p: number, color = RED, lw = 3) {
  if (p <= 0 || pts.length < 2) return;
  const n = (pts.length - 1) * clamp(p), whole = Math.floor(n);
  c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= whole; i++) c.lineTo(pts[i][0], pts[i][1]);
  if (whole < pts.length - 1) { const f = n - whole, a = pts[whole], b = pts[whole + 1]; c.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); }
  c.stroke(); c.restore();
}
function ellipsePts(cx: number, cy: number, rx: number, ry: number, seed: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 44; i++) { const a = -2.4 + (i / 44) * Math.PI * 2.15, w = 1 + (hash(seed + i) - 0.5) * 0.05; pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); }
  return pts;
}
const typed = (s: string, p: number) => s.slice(0, Math.round(s.length * clamp(p)));
function pill(c: Ctx, s: string, x: number, y: number, fill: string, color: string, font = `500 8px ${MONO}`, padX = 7, h = 16) {
  c.save(); c.font = font; const w = c.measureText(s).width + padX * 2; c.restore();
  box(c, x, y, w, h, h / 2, fill); txt(c, s, x + padX, y + h / 2 + 3, font, color);
  return w;
}
function topShade(c: Ctx, W: number, h = 270, a = 0.72) {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, W, h);
}
function bottomShade(c: Ctx, W: number, H: number, h = 300, a = 0.6) {
  const g = c.createLinearGradient(0, H - h, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`);
  c.fillStyle = g; c.fillRect(0, H - h, W, h);
}
/** The red wipe between Plan and Film: a slanted band that covers, then uncovers. */
function redWipe(c: Ctx, t: number, t0: number, W: number, H: number) {
  const p = raw(t, t0 - 0.35, t0 + 0.35);
  if (p <= 0 || p >= 1) return;
  const lead = lerp(-160, W + 160, io(clamp(p * 2))), trail = lerp(-160, W + 160, io(clamp(p * 2 - 1)));
  c.beginPath(); c.moveTo(trail - 80, H); c.lineTo(lead - 80, H); c.lineTo(lead + 80, 0); c.lineTo(trail + 80, 0); c.closePath();
  c.fillStyle = RED; c.fill();
}

// ---------- 01 Plan: a real person planning, a script that writes itself, a week of content ----------
function plan(c: Ctx, t: number, W: number, H: number, bottom: number) {
  if (t < 4.6 || t > 12.4) return;
  headline(c, t, 5, 12, "Plan", "the idea.");
  // marker underline under "idea."
  marker(c, [[56, 194], [80, 197], [104, 193], [128, 197], [150, 194]], seg(t, 5.9, 6.5, out) * (1 - seg(t, 11.4, 11.8)), RED, 3);
  const F = { x: 20, y: 214, w: W - 40, h: bottom - 214 };
  const exit = seg(t, 9.6, 10.2, io);
  // 1a + 1b: the photo opens out of a red circle, then becomes a tilted polaroid
  const r = 70 * seg(t, 5.0, 5.5, out), m = seg(t, 5.45, 6.1, io), q = seg(t, 7.3, 8.0, io);
  if (r > 0 && exit < 1) {
    const cx0 = W / 2, cy0 = F.y + F.h / 2;
    if (m < 1) { circle(c, cx0, cy0, r * 1.22 * (1 - m * 0.4), red(0.9 * (1 - m))); }
    const P = { x: 30, y: 222, w: 150, h: 182 };
    const bx = lerp(lerp(cx0 - r, F.x, m), P.x, q) - exit * 260, by = lerp(lerp(cy0 - r, F.y, m), P.y, q);
    const bw = lerp(lerp(2 * r, F.w, m), P.w, q), bh = lerp(lerp(2 * r, F.h, m), P.h, q), br = lerp(lerp(r, 18, m), 3, q);
    const rot = lerp(0, -0.07, q);
    c.save(); c.globalAlpha *= 1 - exit;
    c.translate(bx + bw / 2, by + bh / 2); c.rotate(rot); c.translate(-bw / 2, -bh / 2);
    if (q > 0) { c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 18 * q; c.shadowOffsetY = 8 * q; box(c, -7 * q, -7 * q, bw + 14 * q, bh + 34 * q, 3, WHITE); c.restore(); }
    c.save(); rr(c, 0, 0, bw, bh, br); c.clip();
    // before the polaroid, cover the final frame so the picture holds still while the mask opens
    if (q <= 0) photo(c, "plan", F.x - bx, F.y - by, F.w, F.h, lerp(1.32, 1.12, seg(t, 5, 7.3, out)), 0.43, 0.56);
    else photo(c, "plan", 0, 0, bw, bh, 1.12, 0.43, 0.56);
    c.restore();
    if (q > 0) txt(c, "the plan, day one", 4, bh + 22 * q, `italic 400 14px ${SERIF}`, INK, q);
    c.restore();
    const tag = fade(t, 6.2, 6.6, 7.2, 7.5);
    if (tag > 0) { c.save(); c.globalAlpha *= tag; pill(c, "SCRIPT · DRAFT 01", F.x + 12, F.y + F.h - 30, WHITE, INK); c.restore(); }
  }
  // 1b: the script page types itself
  const page = seg(t, 7.6, 8.2, out) * (1 - exit);
  if (page > 0) {
    const px = 176 + (1 - page) * 200 - exit * 260, py = 292, pw = 162, ph = 236;
    c.save(); c.translate(px + pw / 2, py + ph / 2); c.rotate(0.035); c.translate(-pw / 2, -ph / 2);
    c.save(); c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 14; c.shadowOffsetY = 6; box(c, 0, 0, pw, ph, 3, CREAM); c.restore();
    for (let i = 0; i < 11; i++) { c.fillStyle = ink(0.06); c.fillRect(10, 34 + i * 18, pw - 20, 1); }
    c.fillStyle = red(0.35); c.fillRect(24, 0, 1, ph);
    const lines: [string, string[], number, number][] = [
      ["HOOK", ["The secret is in", "the first sip."], 7.9, 8.5],
      ["STORY", ["From the bean", "to your cup."], 8.4, 9.0],
      ["CALL TO ACTION", ["Come taste it."], 8.9, 9.3],
    ];
    lines.forEach(([label, body, a, b], i) => {
      const y = 28 + i * 66;
      txt(c, label, 32, y, `500 7.5px ${MONO}`, RED, seg(t, a - 0.1, a + 0.1));
      const all = body.join("\n"), shown = typed(all, raw(t, a, b)).split("\n");
      shown.forEach((ln, k) => txt(c, ln, 32, y + 17 + k * 15, `600 11px ${SANS}`, INK));
    });
    marker(c, ellipsePts(86, 38, 64, 30, 3), seg(t, 9.0, 9.45, io), RED, 2.4);
    c.restore();
  }
  // sticky notes: the questions behind the plan
  const notes: [string[], number, number, number, number][] = [
    [["Who is", "it for?"], 22, 448, -0.06, 8.1],
    [["What should", "they remember?"], 92, 494, 0.05, 8.4],
    [["Where do", "they scroll?"], 28, 540, -0.03, 8.7],
  ];
  const toStrip = seg(t, 10.0, 10.5, io);
  notes.forEach(([s, x, y, rot, a], i) => {
    const p = seg(t, a, a + 0.45, back);
    if (p <= 0 || toStrip >= 1) return;
    const nx = lerp(-140, x, p) - exit * 40, tx = 30 + i * 80;
    const fx = lerp(nx, tx, toStrip), fy = lerp(y, 380, toStrip), sc = lerp(1, 0.4, toStrip);
    c.save(); c.globalAlpha *= 1 - toStrip; c.translate(fx + 55, fy + 32); c.rotate(rot * (1 - toStrip) + (1 - p) * 0.4); c.scale(sc, sc);
    c.save(); c.shadowColor = "rgba(0,0,0,.15)"; c.shadowBlur = 8; c.shadowOffsetY = 4; box(c, -55, -32, 110, 64, 2, i === 1 ? RED : CREAM); c.restore();
    s.forEach((ln, k) => txt(c, ln, -45, -6 + k * 16, `600 12px ${SANS}`, i === 1 ? WHITE : INK));
    c.restore();
  });
  // 1c: a week of content, made from the real shoots
  const strip = seg(t, 10.0, 10.4, out);
  if (strip > 0) {
    const days = "MON TUE WED THU FRI SAT SUN".split(" ");
    const kinds: [PhotoKey, string, number, number][] = [["operator", "REEL", 0.45, 0.35], ["plan", "POST", 0.45, 0.5], ["rig", "STORY", 0.5, 0.6], ["desk", "REEL", 0.7, 0.4], ["phone", "POST", 0.55, 0.5], ["timeline", "STORY", 0.6, 0.5], ["operator", "REEL", 0.6, 0.72]];
    const pan = lerp(20, -250, raw(t, 10.1, 12.0));
    days.forEach((d, i) => {
      const p = seg(t, 10.1 + i * 0.12, 10.5 + i * 0.12, back);
      if (p <= 0) return;
      const x = pan + i * 84, y = 348, w = 74, h = 120;
      c.save(); c.translate(x + w / 2, y + h / 2); c.scale(p, p); c.translate(-w / 2, -h / 2);
      txt(c, d, 0, -8, `500 8px ${MONO}`, ink(0.6));
      framed(c, kinds[i][0], 0, 0, w, h, 6, 1.5, kinds[i][2], kinds[i][3]);
      pill(c, kinds[i][1], 5, h - 21, kinds[i][1] === "REEL" ? RED : WHITE, kinds[i][1] === "REEL" ? WHITE : INK, `600 7px ${MONO}`, 5, 14);
      c.restore();
    });
  }
  note(c, t, 10.4, 11.8, "One idea. A week of content.", bottom);
}

// ---------- 02 Film: a real camera operator, a viewfinder, the camera's own monitor ----------
function film(c: Ctx, t: number, W: number, H: number, bottom: number) {
  if (t < 11.9 || t > 20.2) return;
  c.fillStyle = INK; c.fillRect(0, 0, W, H);
  const out2 = seg(t, 19.7, 20.1);
  c.save(); c.globalAlpha *= 1 - out2;
  const rigCut = t >= 16.2;
  if (!rigCut) {
    // 2a + 2b: the operator, then a punch-in on his face
    const punch = seg(t, 14.6, 14.9, out);
    const zoom = lerp(lerp(1.2, 1.04, seg(t, 12, 14.6, out)), lerp(1.55, 1.64, raw(t, 14.9, 16.2)), punch);
    const m = photo(c, "operator", 0, 0, W, H, zoom, lerp(0.47, 0.45, punch), lerp(0.45, 0.34, punch));
    // aperture opening onto the shot
    const ap = seg(t, 12.1, 12.95, io);
    if (ap < 1) {
      const R = 30 + ap * 560, rot = (1 - ap) * 1.4;
      c.beginPath(); c.rect(0, 0, W, H);
      for (let k = 6; k >= 0; k--) { const a = rot + (k / 6) * Math.PI * 2, x = W / 2 + Math.cos(a) * R, y = H / 2 + Math.sin(a) * R; if (k === 6) c.moveTo(x, y); else c.lineTo(x, y); }
      c.closePath(); c.fillStyle = INK; c.fill("evenodd");
      c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 1;
      for (let k = 0; k < 6; k++) { const a = rot + (k / 6) * Math.PI * 2, x = W / 2 + Math.cos(a) * R, y = H / 2 + Math.sin(a) * R; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + 1.2) * 400, y + Math.sin(a + 1.2) * 400); c.stroke(); }
    }
    topShade(c, W); bottomShade(c, W, H);
    // focus brackets hunt, then lock on the face
    const fb = fade(t, 14.9, 15.1, 16.0, 16.2);
    if (fb > 0) {
      const [fx, fy] = at(m, 0.44, 0.32), lock = seg(t, 15.4, 15.6), s = lerp(150, 78, seg(t, 14.9, 15.5, out));
      const jx = (1 - lock) * Math.sin(t * 31) * 6, jy = (1 - lock) * Math.cos(t * 27) * 5, L = 14;
      c.save(); c.globalAlpha *= fb; c.strokeStyle = lock > 0.5 ? RED : WHITE; c.lineWidth = 2;
      const x0 = fx - s / 2 + jx, y0 = fy - s / 2 + jy;
      for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x0 + s, y0, -1, 1], [x0, y0 + s, 1, -1], [x0 + s, y0 + s, -1, -1]]) { c.beginPath(); c.moveTo(x, y + dy * L); c.lineTo(x, y); c.lineTo(x + dx * L, y); c.stroke(); }
      if (lock > 0.5) pill(c, "AF LOCK", x0, y0 + s + 8, RED, WHITE);
      c.restore();
    }
  } else {
    // 2b: cut to the camera rig; its monitor shows what we just filmed
    const m = photo(c, "rig", 0, 0, W, H, lerp(1.28, 1.1, seg(t, 16.2, 17.6, out)), 0.5, 0.6);
    const [x0, y0] = at(m, 0.222, 0.522), [x1, y1] = at(m, 0.772, 0.752);
    c.save(); rr(c, x0, y0, x1 - x0, y1 - y0, 3); c.clip();
    photo(c, "operator", x0, y0, x1 - x0, y1 - y0, 1.5, 0.45, 0.33);
    c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1; const gw = (y1 - y0) * 9 / 16, gx = (x0 + x1) / 2 - gw / 2;
    c.strokeRect(gx, y0 - 2, gw, y1 - y0 + 4);
    circle(c, x0 + 10, y0 + 10, 3, Math.floor(t * 2) % 2 ? red(0.3) : RED);
    c.restore();
    const dim = seg(t, 17.8, 18.4);
    c.fillStyle = `rgba(21,19,19,${0.82 * dim})`; c.fillRect(0, 0, W, H);
    topShade(c, W); bottomShade(c, W, H);
    pill(c, "B-CAM", 20, 222, "rgba(0,0,0,.55)", WHITE);
  }
  const flash = fade(t, 16.1, 16.2, 16.25, 16.45);
  if (flash > 0) { c.fillStyle = `rgba(255,255,255,${flash})`; c.fillRect(0, 0, W, H); }
  headline(c, t, 12.4, 20, "Film it", "for real.");
  // viewfinder HUD over the operator shot
  const hud = fade(t, 13.2, 13.6, 16.0, 16.2);
  if (hud > 0) {
    c.save(); c.globalAlpha *= hud;
    const x0 = 16, y0 = 206, x1 = W - 16, y1 = bottom - 6, L = 18;
    c.strokeStyle = WHITE; c.lineWidth = 1.6;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { c.beginPath(); c.moveTo(x, y + dy * L); c.lineTo(x, y); c.lineTo(x + dx * L, y); c.stroke(); }
    circle(c, x0 + 14, y0 + 16, 3.6, Math.floor(t * 2) % 2 ? red(0.35) : RED);
    txt(c, "REC", x0 + 22, y0 + 20, `500 9px ${MONO}`, WHITE);
    const f = Math.max(0, Math.floor((t - 13.2) * 2.4 * 25));
    txt(c, `00:00:${String(Math.floor(f / 25)).padStart(2, "0")}:${String(f % 25).padStart(2, "0")}`, x1 - 10, y0 + 20, `500 9px ${MONO}`, WHITE, 1, "right");
    txt(c, "4K · 25P · ISO 800 · 1/50", x0 + 10, y1 - 10, `500 8px ${MONO}`, WHITE);
    box(c, x1 - 34, y1 - 19, 22, 10, 2, undefined, WHITE, 1); c.fillStyle = WHITE; c.fillRect(x1 - 32, y1 - 17, 13, 6);
    c.strokeStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.moveTo(W / 2 - 8, H / 2); c.lineTo(W / 2 + 8, H / 2); c.moveTo(W / 2, H / 2 - 8); c.lineTo(W / 2, H / 2 + 8); c.stroke();
    c.restore();
  }
  // 2c: the slate, then the takes on a film strip
  const slate = seg(t, 17.3, 17.6, out) * (1 - seg(t, 18.2, 18.5));
  if (slate > 0) {
    const close = seg(t, 17.6, 17.78, x => x * x);
    c.save(); c.translate(W / 2, 400); c.scale(lerp(1.7, 1, slate), lerp(1.7, 1, slate)); c.rotate(lerp(0.3, -0.06, slate)); c.globalAlpha *= slate;
    box(c, -88, -20, 176, 108, 5, INK, "rgba(255,255,255,.4)", 1);
    txt(c, "BUZZLY", -76, 8, `500 10px ${MONO}`, WHITE); txt(c, "SCENE 01", -76, 32, `500 13px ${MONO}`, WHITE); txt(c, "TAKE 3", 10, 32, `500 13px ${MONO}`, RED);
    c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(-76, 44, 152, 1); txt(c, "ROLL A · 9:16", -76, 66, `500 9px ${MONO}`, "rgba(255,255,255,.7)");
    c.save(); c.translate(-88, -20); c.rotate(-0.55 * (1 - close));
    box(c, 0, -22, 176, 22, 3, WHITE);
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(10 + k * 28, -22); c.lineTo(24 + k * 28, 0); c.lineTo(36 + k * 28, 0); c.lineTo(22 + k * 28, -22); c.closePath(); c.fillStyle = INK; c.fill(); }
    c.restore(); c.restore();
    const ring = raw(t, 17.78, 18.15);
    if (ring > 0 && ring < 1) circle(c, W / 2, 400, 60 + ring * 160, undefined, `rgba(255,255,255,${0.6 * (1 - ring)})`, 3);
  }
  c.restore();
  if (t > 18.0 && t < 19.9) {
    const s = seg(t, 18.0, 18.6, out);
    c.save(); c.globalAlpha *= s * (1 - seg(t, 19.5, 19.8));
    const x = stripX(t), y = STRIP_Y;
    c.fillStyle = "#0b0a0a"; c.fillRect(x - 12, y - 22, 4 * 94 + 14, 112 + 44);
    for (let k = 0; k < 26; k++) { box(c, x - 6 + k * 15, y - 15, 8, 7, 1.5, "rgba(255,255,255,.75)"); box(c, x - 6 + k * 15, y + 120, 8, 7, 1.5, "rgba(255,255,255,.75)"); }
    c.restore();
    for (let i = 0; i < 4; i++) stripFrame(c, t, i);
  }
  note(c, t, 18.4, 19.8, "Shoot vertical. Capture real moments.", bottom);
}
const STRIP_Y = 360;
const stripX = (t: number) => lerp(380, 26, seg(t, 18.0, 18.7, out)) - raw(t, 18.7, 19.8) * 14;
const TAKES: [PhotoKey, number, number, number][] = [["operator", 2.0, 0.45, 0.32], ["rig", 1.5, 0.5, 0.64], ["operator", 2.1, 0.6, 0.73], ["rig", 1.7, 0.75, 0.2]];
function stripFrame(c: Ctx, t: number, i: number) {
  if (t < 18.0 || t >= 19.7) return;
  const s = seg(t, 18.0, 18.6, out);
  if (s <= 0) return;
  const x = stripX(t) + i * 94, y = STRIP_Y, [key, z, u, v] = TAKES[i];
  c.save(); c.globalAlpha *= s; framed(c, key, x, y, 84, 112, 2, z, u, v); c.restore();
}

// ---------- 03 Edit: a real editor, a zoom through the monitor, the cut, the grade ----------
function edit(c: Ctx, t: number, W: number, H: number, bottom: number) {
  if (t < 19.6 || t > 28.2) return;
  const inA = seg(t, 19.7, 20.1);
  c.save(); c.globalAlpha *= inA;
  if (t < 23.1) {
    // 3a: the editor at the desk; push in toward the right-hand monitor, then zoom through it
    const through = seg(t, 22.4, 23.0, x => x * x * x);
    const zoom = lerp(lerp(1.08, 1.3, raw(t, 19.7, 22.4)), 2.5, through);
    const m = photo(c, "desk", 0, 0, W, H, zoom, lerp(0.64, 0.76, through), lerp(0.43, 0.39, through));
    const [x0, y0] = at(m, 0.562, 0.287), [x1, y1] = at(m, 0.958, 0.493);
    topShade(c, W, 270, 0.6 * (1 - through));
    // the takes land on the monitor
    TAKES.forEach(([key, z, u, v], i) => {
      const p = seg(t, 19.7 + i * 0.1, 20.6 + i * 0.1, io), sw = (x1 - x0 - 10) / 4;
      const tx = x0 + 4 + i * (sw + 0.7), ty = y1 - sw * 0.9 - 6;
      const fx = lerp(stripX(19.7) + i * 94, tx, p), fy = lerp(STRIP_Y, ty, p), w = lerp(84, sw - 2, p), h = lerp(112, sw * 0.9, p);
      if (p < 1) { c.save(); c.globalAlpha = 1; framed(c, key, fx, fy, w, h, 2, z, u, v); c.restore(); }
      else framed(c, key, tx, ty, sw - 2, sw * 0.9, 1, z, u, v);
    });
    // a red outline traces the monitor
    const tr = seg(t, 21.0, 21.8, io) * (1 - through);
    if (tr > 0) {
      const per = 2 * ((x1 - x0) + (y1 - y0)), len = per * tr, pts: [number, number][] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
      c.save(); c.strokeStyle = RED; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0, y0); let left = len;
      for (let k = 1; k < pts.length && left > 0; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k], d = Math.hypot(bx - ax, by - ay), f = Math.min(1, left / d); c.lineTo(lerp(ax, bx, f), lerp(ay, by, f)); left -= d; }
      c.stroke(); c.restore();
      if (tr >= 1) pill(c, "TIMELINE · REEL_V3", x0, y0 - 22, RED, WHITE);
    }
  }
  // 3b: inside the monitor, a real timeline with our edit on top
  const tlIn = seg(t, 22.85, 23.1);
  if (tlIn > 0 && t < 25.9) {
    c.save(); c.globalAlpha *= tlIn;
    photo(c, "timeline", 0, 0, W, H, lerp(1.3, 1.12, seg(t, 22.9, 25.4, out)), lerp(0.55, 0.66, raw(t, 22.9, 25.4)), 0.5);
    c.fillStyle = "rgba(21,19,19,.35)"; c.fillRect(0, 0, W, H);
    topShade(c, W, 260, 0.7);
    // the takes drop onto a track
    TAKES.forEach(([key, z, u, v], i) => {
      const p = seg(t, 23.1 + i * 0.12, 23.45 + i * 0.12, back);
      if (p <= 0) return;
      const x = 22 + i * 80, y = lerp(470, 520, p), cut = i === 1 && t > 24.2;
      c.save(); c.globalAlpha *= clamp(p * 2);
      if (cut) { const g = 6 * (1 - seg(t, 24.5, 24.8)); framed(c, key, x, y, 34, 44, 3, z, u, v); framed(c, key, x + 36 + g, y, 36 - g, 44, 3, z * 1.1, u, v); }
      else framed(c, key, x, y, 72, 44, 3, z, u, v);
      box(c, x, y, 72, 44, 3, undefined, "rgba(255,255,255,.7)", 1);
      c.restore();
    });
    // the playhead runs across
    const ph = raw(t, 23.3, 25.4), hx = lerp(18, W - 18, ph);
    c.fillStyle = RED; c.fillRect(hx - 1, 214, 2, bottom - 214);
    c.beginPath(); c.moveTo(hx - 6, 210); c.lineTo(hx + 6, 210); c.lineTo(hx, 219); c.closePath(); c.fill();
    // hook, cut, captions, sound
    const hook = seg(t, 23.6, 23.95, back);
    if (hook > 0) { c.save(); c.translate(W / 2, 262); c.scale(hook, hook); box(c, -78, -18, 156, 36, 18, WHITE); txt(c, "Wait for it…", 0, 7, `italic 400 22px ${SERIF}`, RED, 1, "center"); c.restore(); }
    const cutF = fade(t, 24.15, 24.2, 24.3, 24.6);
    if (cutF > 0) { c.fillStyle = `rgba(255,255,255,${cutF})`; c.fillRect(132, 214, 3, bottom - 214); pill(c, "CUT", 140, 430, WHITE, INK); }
    const cap = seg(t, 24.6, 24.9, out);
    if (cap > 0) { c.save(); c.globalAlpha *= cap; box(c, 46, 312, W - 92, 30, 6, "rgba(21,19,19,.85)"); txt(c, "Made fresh every morning.", W / 2, 332, `600 13px ${SANS}`, WHITE, 1, "center"); c.restore(); }
    const wave = seg(t, 24.9, 25.2, out);
    for (let i = 0; i < 64; i++) { const x = 20 + i * ((W - 40) / 63), h = (3 + 16 * Math.abs(Math.sin(i * 0.7 + t * 4) * Math.sin(i * 0.23))) * wave; c.fillStyle = i / 63 < ph ? RED : "rgba(255,255,255,.75)"; c.fillRect(x - 1, 590 - h / 2, 2, h); }
    const chips: [string, number][] = [["HOOK", 23.6], ["CUT", 24.2], ["CAPTIONS", 24.6], ["SOUND", 24.9]];
    let cx = 22; chips.forEach(([s, a2]) => { const on = t >= a2; cx += pill(c, s, cx, 380, on ? RED : "rgba(255,255,255,.18)", WHITE) + 6; });
    c.restore();
  }
  // 3c: the grade, raw against graded, then the export
  const gIn = seg(t, 25.4, 25.75);
  if (gIn > 0) {
    c.save(); c.globalAlpha *= gIn;
    photo(c, "operator", 0, 0, W, H, lerp(1.16, 1.08, raw(t, 25.4, 28)), 0.47, 0.42);
    const div = lerp(W, 46, seg(t, 25.75, 26.8, io));
    desaturate(c, 0, 0, div, H, 1);
    warmGrade(c, div, 0, W - div, H, 1);
    topShade(c, W, 260, 0.65); bottomShade(c, W, H, 260, 0.5);
    c.fillStyle = WHITE; c.fillRect(div - 1, 206, 2, bottom - 206);
    circle(c, div, (206 + bottom) / 2, 13, WHITE);
    c.fillStyle = INK; c.beginPath(); c.moveTo(div - 8, (206 + bottom) / 2); c.lineTo(div - 3, (206 + bottom) / 2 - 4); c.lineTo(div - 3, (206 + bottom) / 2 + 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(div + 8, (206 + bottom) / 2); c.lineTo(div + 3, (206 + bottom) / 2 - 4); c.lineTo(div + 3, (206 + bottom) / 2 + 4); c.closePath(); c.fill();
    if (div > 90) pill(c, "RAW", 20, 222, "rgba(0,0,0,.55)", WHITE);
    if (div < W - 80) pill(c, "GRADED", W - 76, 222, RED, WHITE);
    // export
    const ex = seg(t, 26.9, 27.2, out);
    if (ex > 0) {
      c.fillStyle = `rgba(21,19,19,${0.5 * ex})`; c.fillRect(0, 0, W, H);
      const cy = 420, p = seg(t, 27.0, 27.6, x => x), done = t >= 27.6;
      c.save(); c.globalAlpha *= ex;
      circle(c, W / 2, cy, 46, "rgba(21,19,19,.6)", "rgba(255,255,255,.25)", 4);
      c.strokeStyle = done ? WHITE : RED; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.arc(W / 2, cy, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke();
      if (done) check(c, W / 2, cy, 26, WHITE, 3.5); else txt(c, "EXPORTING", W / 2, cy + 3, `500 8px ${MONO}`, WHITE, 1, "center");
      txt(c, done ? "Exported · 9:16 reel" : "", W / 2, cy + 74, `600 13px ${SANS}`, WHITE, 1, "center");
      c.restore();
    }
    c.restore();
  }
  headline(c, t, 20, 25.5, "Edit for", "the scroll.");
  note(c, t, 25.8, 27.8, "Hook. Story. Captions. Sound.", bottom);
  c.restore();
  const flashOut = fade(t, 27.75, 27.95, 28.0, 28.35);
  if (flashOut > 0) { c.fillStyle = `rgba(255,255,255,${flashOut})`; c.fillRect(0, 0, W, H); }
}

/** The finished reel, drawn in a 100 × 200 box (used on the phone screen in Post). */
function miniReel(c: Ctx, t: number) {
  c.save(); rr(c, 0, 0, 100, 200, 4); c.clip();
  photo(c, "operator", 0, 0, 100, 200, 1.15, 0.46, 0.4);
  warmGrade(c, 0, 0, 100, 200, 1);
  const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.55)"); c.fillStyle = g; c.fillRect(0, 120, 100, 80);
  box(c, 22, 26, 56, 13, 6.5, WHITE); txt(c, "Wait for it…", 50, 35.5, `italic 400 8.5px ${SERIF}`, RED, 1, "center");
  [0, 1, 2, 3].forEach(k => circle(c, 90, 120 + k * 13, 3.2, WHITE));
  txt(c, "buzzly", 8, 182, `600 6.5px ${SANS}`, WHITE);
  c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(0, 197, 100, 1.5); c.fillStyle = RED; c.fillRect(0, 197, 100 * ((t * 0.37) % 1), 1.5);
  c.restore();
}

// ---------- 04 Post: a real phone, the reel on its screen, the strategy, many formats ----------
function post(c: Ctx, t: number, W: number, H: number, bottom: number) {
  if (t < 27.95 || t > 35.6) return;
  const leave = seg(t, 32.8, 33.2, io), swipe = seg(t, 34.65, 35.0, io);
  c.save(); c.translate(0, -swipe * H);
  // 4a + 4b: the phone photo as a tall card, then a short card at the top
  const card = seg(t, 30.3, 30.9, io), enter = seg(t, 28.0, 28.45, out);
  if (leave < 1) {
    c.save(); c.globalAlpha *= (1 - leave) * enter;
    const x = 20, w = W - 40, y = 214 - leave * 120, h = lerp(bottom - 214, 150, card) * lerp(1.06, 1, enter), r = 16;
    c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 20; c.shadowOffsetY = 8; box(c, x, y, w, h, r, "#bfbcb8"); c.restore();
    c.save(); rr(c, x, y, w, h, r); c.clip();
    const m = photo(c, "phone", x, y, w, h, lerp(lerp(1.1, 1.0, seg(t, 28, 30.3, out)), 1.05, card), 0.57, lerp(0.5, 0.42, card));
    // the exported reel lands on the phone's screen (affine fit to three of its corners)
    const T = at(m, 0.524, 0.182), Rr = at(m, 0.978, 0.325), Lc = at(m, 0.157, 0.70);
    const land = seg(t, 28.35, 29.05, io);
    const ax = lerp(w / 100, (Rr[0] - T[0]) / 100, land), bx = lerp(0, (Rr[1] - T[1]) / 100, land);
    const cx2 = lerp(0, (Lc[0] - T[0]) / 200, land), dy = lerp(h / 200, (Lc[1] - T[1]) / 200, land);
    c.save(); c.transform(ax, bx, cx2, dy, lerp(x, T[0], land), lerp(y, T[1], land)); miniReel(c, t); c.restore();
    const glow = raw(t, 29.3, 30.1);
    if (glow > 0 && glow < 1) {
      c.save(); c.strokeStyle = red(1 - glow); c.lineWidth = 2 + glow * 7; const Bc: [number, number] = [Rr[0] + Lc[0] - T[0], Rr[1] + Lc[1] - T[1]];
      c.beginPath(); c.moveTo(T[0], T[1]); c.lineTo(Rr[0], Rr[1]); c.lineTo(Bc[0], Bc[1]); c.lineTo(Lc[0], Lc[1]); c.closePath(); c.stroke(); c.restore();
    }
    c.restore();
    const lab = fade(t, 29.4, 29.8, 30.2, 30.5);
    if (lab > 0) { c.save(); c.globalAlpha *= lab; pill(c, "READY TO POST", x + 12, y + h - 30, WHITE, INK); c.restore(); }
    c.restore();
  }
  headline(c, t, 28.2, 35, "Post with", "a strategy.");
  // 4b: the strategy, ticked off one by one
  const listIn = seg(t, 30.6, 31.0, out) * (1 - leave);
  if (listIn > 0) {
    const items = ["Hook in the first seconds", "A cover that reads small", "Keywords in the caption", "Post when your audience is online", "Reply to every comment"];
    c.save(); c.globalAlpha *= listIn; c.translate(0, -leave * 120);
    items.forEach((s, i) => {
      const a = 30.8 + i * 0.36, p = seg(t, a, a + 0.3, out), y = 392 + i * 40;
      if (p <= 0) return;
      c.save(); c.globalAlpha *= p; c.translate((1 - p) * 30, 0);
      c.fillStyle = ink(0.1); c.fillRect(20, y + 16, W - 40, 1);
      box(c, 20, y - 12, 18, 18, 4, undefined, ink(0.35), 1.2);
      txt(c, s, 48, y + 2, `500 13px ${SANS}`, INK);
      if (i === 3) { const ang = t * 3; circle(c, W - 34, y - 3, 9, undefined, INK, 1.4); c.strokeStyle = RED; c.lineWidth = 1.6; c.beginPath(); c.moveTo(W - 34, y - 3); c.lineTo(W - 34 + Math.cos(ang) * 6, y - 3 + Math.sin(ang) * 6); c.stroke(); }
      c.restore();
      marker(c, [[21, y - 4], [27, y + 3], [42, y - 14]], seg(t, a + 0.2, a + 0.45, out), RED, 3);
    });
    c.restore();
  }
  // 4c: one reel, many formats, into the grid
  const fan = seg(t, 33.0, 33.5, out);
  if (fan > 0) {
    const toGrid = seg(t, 33.9, 34.4, io);
    const fmts: [PhotoKey, string, number, number, number][] = [["operator", "REEL", 72, 0.46, 0.4], ["rig", "CAROUSEL", 180, 0.5, 0.62], ["plan", "STORY", 288, 0.43, 0.56]];
    const gx = 26, gy = 300, tw = (W - 52 - 8) / 3, th = tw * 1.25;
    const grid: [PhotoKey, number, number][] = [["operator", 0.46, 0.4], ["rig", 0.5, 0.62], ["plan", 0.43, 0.56], ["desk", 0.7, 0.4], ["timeline", 0.6, 0.5], ["phone", 0.55, 0.5]];
    if (toGrid > 0) grid.forEach(([key, u, v], i) => {
      if (i < 3) return;
      const p = seg(t, 34.0 + (i - 3) * 0.08, 34.35 + (i - 3) * 0.08, out);
      framed(c, key, gx + (i % 3) * (tw + 4), gy + Math.floor(i / 3) * (th + 4) + (1 - p) * 20, tw, th, 2, 1.4, u, v);
    });
    fmts.forEach(([key, label, x, u, v], i) => {
      const p = seg(t, 33.0 + i * 0.12, 33.5 + i * 0.12, back);
      const w0 = 90, h0 = 160, fx = lerp(W / 2, x, p), fy = 420;
      const gxi = gx + i * (tw + 4) + tw / 2, gyi = gy + th / 2;
      const cxp = lerp(fx, gxi, toGrid), cyp = lerp(fy, gyi, toGrid), w = lerp(w0 * p, tw, toGrid), h = lerp(h0 * p, th, toGrid);
      if (w < 2) return;
      if (label === "CAROUSEL" && toGrid < 1) { c.save(); c.globalAlpha *= 1 - toGrid; box(c, cxp - w / 2 + 7, cyp - h / 2 - 7, w, h, 6, CREAM); c.restore(); }
      framed(c, key, cxp - w / 2, cyp - h / 2, w, h, lerp(8, 2, toGrid), 1.3, u, v);
      if (label === "STORY" && toGrid < 1) { c.save(); c.globalAlpha *= 1 - toGrid; rr(c, cxp - w / 2 - 3, cyp - h / 2 - 3, w + 6, h + 6, 10); c.strokeStyle = RED; c.lineWidth = 2.5; c.stroke(); c.restore(); }
      if (label === "REEL") { play(c, cxp, cyp, 14 * lerp(1, 0.7, toGrid), WHITE); if (toGrid > 0.9) { rr(c, cxp - w / 2, cyp - h / 2, w, h, 2); c.strokeStyle = RED; c.lineWidth = 2.5; c.stroke(); } }
      txt(c, label, cxp, cyp + h / 2 + 16, `500 9px ${MONO}`, INK, (1 - toGrid) * p, "center");
    });
    const toast = fade(t, 34.35, 34.55, 34.9, 35.0);
    if (toast > 0) { c.save(); c.globalAlpha *= toast; const y = gy + 2 * (th + 4) + 26; box(c, W / 2 - 62, y - 15, 124, 30, 15, INK); circle(c, W / 2 - 41, y, 9, RED); check(c, W / 2 - 41, y, 9, WHITE, 2); txt(c, "Posted", W / 2 - 25, y + 5, `600 13px ${SANS}`, WHITE); c.restore(); }
  }
  note(c, t, 33.3, 34.7, "One shoot. Many formats. Every week.", bottom);
  c.restore();
}

function reach(c: Ctx, t: number, W: number, mid: number, bottom: number) {
  if (t < 34.6 || t > 42.6) return;
  headline(c, t, 35, 42, "Reach the", "right people.");
  const a = fade(t, 35.05, 35.6, 41.6, 42.05);
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  const cx = W / 2 - 10, cy = mid - 28;
  // audience rings: people light up as the post travels; the outer ring only partly (the right people, not everyone)
  const rings = [{ r: 62, n: 8, at: 36.2 }, { r: 104, n: 13, at: 37.0 }, { r: 146, n: 18, at: 37.9 }];
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i++) {
      const ang = (i / ring.n) * Math.PI * 2 + ri * 0.3, x = cx + Math.cos(ang) * ring.r, y = cy + Math.sin(ang) * ring.r * 0.92;
      if (y > bottom - 26 || x < 14 || x > W - 14) continue;
      const fits = ri < 2 || hash(i + 7) > 0.45;
      const lit = fits ? seg(t, ring.at + hash(i + ri * 31) * 0.6, ring.at + 0.4 + hash(i + ri * 31) * 0.6, out) : 0;
      person(c, x, y, 14, lit > 0 ? `rgba(${Math.round(lerp(200, 21, lit))},${Math.round(lerp(196, 19, lit))},${Math.round(lerp(188, 19, lit))},1)` : "rgba(200,196,188,1)");
      if (lit > 0.6 && ri > 0 && fits) { // shared on from the ring inside
        const pa = ang - 0.12, px = cx + Math.cos(pa) * rings[ri - 1].r, py = cy + Math.sin(pa) * rings[ri - 1].r * 0.92;
        c.strokeStyle = red(0.35 * (lit - 0.6) / 0.4); c.lineWidth = 1; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
      }
    }
  });
  // the post in the middle
  const p = seg(t, 35.5, 36.0, back);
  c.save(); c.translate(cx, cy); c.scale(p, p); box(c, -20, -32, 40, 64, 8, RED); play(c, 0, 0, 12, WHITE); c.restore();
  // reactions float up
  for (let i = 0; i < 26; i++) {
    const start = 36.0 + hash(i) * 4.6, q = raw(t, start, start + 1.6);
    if (q <= 0 || q >= 1) continue;
    const x = cx + (hash(i + 3) - 0.5) * 200 + Math.sin(q * 6 + i) * 8, y = cy + 20 - q * 150, s = 12 + hash(i + 9) * 6, al = Math.sin(q * Math.PI);
    c.save(); c.globalAlpha *= al;
    const k = i % 4;
    if (k === 0) heart(c, x, y, s, RED); else if (k === 1) bubble(c, x, y, s, INK); else if (k === 2) plane(c, x, y, s, INK); else bookmark(c, x, y, s, RED);
    c.restore();
  }
  c.restore();
  // what the reactions mean, as a legend
  const lg = fade(t, 37.4, 38.0, 41.4, 42);
  if (lg > 0) {
    const y = bottom - 24, items: [string, (x: number) => void][] = [
      ["Watch", x => play(c, x, y - 4, 10, INK)], ["Save", x => bookmark(c, x, y - 4, 12, RED)], ["Share", x => plane(c, x, y - 4, 12, INK)], ["Follow", x => person(c, x, y - 4, 12, INK)],
    ];
    c.save(); c.globalAlpha = lg;
    items.forEach(([s, draw], i) => { const x = 28 + i * 80; draw(x); txt(c, s, x + 12, y, `500 11px ${MONO}`, INK); });
    c.restore();
  }
  note(c, t, 38.4, 42, "The right people find it, and pass it on.", bottom);
}

function clients(c: Ctx, t: number, W: number, mid: number, bottom: number) {
  if (t < 41.6 || t > 48.1) return;
  headline(c, t, 42, 47.6, "Turn viewers", "into clients.");
  const a = fade(t, 42.05, 42.6, 47.2, 47.65);
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  const msgs = [
    { s: "Hi! Is this available?", me: false, at: 42.6 },
    { s: "Can I book for Saturday?", me: false, at: 43.1 },
    { s: "Yes, here’s the link.", me: true, at: 43.7 },
  ];
  const chatOut = seg(t, 44.6, 45.0);
  msgs.forEach((m, i) => {
    const p = seg(t, m.at, m.at + 0.45, back) * (1 - chatOut);
    if (p <= 0) return;
    c.save(); c.font = `500 13px ${SANS}`; const w = c.measureText(m.s).width + 26; c.restore();
    const y = mid - 140 + i * 42, x = m.me ? W - 24 - w : 24;
    c.save(); c.translate(x + (m.me ? w : 0), y); c.scale(p, p); c.translate(m.me ? -w : 0, 0);
    box(c, 0, 0, w, 32, 16, m.me ? RED : CREAM); txt(c, m.s, 13, 21, `500 13px ${SANS}`, m.me ? WHITE : INK);
    c.restore();
  });
  // the funnel: no numbers, just the shape of it
  const fn = seg(t, 44.8, 45.4, out);
  if (fn > 0) {
    const stages = ["Viewers", "Followers", "Enquiries", "Clients"], y0 = mid - 150, h = 40;
    stages.forEach((s, i) => {
      const p = seg(t, 44.8 + i * 0.2, 45.3 + i * 0.2, out), w = (280 - i * 52) * p, y = y0 + i * (h + 6);
      box(c, (W - w) / 2, y, w, h, 6, i === 3 ? RED : i === 0 ? CREAM : i === 1 ? ink(0.12) : ink(0.75));
      txt(c, s, W / 2, y + 26, `500 13px ${SANS}`, i >= 2 ? WHITE : INK, p, "center");
    });
    const drop = raw(t, 45.9, 46.9);
    if (drop > 0 && drop < 1) circle(c, W / 2 + 70 * (1 - drop), y0 - 10 + drop * 4 * (h + 6), 5, RED);
    const won = seg(t, 46.8, 47.2, back);
    if (won > 0) {
      const y = y0 + 4 * (h + 6) + 30;
      c.save(); c.translate(W / 2, y); c.scale(won, won); circle(c, 0, 0, 16, INK); check(c, 0, 0, 14, WHITE, 2.4); c.restore();
    }
  }
  c.restore();
  note(c, t, 45.2, 47.6, "Content builds trust. Trust brings business.", bottom);
}

function outro(c: Ctx, t: number, W: number, mid: number) {
  if (t < 47.4) return;
  const a = seg(t, 47.6, 48.2, out);
  // the loop: every round starts again, smarter
  const cx = W / 2, cy = mid - 96, r = 74, draw = seg(t, 47.6, 48.6, io);
  c.save(); c.globalAlpha = a;
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw); c.stroke();
  const head = -Math.PI / 2 + Math.PI * 2 * draw;
  circle(c, cx + Math.cos(head) * r, cy + Math.sin(head) * r, 4.5, RED);
  REEL_CHAPTERS.forEach((ch, i) => {
    const ang = -Math.PI / 2 + (i / 6) * Math.PI * 2, v = seg(t, 47.7 + i * 0.12, 48.1 + i * 0.12, out);
    const x = cx + Math.cos(ang) * (r + 24), y = cy + Math.sin(ang) * (r + 18) + 4;
    txt(c, ch.name, x, y, `500 10px ${MONO}`, INK, v, "center");
  });
  txt(c, "Repeat.", cx, cy - 4, `400 22px ${SERIF}`, INK, seg(t, 48.2, 48.6, out), "center");
  txt(c, "Learn. Grow.", cx, cy + 20, `italic 400 22px ${SERIF}`, RED, seg(t, 48.3, 48.7, out), "center");
  const e1 = seg(t, 48.6, 49.2, out), e2 = seg(t, 48.8, 49.4, out);
  txt(c, "We build brands", cx, mid + 40 + (1 - e1) * 16, `400 40px ${SERIF}`, INK, e1, "center");
  txt(c, "through content.", cx, mid + 82 + (1 - e2) * 16, `italic 400 40px ${SERIF}`, RED, e2, "center");
  txt(c, "BUZZLY", cx, mid + 116, `500 11px ${MONO}`, ink(0.6), seg(t, 49.2, 49.7, out), "center");
  c.restore();
}

/** Paint the reel at story-time `t` into a W × H space (W is 360 units). */
export function drawStrategyReel(c: Ctx, t: number, W: number, H: number) {
  t = clamp(t, 0, REEL_DURATION);
  c.save();
  c.fillStyle = WHITE; c.fillRect(0, 0, W, H);
  const top = 214, bottom = H - 190, mid = (top + bottom) / 2 + 30;
  intro(c, t, W, (H - 110) / 2);
  DARK = reelToneAt(t) === "dark";
  plan(c, t, W, H, bottom);
  film(c, t, W, H, bottom);
  edit(c, t, W, H, bottom);
  post(c, t, W, H, bottom);
  redWipe(c, t, 12, W, H);
  reach(c, t, W, mid, bottom);
  clients(c, t, W, mid, bottom);
  outro(c, t, W, (H - 110) / 2 + 40);
  chapterBars(c, t, W);
  c.restore();
}
