/**
 * Contact flow tests: the real /api/contact route against a real Postgres that has
 * the Supabase migration applied, with Supabase-style roles (anon, authenticated,
 * service_role) and Supabase's default grants.
 *
 * Network boundaries are simulated in-process, so nothing leaves the machine:
 *   - Supabase REST (PostgREST) RPC calls run the SQL functions as service_role.
 *   - Resend, Slack and Discord are replaced by recorders that can be told to fail.
 *
 * Needs a disposable database (it is wiped):
 *   TEST_DATABASE_URL=postgres://postgres@127.0.0.1:54329/buzzly_test npm run test:contact
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { after, before, beforeEach, describe, test } from "node:test";
import pg from "pg";

const DATABASE_URL = process.env.TEST_DATABASE_URL;
const SUPABASE_URL = "http://supabase.test";
const SLACK_URL = "http://127.0.0.1:9/slack-webhook";
const DISCORD_URL = "http://127.0.0.1:9/discord-webhook";
const INBOX = "inbox@example.com";

type ChannelMode = "ok" | "fail" | "timeout" | "rate_limit_once" | "quota";
type ResendCall = { to: string[]; body: Record<string, unknown>; idempotencyKey: string | null; authorization: string | null };
const calls = { email: [] as Record<string, unknown>[], confirmations: [] as Record<string, unknown>[], resend: [] as ResendCall[], slack: 0, discord: 0, rpc: 0 };
const modes: { email: ChannelMode; confirmation: ChannelMode; slack: ChannelMode; discord: ChannelMode; db: "ok" | "down" | "error" } =
  { email: "ok", confirmation: "ok", slack: "ok", discord: "ok", db: "ok" };
const rateLimited = new Set<string>();
const logs: string[] = [];

let pool: pg.Pool;
let route: typeof import("../app/api/contact/route");

function setEnv(overrides: Record<string, string | undefined> = {}) {
  const env: Record<string, string | undefined> = {
    SUPABASE_URL, SUPABASE_SECRET_KEY: "sb_secret_test_only",
    RESEND_API_KEY: "re_test_only", CONTACT_TO_EMAIL: INBOX, CONTACT_FROM_EMAIL: "Buzzly <hello@example.com>",
    SLACK_WEBHOOK_URL: SLACK_URL, DISCORD_WEBHOOK_URL: DISCORD_URL,
    CONTACT_AUTO_REPLY: undefined, CONTACT_IP_SALT: "test-salt",
    ...overrides,
  };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}

/** Runs a Supabase RPC the way PostgREST does: as service_role, one transaction per call. */
async function runRpc(fn: string, args: Record<string, unknown>) {
  if (!/^[a-z_]+$/.test(fn)) throw new Error("bad function name");
  const names = Object.keys(args);
  if (!names.every(name => /^p_[a-z_]+$/.test(name))) throw new Error("bad argument name");
  const values = names.map(name => (args[name] !== null && typeof args[name] === "object" ? JSON.stringify(args[name]) : args[name]));
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("set local role service_role");
    const result = await client.query(`select * from public.${fn}(${names.map((name, i) => `${name} => $${i + 1}`).join(", ")})`, values);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

const reply = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  if (url.startsWith(`${SUPABASE_URL}/rest/v1/rpc/`)) {
    calls.rpc++;
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("apikey"), "sb_secret_test_only", "secret key must be sent in the apikey header");
    if (modes.db === "down") throw new TypeError("fetch failed");
    if (modes.db === "error") return reply(500, { message: "boom" });
    const fn = url.slice(`${SUPABASE_URL}/rest/v1/rpc/`.length);
    try {
      const result = await runRpc(fn, body);
      return fn === "finish_inquiry_notification" ? reply(204) : reply(200, result.rows);
    } catch (error) {
      return reply(400, { message: error instanceof Error ? error.message : String(error) });
    }
  }

  const respond = async (mode: ChannelMode, key = "") => {
    if (mode === "timeout") { const e = new Error("timed out"); e.name = "TimeoutError"; throw e; }
    if (mode === "quota") return reply(429, { name: "daily_quota_exceeded", message: `provider echoed ${JSON.stringify(body).slice(0, 80)}` });
    if (mode === "rate_limit_once" && !rateLimited.has(key)) {
      rateLimited.add(key);
      return new Response(JSON.stringify({ name: "rate_limit_exceeded" }), { status: 429, headers: { "retry-after": "1" } });
    }
    return mode === "fail" ? reply(500, { message: `provider echoed ${JSON.stringify(body).slice(0, 80)}` }) : reply(200, { id: "msg_1" });
  };
  if (url === "https://api.resend.com/emails") {
    const headers = new Headers(init?.headers);
    const call: ResendCall = { to: body.to as string[], body, idempotencyKey: headers.get("idempotency-key"), authorization: headers.get("authorization") };
    calls.resend.push(call);
    if (call.to.includes(INBOX)) { calls.email.push(body); return respond(modes.email, `in:${call.idempotencyKey}`); }
    calls.confirmations.push(body);
    return respond(modes.confirmation, `conf:${call.idempotencyKey}`);
  }
  if (url === SLACK_URL) { calls.slack++; return respond(modes.slack); }
  if (url === DISCORD_URL) { calls.discord++; return respond(modes.discord); }
  throw new Error(`Unexpected network call in test: ${url}`);
}

