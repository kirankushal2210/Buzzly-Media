import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET, POST } from "../app/api/contact/route.ts";
import { CONTACT_LIMITS } from "../lib/rate-limit.ts";

/**
 * Exercises the real POST /api/contact handler in-process: no database (as on
 * Vercel), a local HTTP server standing in for the lead webhook, and the
 * in-memory rate limiter. Every request gets its own client IP unless a test
 * deliberately reuses one.
 */

const ENDPOINT = "http://localhost:5173/api/contact";
let ipCounter = 0;
const nextIp = () => { ipCounter += 1; return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`; };

function post(body: unknown, headers: Record<string, string> = {}, ip = nextIp()) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return POST(new NextRequest(ENDPOINT, {
    method: "POST",
    body: raw,
    headers: {
      "content-type": "application/json",
      host: "localhost:5173",
      origin: "http://localhost:5173",
      "x-forwarded-for": ip,
      ...headers,
    },
  }));
}

const validInquiry = (overrides: Record<string, unknown> = {}) => ({
  name: "Test Person",
  email: `person-${Math.random().toString(36).slice(2)}@example.com`,
  company: "Example Co",
  interest: "content",
  message: "This is a realistic inquiry message that is long enough to pass validation.",
  ...overrides,
});

type Received = { headers: Record<string, string | string[] | undefined>; body: Record<string, unknown> };
const received: Received[] = [];
let server: Server;
let webhookUrl: string;

before(async () => {
  server = createServer((req, res) => {
    let data = "";
    req.on("data", chunk => { data += chunk; });
    req.on("end", () => {
      if (req.url === "/fail") { res.statusCode = 500; res.end("boom"); return; }
      received.push({ headers: req.headers, body: JSON.parse(data) });
      res.statusCode = 200;
      res.end("ok");
    });
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  webhookUrl = `http://localhost:${port}`;
});

after(() => new Promise<void>(resolve => server.close(() => resolve())));

const withWebhook = async (path: string, run: () => Promise<void>) => {
  process.env.LEAD_WEBHOOK_URL = `${webhookUrl}${path}`;
  process.env.LEAD_WEBHOOK_SECRET = "test-secret-value";
  try { await run(); } finally {
    delete process.env.LEAD_WEBHOOK_URL;
    delete process.env.LEAD_WEBHOOK_SECRET;
  }
};

describe("GET /api/contact readiness", () => {
  it("is not ready with no database and no channel", async () => {
    const res = await GET();
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ready: false });
  });

  it("is ready as soon as one channel is configured", () => withWebhook("/lead", async () => {
    assert.deepEqual(await (await GET()).json(), { ready: true });
  }));
});

describe("POST /api/contact request hygiene", () => {
  it("rejects non-JSON content types with 415", async () => {
    const res = await post("name=x", { "content-type": "text/plain" });
    assert.equal(res.status, 415);
  });

  it("rejects cross-site submissions with 403", async () => {
    const res = await post(validInquiry(), { origin: "https://evil.example" });
    assert.equal(res.status, 403);
  });

  it("accepts requests without an Origin header (non-browser clients)", async () => {
    const res = await POST(new NextRequest(ENDPOINT, { method: "POST", body: "{}", headers: { "content-type": "application/json", "x-forwarded-for": nextIp() } }));
    assert.equal(res.status, 400); // got past the origin check, failed validation
  });

  it("rejects oversized bodies with 413", async () => {
    const res = await post(validInquiry({ message: "x".repeat(9000) }));
    assert.equal(res.status, 413);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await post("{not json");
    assert.equal(res.status, 400);
  });

  it("returns field errors for an invalid inquiry", async () => {
    const res = await post({ name: "A", email: "nope", interest: "zzz", message: "short" });
    assert.equal(res.status, 400);
    const body = await res.json() as { fields: Record<string, string> };
    assert.deepEqual(Object.keys(body.fields).sort(), ["email", "interest", "message", "name"]);
  });

  it("silently accepts honeypot submissions without delivering anything", () => withWebhook("/lead", async () => {
    const before = received.length;
    const res = await post(validInquiry({ website: "https://spam.example" }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(received.length, before);
  }));

  it("never caches responses", async () => {
    const res = await post("{not json");
    assert.equal(res.headers.get("cache-control"), "no-store");
  });
});

describe("POST /api/contact delivery", () => {
  it("answers 503 with neutral copy when no channel and no database exist", async () => {
    const res = await post(validInquiry());
    assert.equal(res.status, 503);
    const body = await res.json() as { error: string };
    assert.match(body.error, /can’t receive messages right now/);
    assert.doesNotMatch(body.error, /set up|maintenance/i);
  });

  it("delivers to the generic webhook with the shared secret and answers 200", () => withWebhook("/lead", async () => {
    const inquiry = validInquiry({ name: "Webhook <Test>", company: "" });
    const res = await post(inquiry);
    assert.equal(res.status, 200, await res.text());
    const last = received.at(-1);
    assert.ok(last, "webhook received nothing");
    assert.equal(last.headers["x-buzzly-secret"], "test-secret-value");
    assert.equal(last.body.source, "buzzly-contact-form");
    assert.equal(last.body.email, inquiry.email);
    assert.equal(last.body.name, "Webhook <Test>");
    assert.equal(last.body.interest, "content");
    assert.equal(typeof last.body.receivedAt, "string");
  }));

  it("answers 502 when the only channel fails, so the visitor can retry", () => withWebhook("/fail", async () => {
    const res = await post(validInquiry());
    assert.equal(res.status, 502);
    const body = await res.json() as { error: string };
    assert.match(body.error, /try again/i);
  }));

  it("rate-limits the same email address after the allowed number of messages", () => withWebhook("/lead", async () => {
    const email = `limited-${Math.random().toString(36).slice(2)}@example.com`;
    for (let i = 0; i < CONTACT_LIMITS.perEmail; i++) {
      const res = await post(validInquiry({ email }));
      assert.equal(res.status, 200, `message ${i + 1} should be accepted`);
    }
    const blocked = await post(validInquiry({ email }));
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get("retry-after"), "3600");
  }));

  it("rate-limits the same IP address across different email addresses", () => withWebhook("/lead", async () => {
    const ip = nextIp();
    for (let i = 0; i < CONTACT_LIMITS.perIp; i++) {
      const res = await post(validInquiry(), {}, ip);
      assert.equal(res.status, 200, `message ${i + 1} should be accepted`);
    }
    const blocked = await post(validInquiry(), {}, ip);
    assert.equal(blocked.status, 429);
  }));
});
