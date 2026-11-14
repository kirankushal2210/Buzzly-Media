import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { requireMaintainer } from "../lib/maintainer-auth.ts";
import { GET as health } from "../app/api/admin/health/route.ts";
import { GET as inquiries } from "../app/api/admin/inquiries/route.ts";

const TOKEN = "a-long-enough-maintainer-token-1234567890";
const request = (authorization?: string, path = "/api/admin/health") =>
  new NextRequest(`http://localhost:5173${path}`, { headers: authorization ? { authorization } : {} });

afterEach(() => { delete process.env.MAINTAINER_TOKEN; });

describe("maintainer guard", () => {
  it("hides the endpoints (404) while no token is configured", async () => {
    const denied = await requireMaintainer(request(`Bearer ${TOKEN}`));
    assert.equal(denied?.status, 404);
  });

  it("ignores tokens shorter than 16 characters as if unset", async () => {
    process.env.MAINTAINER_TOKEN = "short";
    const denied = await requireMaintainer(request("Bearer short"));
    assert.equal(denied?.status, 404);
  });

  it("answers 401 with a challenge for a missing or wrong bearer token", async () => {
    process.env.MAINTAINER_TOKEN = TOKEN;
    const missing = await requireMaintainer(request());
    assert.equal(missing?.status, 401);
    assert.equal(missing?.headers.get("www-authenticate"), "Bearer");
    const wrong = await requireMaintainer(request(`Bearer ${TOKEN}x`));
    assert.equal(wrong?.status, 401);
    const basic = await requireMaintainer(request(`Basic ${TOKEN}`));
    assert.equal(basic?.status, 401);
  });

  it("lets the correct token through", async () => {
    process.env.MAINTAINER_TOKEN = TOKEN;
    assert.equal(await requireMaintainer(request(`Bearer ${TOKEN}`)), null);
  });
});

describe("admin routes", () => {
  it("health is 404 without a configured token and never cached", async () => {
    const res = await health(request(`Bearer ${TOKEN}`));
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), "no-store");
  });

  it("health reports configuration without leaking secret values", async () => {
    process.env.MAINTAINER_TOKEN = TOKEN;
    const res = await health(request(`Bearer ${TOKEN}`));
    assert.equal(res.status, 200);
    const body = await res.json() as Record<string, unknown> & { leads: Record<string, unknown>; warnings: string[] };
    assert.equal(body.ok, false); // no channel, no database in the test environment
    assert.equal(body.leads.storage, "none");
    assert.deepEqual(body.leads.channels, { email: false, slack: false, discord: false, telegram: false, webhook: false });
    assert.ok(body.warnings.some(w => /No lead channel configured/.test(w)));
    assert.ok(body.warnings.some(w => /NEXT_PUBLIC_SITE_URL/.test(w)));
    assert.ok(!JSON.stringify(body).includes(TOKEN), "token must not be echoed");
  });

  it("inquiries answers an empty list when there is no database", async () => {
    process.env.MAINTAINER_TOKEN = TOKEN;
    const res = await inquiries(request(`Bearer ${TOKEN}`, "/api/admin/inquiries?limit=5"));
    assert.equal(res.status, 200);
    const body = await res.json() as { storage: string; inquiries: unknown[] };
    assert.equal(body.storage, "none");
    assert.deepEqual(body.inquiries, []);
  });
});
