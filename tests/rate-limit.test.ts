import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTACT_LIMITS, clientIp, hashIp, isRateLimitedInMemory } from "../lib/rate-limit.ts";

describe("in-memory rate limit", () => {
  it("allows the first N hits and blocks the next", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < CONTACT_LIMITS.perEmail; i++) assert.equal(isRateLimitedInMemory(key, CONTACT_LIMITS.perEmail), false, `hit ${i + 1}`);
    assert.equal(isRateLimitedInMemory(key, CONTACT_LIMITS.perEmail), true);
  });

  it("keeps separate counters per key", () => {
    const a = `a:${Math.random()}`, b = `b:${Math.random()}`;
    for (let i = 0; i < CONTACT_LIMITS.perIp; i++) isRateLimitedInMemory(a);
    assert.equal(isRateLimitedInMemory(a), true);
    assert.equal(isRateLimitedInMemory(b), false);
  });
});

describe("client IP and hashing", () => {
  it("prefers the Cloudflare header, then x-real-ip, then the first forwarded address", () => {
    assert.equal(clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })), "1.1.1.1");
    assert.equal(clientIp(new Headers({ "x-real-ip": "3.3.3.3" })), "3.3.3.3");
    assert.equal(clientIp(new Headers({ "x-forwarded-for": "4.4.4.4, 10.0.0.1" })), "4.4.4.4");
    assert.equal(clientIp(new Headers()), "unknown");
  });

  it("hashes deterministically with the salt and never returns the raw IP", async () => {
    const one = await hashIp("203.0.113.9", "salt-a");
    const two = await hashIp("203.0.113.9", "salt-a");
    const other = await hashIp("203.0.113.9", "salt-b");
    assert.equal(one, two);
    assert.notEqual(one, other);
    assert.match(one, /^[0-9a-f]{64}$/);
    assert.ok(!one.includes("203.0.113.9"));
  });
});