let ipCounter = 0;
function lead(overrides: Record<string, unknown> = {}) {
  return {
    name: "Asha Rao",
    email: `asha.${Math.random().toString(36).slice(2, 8)}@example.com`,
    company: "Rao Foods",
    interest: "content",
    message: "We would like help planning launch content for our new restaurant.",
    website: "",
    idempotencyKey: crypto.randomUUID(),
    ...overrides,
  };
}

async function post(payload: unknown, { ip = `10.0.0.${++ipCounter % 250}`, headers = {} as Record<string, string> } = {}) {
  const { NextRequest } = await import("next/server");
  const request = new NextRequest("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
  const response = await route.POST(request);
  return { status: response.status, body: await response.json() as Record<string, unknown> };
}

const rows = async () => (await pool.query("select * from public.inquiries order by created_at")).rows;

async function resetDatabase() {
  const migrations = join(process.cwd(), "supabase", "migrations");
  await pool.query(`
    drop table if exists public.inquiries cascade;
    drop function if exists public.submit_inquiry, public.claim_inquiry_notification, public.finish_inquiry_notification;
    do $$ begin
      if not exists (select from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
      if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
      if not exists (select from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
    end $$;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  `);
  for (const file of readdirSync(migrations).filter(name => name.endsWith(".sql")).sort()) {
    await pool.query(readFileSync(join(migrations, file), "utf8"));
  }
}

describe("contact inquiries", { skip: DATABASE_URL ? false : "TEST_DATABASE_URL is not set (needs a disposable Postgres)" }, () => {
  const realFetch = globalThis.fetch;
  const realError = console.error;

  before(async () => {
    (process.env as Record<string, string>).NODE_ENV = "test"; // allows local webhook/Supabase URLs
    pool = new pg.Pool({ connectionString: DATABASE_URL, max: 12 });
    await resetDatabase();
    globalThis.fetch = fakeFetch as typeof fetch;
    console.error = (...args: unknown[]) => { logs.push(args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")); };
    setEnv();
    route = await import("../app/api/contact/route");
  });

  after(async () => {
    globalThis.fetch = realFetch;
    console.error = realError;
    await pool?.end();
  });

  beforeEach(async () => {
    await pool.query("truncate public.inquiries");
    Object.assign(modes, { email: "ok", confirmation: "ok", slack: "ok", discord: "ok", db: "ok" });
    calls.email = []; calls.confirmations = []; calls.resend = []; calls.slack = 0; calls.discord = 0; calls.rpc = 0;
    rateLimited.clear();
    logs.length = 0;
    setEnv();
  });

  test("valid inquiry is saved, every channel notified once, and recorded as sent", async () => {
    const payload = lead();
    const result = await post(payload);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true, received: true });

    const [row] = await rows();
    assert.equal(row.name, "Asha Rao");
    assert.equal(row.email, payload.email);
    assert.equal(row.company, "Rao Foods");
    assert.equal(row.inquiry_type, "content");
    assert.equal(row.idempotency_key, payload.idempotencyKey);
    assert.match(row.ip_hash, /^[0-9a-f]{64}$/);
    assert.equal(row.notification_status, "sent");
    assert.deepEqual(row.notification_channels, { email: "sent", slack: "sent", discord: "sent", confirmation: "sent" });
    assert.equal(row.notification_attempts, 1);
    assert.ok(row.notified_at);

    assert.equal(calls.email.length, 1);
    assert.deepEqual(calls.email[0].to, [INBOX], "inquiry goes to CONTACT_TO_EMAIL");
    assert.equal(calls.email[0].reply_to, payload.email);
    assert.equal(calls.slack, 1);
    assert.equal(calls.discord, 1);
    assert.equal(calls.confirmations.length, 1, "visitor confirmation is on by default");
    assert.deepEqual(calls.confirmations[0].to, [payload.email]);
  });

  test("invalid requests are rejected and nothing is saved or sent", async () => {
    const invalid = await post(lead({ name: "", email: "not-an-email", interest: "", message: "short" }));
    assert.equal(invalid.status, 400);
    assert.deepEqual(Object.keys(invalid.body.fields as object).sort(), ["email", "interest", "message", "name"]);
    assert.equal((await post("{not json")).status, 400);
    assert.equal((await post(lead(), { headers: { origin: "https://evil.example" } })).status, 403);
    const honeypot = await post(lead({ website: "https://spam.example" }));
    assert.equal(honeypot.status, 200, "bots get a silent success");
    assert.equal((await rows()).length, 0);
    assert.equal(calls.rpc + calls.resend.length + calls.slack + calls.discord, 0, "no database call and no email for invalid or spam requests");
  });

  test("database unavailable: visitor gets a retryable error and no notification is sent", async () => {
    for (const mode of ["down", "error"] as const) {
      modes.db = mode;
      const result = await post(lead());
      assert.equal(result.status, 503, `db ${mode}`);
      assert.match(String(result.body.error), /couldn’t save your message/);
      assert.equal(result.body.ok, undefined);
    }
    assert.equal(calls.resend.length + calls.slack + calls.discord, 0, "no notification or confirmation when the save failed");
    modes.db = "ok";
    assert.equal((await rows()).length, 0);
  });

  test("database not configured: form reports it is not ready and rejects submissions", async () => {
    setEnv({ SUPABASE_URL: undefined, SUPABASE_SECRET_KEY: undefined });
    assert.deepEqual(await route.GET().json(), { ready: false });
    const result = await post(lead());
    assert.equal(result.status, 503);
    assert.equal(calls.slack, 0);
    setEnv();
    assert.deepEqual(await route.GET().json(), { ready: true });
  });

  test("save succeeds but a notification fails: inquiry kept, failure recorded, visitor told it was received", async () => {
    modes.slack = "fail";
    modes.email = "timeout";
    const payload = lead();
    const result = await post(payload);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true, received: true });

    const [row] = await rows();
    assert.equal(row.notification_status, "failed");
    assert.deepEqual(row.notification_channels, { email: "failed", slack: "failed", discord: "sent", confirmation: "sent" });
    assert.equal(row.notification_error, "email:timeout,slack:http_500");
    assert.equal(row.notified_at, null);

    // Logs carry categories only: no visitor data and no provider response bodies.
    const logText = logs.join("\n");
    assert.ok(logs.length > 0);
    for (const secret of [payload.email, payload.name, payload.message, "provider echoed", "sb_secret"]) {
      assert.ok(!logText.includes(secret), `log must not contain "${secret}"`);
    }

    // A retry of the same submission resends only the channels that failed.
    modes.slack = "ok"; modes.email = "ok";
    const retry = await post(payload);
    assert.equal(retry.status, 200);
    const [after] = await rows();
    assert.equal((await rows()).length, 1);
    assert.equal(after.notification_status, "sent");
    assert.deepEqual(after.notification_channels, { email: "sent", slack: "sent", discord: "sent", confirmation: "sent" });
    assert.equal(calls.confirmations.length, 1, "confirmation already delivered; not resent");
    assert.equal(after.notification_error, null);
    assert.equal(calls.discord, 1, "discord already delivered; not resent");
    assert.equal(calls.slack, 2);
    assert.equal(calls.email.length, 2);
  });

  test("no notification channel configured: inquiry saved and marked skipped", async () => {
    setEnv({ RESEND_API_KEY: undefined, SLACK_WEBHOOK_URL: undefined, DISCORD_WEBHOOK_URL: undefined });
    const result = await post(lead());
    assert.equal(result.status, 200);
    const [row] = await rows();
    assert.equal(row.notification_status, "skipped");
    assert.equal(calls.email.length + calls.slack + calls.discord, 0);
  });

  test("Resend emails: correct recipients, sender, Reply-To, subject and escaped content", async () => {
    const payload = lead({
      name: "Asha <b>Rao</b>",
      company: "Rao & Sons <Foods>",
      interest: "brand",
      message: "Hello <script>alert('x')</script>\nWe need \"brand\" help & more, please.",
    });
    assert.equal((await post(payload)).status, 200);
    const [row] = await rows();
    const ref = row.id.replace(/-/g, "").slice(0, 8).toUpperCase();

    const internal = calls.resend.find(call => call.to.includes(INBOX))!;
    assert.deepEqual(internal.to, [INBOX]);
    assert.equal(internal.body.from, "Buzzly <hello@example.com>", "sender comes from CONTACT_FROM_EMAIL");
    assert.equal(internal.body.reply_to, payload.email, "Reply-To is the visitor");
    assert.equal(internal.body.subject, `New inquiry #${ref}: Asha <b>Rao</b> — Brand strategy`);
    assert.equal(internal.authorization, "Bearer re_test_only");
    const html = String(internal.body.html);
    assert.ok(html.includes("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;"), "message is escaped");
    assert.ok(html.includes("Asha &lt;b&gt;Rao&lt;/b&gt;") && html.includes("Rao &amp; Sons &lt;Foods&gt;"), "name and company are escaped");
    assert.ok(!html.includes("<script>") && !html.includes("<b>Rao"), "no raw user HTML");
    assert.ok(html.includes("<br>We need &quot;brand&quot;"), "line breaks kept");
    const text = String(internal.body.text);
    for (const part of ["Name: Asha <b>Rao</b>", `Email: ${payload.email}`, "Company: Rao & Sons <Foods>", "Inquiry type: Brand strategy", "<script>alert('x')</script>"]) {
      assert.ok(text.includes(part), `plain-text version includes ${part}`);
    }

    const confirmation = calls.resend.find(call => !call.to.includes(INBOX))!;
    assert.deepEqual(confirmation.to, [payload.email]);
    assert.equal(confirmation.body.from, "Buzzly <hello@example.com>");
    assert.equal(confirmation.body.reply_to, INBOX, "visitor replies reach the Buzzly inbox");
    assert.equal(confirmation.body.subject, "We’ve received your inquiry — Buzzly");
    const confirmationText = `${confirmation.body.text} ${confirmation.body.html}`;
    for (const userValue of ["Asha", "Rao & Sons", "script", payload.message.slice(0, 10)]) {
      assert.ok(!confirmationText.includes(userValue), `confirmation never echoes visitor input (${userValue})`);
    }
    assert.ok(!/\b(\d+\s*(hours?|days?|business days?)|24|48)\b/i.test(String(confirmation.body.text)), "no response-time promise");

    assert.equal(internal.idempotencyKey, `inquiry-${row.id}-notification`);
    assert.equal(confirmation.idempotencyKey, `inquiry-${row.id}-confirmation`);
  });

  test("internal notification fails, confirmation still sent: both recorded separately", async () => {
    modes.email = "fail";
    const result = await post(lead());
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true, received: true });
    const [row] = await rows();
    assert.equal(row.notification_status, "failed");
    assert.equal(row.notification_channels.email, "failed");
    assert.equal(row.notification_channels.confirmation, "sent");
    assert.equal(row.notification_error, "email:http_500");
    assert.equal(calls.confirmations.length, 1);
  });

  test("confirmation fails, internal notification delivered: inquiry kept, failure recorded", async () => {
    modes.confirmation = "fail";
    const payload = lead();
    assert.equal((await post(payload)).status, 200);
    const [row] = await rows();
    assert.equal(row.notification_status, "sent", "the team was notified");
    assert.equal(row.notification_channels.email, "sent");
    assert.equal(row.notification_channels.confirmation, "failed");
    assert.equal(row.notification_error, "confirmation:http_500");
    assert.equal(calls.email.length, 1);
    await post(payload);
    assert.equal(calls.email.length, 1, "a retry never resends the delivered internal notification");
  });

  test("missing or partial email configuration skips email without failing the saved inquiry", async () => {
    for (const [label, env] of [
      ["no API key", { RESEND_API_KEY: undefined }],
      ["no sender", { CONTACT_FROM_EMAIL: undefined }],
      ["no inbox", { CONTACT_TO_EMAIL: undefined }],
    ] as const) {
      await pool.query("truncate public.inquiries");
      calls.resend = [];
      setEnv(env);
      assert.equal((await post(lead())).status, 200, label);
      const [row] = await rows();
      assert.equal(row.notification_channels.email, "skipped", label);
      assert.equal(row.notification_channels.confirmation, "skipped", label);
      assert.equal(calls.resend.length, 0, label);
    }
  });

  test("confirmation can be turned off, and is skipped with Resend's test sender", async () => {
    setEnv({ CONTACT_AUTO_REPLY: "false" });
    await post(lead());
    assert.equal(calls.confirmations.length, 0);
    assert.equal((await rows())[0].notification_channels.confirmation, "skipped");

    await pool.query("truncate public.inquiries");
    setEnv({ CONTACT_FROM_EMAIL: "Buzzly <onboarding@resend.dev>" });
    await post(lead());
    assert.equal(calls.email.length, 2, "internal notification still sent from the test sender");
    assert.equal(calls.confirmations.length, 0, "test sender can only reach the account owner, so no confirmation");
  });

  test("Resend free-plan limits: a per-second limit is retried once; a used-up quota is recorded", async () => {
    modes.email = "rate_limit_once";
    assert.equal((await post(lead())).status, 200);
    let [row] = await rows();
    assert.equal(row.notification_channels.email, "sent");
    const internalCalls = calls.resend.filter(call => call.to.includes(INBOX));
    assert.equal(internalCalls.length, 2, "one retry after the rate-limit response");
    assert.equal(internalCalls[0].idempotencyKey, internalCalls[1].idempotencyKey, "retry reuses the idempotency key");

    await pool.query("truncate public.inquiries");
    modes.email = "quota"; modes.confirmation = "quota";
    assert.equal((await post(lead())).status, 200, "inquiry still received when the quota is used up");
    [row] = await rows();
    assert.equal(row.notification_status, "failed");
    assert.equal(row.notification_error, "email:quota_exceeded,confirmation:quota_exceeded");
    assert.ok(!logs.join("\n").includes("provider echoed"), "provider response bodies are never logged");
  });

  test("a retried submission is not saved or notified twice", async () => {
    const payload = lead();
    const first = await post(payload);
    const second = await post(payload);
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal((await rows()).length, 1);
    assert.equal(calls.slack, 1);
    assert.equal(calls.email.length, 1);
    assert.equal(calls.confirmations.length, 1);
  });

  test("concurrent retries create one inquiry and one notification per channel", async () => {
    const payload = lead();
    const results = await Promise.all(Array.from({ length: 8 }, () => post(payload)));
    assert.ok(results.every(r => r.status === 200), JSON.stringify(results.map(r => r.status)));
    assert.equal((await rows()).length, 1);
    assert.equal(calls.slack, 1);
    assert.equal(calls.discord, 1);
    assert.equal(calls.email.length, 1);
    assert.equal(calls.confirmations.length, 1, "one confirmation despite 8 concurrent retries");
  });

  test("the same key with different content is refused", async () => {
    const payload = lead();
    await post(payload);
    const conflict = await post({ ...payload, message: "A completely different message about something else." });
    assert.equal(conflict.status, 409);
    assert.equal((await rows()).length, 1);
  });

  test("rate limits are shared through the database and never block a retry", async () => {
    const email = "repeat@example.com";
    const sent = [];
    for (let i = 0; i < 3; i++) sent.push(lead({ email }));
    for (const payload of sent) assert.equal((await post(payload)).status, 200);
    const fourth = await post(lead({ email }));
    assert.equal(fourth.status, 429);
    assert.equal(fourth.body.error, "You’ve sent several messages in a short time. Please try again in an hour.");
    assert.equal((await post(sent[0])).status, 200, "retrying an already-saved submission is still answered");

    const ip = "203.0.113.7";
    const byIp = [];
    for (let i = 0; i < 6; i++) byIp.push((await post(lead(), { ip })).status);
    assert.deepEqual(byIp, [200, 200, 200, 200, 200, 429]);
    assert.equal((await rows()).length, 3 + 5);
  });
});

