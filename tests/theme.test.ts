import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DARK_FROM_HOUR, LIGHT_FROM_HOUR, THEME_BOOT_SCRIPT, THEME_STORAGE_KEY, resolveTheme, themeForHour } from "../lib/theme.ts";

describe("themeForHour", () => {
  it("is light from 6 AM until just before 6 PM", () => {
    for (let hour = LIGHT_FROM_HOUR; hour < DARK_FROM_HOUR; hour++) assert.equal(themeForHour(hour), "light", `hour ${hour}`);
  });

  it("is dark from 6 PM through 5 AM", () => {
    for (const hour of [18, 19, 21, 23, 0, 3, 5]) assert.equal(themeForHour(hour), "dark", `hour ${hour}`);
  });
});

describe("resolveTheme", () => {
  it("follows the clock in auto and the choice otherwise", () => {
    const morning = new Date(2026, 10, 24, 9, 0);
    const evening = new Date(2026, 10, 24, 19, 30);
    assert.equal(resolveTheme("auto", morning), "light");
    assert.equal(resolveTheme("auto", evening), "dark");
    assert.equal(resolveTheme("dark", morning), "dark");
    assert.equal(resolveTheme("light", evening), "light");
  });
});

/** Runs the inline <head> script against a fake document, storage and clock. */
function boot(stored: string | null, hour: number, storageThrows = false) {
  const dataset: Record<string, string> = {};
  const RealDate = Date;
  const FakeDate = class extends RealDate {
    getHours() { return hour; }
  };
  const localStorage = { getItem: (key: string) => { if (storageThrows) throw new Error("blocked"); return key === THEME_STORAGE_KEY ? stored : null; } };
  new Function("document", "localStorage", "Date", THEME_BOOT_SCRIPT)({ documentElement: { dataset } }, localStorage, FakeDate);
  return dataset;
}

describe("THEME_BOOT_SCRIPT", () => {
  it("resolves auto by the clock before first paint", () => {
    assert.deepEqual(boot(null, 10), { themeMode: "auto", theme: "light" });
    assert.deepEqual(boot("auto", 20), { themeMode: "auto", theme: "dark" });
  });

  it("honours a stored light or dark choice at any hour", () => {
    assert.deepEqual(boot("light", 23), { themeMode: "light", theme: "light" });
    assert.deepEqual(boot("dark", 12), { themeMode: "dark", theme: "dark" });
  });

  it("treats unknown values as auto and falls back to dark if storage is blocked", () => {
    assert.deepEqual(boot("purple", 12), { themeMode: "auto", theme: "light" });
    assert.deepEqual(boot(null, 12, true), { themeMode: "auto", theme: "dark" });
  });
});
