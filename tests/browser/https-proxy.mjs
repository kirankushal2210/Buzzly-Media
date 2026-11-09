// Local HTTPS front for the production build, used only by Playwright.
//
// Why: the production Content-Security-Policy includes `upgrade-insecure-requests`.
// Chromium and Firefox exempt http://127.0.0.1 from it, but WebKit does not, so on a
// plain-HTTP local server WebKit rewrites every script, font and API call to https://
// and they fail. Real deployments are HTTPS, so the tests run over HTTPS too instead of
// weakening the production policy. The certificate is self-signed, generated per run,
// and lives in the OS temp folder.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [listenPort = "38443", targetPort = "38472"] = process.argv.slice(2);
const dir = join(tmpdir(), "buzzly-qa-cert");
const key = join(dir, "key.pem");
const cert = join(dir, "cert.pem");
if (!existsSync(key) || !existsSync(cert)) {
  mkdirSync(dir, { recursive: true });
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "2",
    "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost",
    "-keyout", key, "-out", cert], { stdio: "ignore" });
}

createServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
  const upstream = httpRequest({
    host: "127.0.0.1",
    port: Number(targetPort),
    method: req.method,
    path: req.url,
    headers: { ...req.headers, "x-forwarded-proto": "https" },
  }, response => {
    res.writeHead(response.statusCode ?? 502, response.headers);
    response.pipe(res);
  });
  upstream.on("error", () => { if (!res.headersSent) res.writeHead(502); res.end(); });
  req.pipe(upstream);
}).listen(Number(listenPort), "127.0.0.1", () => {
  console.log(`QA HTTPS proxy https://127.0.0.1:${listenPort} -> http://127.0.0.1:${targetPort}`);
});