describe("database access rules", { skip: DATABASE_URL ? false : "TEST_DATABASE_URL is not set" }, () => {
  let db: pg.Pool;
  let id: string;

  before(async () => {
    db = new pg.Pool({ connectionString: DATABASE_URL, max: 12 });
    await db.query("truncate public.inquiries");
    const { rows: [row] } = await db.query(
      `insert into public.inquiries (idempotency_key, name, email, inquiry_type, message)
       values (gen_random_uuid(), 'Test Person', 'person@example.com', 'brand', 'A message that is long enough to save.') returning id`);
    id = row.id;
  });
  after(async () => db?.end());

  async function as(role: string, sql: string, params: unknown[] = []) {
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query(`set local role ${role}`);
      const result = await client.query(sql, params);
      await client.query("rollback");
      return result;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  test("anonymous and signed-in website users cannot read, change or delete inquiries", async () => {
    for (const role of ["anon", "authenticated"]) {
      await assert.rejects(as(role, "select * from public.inquiries"), /permission denied/, `${role} select`);
      await assert.rejects(as(role, "update public.inquiries set name = 'x'"), /permission denied/, `${role} update`);
      await assert.rejects(as(role, "delete from public.inquiries"), /permission denied/, `${role} delete`);
      await assert.rejects(
        as(role, "insert into public.inquiries (idempotency_key, name, email, inquiry_type, message) values (gen_random_uuid(), 'Bot', 'b@x.io', 'other', 'aaaaaaaaaaaaaaaaaaaaaaaa')"),
        /permission denied/, `${role} insert`);
      await assert.rejects(
        as(role, "select * from public.submit_inquiry(gen_random_uuid(), 'Bot', 'b@x.io', '', 'other', 'aaaaaaaaaaaaaaaaaaaaaaaa', null)"),
        /permission denied/, `${role} calling submit_inquiry`);
      await assert.rejects(as(role, "select * from public.claim_inquiry_notification($1)", [id]), /permission denied/, `${role} claim`);
    }
  });

  test("Row Level Security still hides rows if table access is ever granted by mistake", async () => {
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query("grant select on public.inquiries to anon");
      await client.query("set local role anon");
      const { rows } = await client.query("select * from public.inquiries");
      assert.equal(rows.length, 0);
    } finally {
      await client.query("rollback");
      client.release();
    }
  });

  test("only one of many concurrent claims wins the right to notify", async () => {
    await db.query("update public.inquiries set notification_status = 'pending', notification_attempts = 0 where id = $1", [id]);
    const claims = await Promise.all(Array.from({ length: 10 }, async () => {
      const client = await db.connect();
      try {
        await client.query("begin");
        await client.query("set local role service_role");
        const { rows } = await client.query("select * from public.claim_inquiry_notification($1)", [id]);
        await client.query("commit");
        return rows.length;
      } finally {
        client.release();
      }
    }));
    assert.equal(claims.reduce((a, b) => a + b, 0), 1);
  });

  test("an abandoned claim expires after its lease; attempts are capped", async () => {
    const claim = async () => (await as("service_role", "select * from public.claim_inquiry_notification($1)", [id])).rows.length;
    await db.query("update public.inquiries set notification_status = 'sending', notification_claimed_at = now(), notification_attempts = 1 where id = $1", [id]);
    assert.equal(await claim(), 0, "fresh claim is respected");
    await db.query("update public.inquiries set notification_claimed_at = now() - interval '5 minutes' where id = $1", [id]);
    assert.equal(await claim(), 1, "stale claim can be taken over");
    await db.query("update public.inquiries set notification_status = 'failed', notification_attempts = 3 where id = $1", [id]);
    assert.equal(await claim(), 0, "no more than 3 attempts");
  });

  test("schema constraints reject out-of-range data even from the server", async () => {
    const insert = (name: string, type: string, message: string) => db.query(
      "insert into public.inquiries (idempotency_key, name, email, inquiry_type, message) values (gen_random_uuid(), $1, 'a@b.co', $2, $3)",
      [name, type, message]);
    await assert.rejects(insert("A", "content", "x".repeat(30)), /check constraint/);
    await assert.rejects(insert("Valid Name", "lottery", "x".repeat(30)), /check constraint/);
    await assert.rejects(insert("Valid Name", "content", "too short"), /check constraint/);
  });
});
