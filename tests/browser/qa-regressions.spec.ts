import { expect, test } from "@playwright/test";

const bookingConfigured = Boolean(process.env.NEXT_PUBLIC_CAL_LINK);

test.describe("contact form before JavaScript runs", () => {
  test.use({ javaScriptEnabled: false });

  // Regression: a native GET submit used to put name, email and message in the URL
  // (browser history and request logs) when the form was sent before hydration.
  test("cannot leak inquiry details into the URL", async ({ page }) => {
    await page.goto("/contact");
    const form = page.locator("form.contact-form");
    await expect(form).toHaveAttribute("method", "post");
    await expect(page.getByRole("button", { name: /Send inquiry/ })).toBeDisabled();
    await page.locator('input[name="name"]').fill("Synthetic QA");
    await page.locator('input[name="email"]').fill("qa@example.com");
    await page.locator('textarea[name="message"]').fill("Synthetic message that must never appear in a URL.");
    await page.locator('input[name="email"]').press("Enter");
    await page.waitForTimeout(500);
    expect(new URL(page.url()).search).toBe("");
  });
});

test("company films load near the viewport, play in view and pause offscreen", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium", "media timing is checked once, in Chromium");
  await page.goto("/companies");
  const videos = page.locator(".company-feature video");
  await expect(videos).toHaveCount(3);
  const state = (index: number) => videos.nth(index).evaluate((video: HTMLVideoElement) =>
    ({ src: video.getAttribute("src"), paused: video.paused, time: video.currentTime }));

  // The last film starts far below the fold: nothing is downloaded for it yet.
  expect((await state(2)).src).toBeNull();

  await videos.nth(0).scrollIntoViewIfNeeded();
  await expect.poll(async () => (await state(0)).src).toContain("/media/");
  await expect.poll(async () => (await state(0)).paused, { timeout: 10_000 }).toBe(false);
  const first = (await state(0)).time;
  await expect.poll(async () => (await state(0)).time, { timeout: 10_000 }).toBeGreaterThan(first);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await state(0)).paused).toBe(true);
});

test("reduced motion: decorative films never download or autoplay", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/companies");
  const first = page.locator(".company-feature video").first();
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  expect(await first.evaluate((video: HTMLVideoElement) => ({ src: video.getAttribute("src"), paused: video.paused })))
    .toEqual({ src: null, paused: true });
});

test("public routes load without console errors or failed same-origin requests", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium");
  const problems: string[] = [];
  page.on("console", message => { if (message.type() === "error") problems.push(`console: ${message.text().slice(0, 200)}`); });
  page.on("pageerror", error => problems.push(`pageerror: ${error.message.slice(0, 200)}`));
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.origin === new URL(page.url() || "https://127.0.0.1:38443").origin && response.status() >= 400 && !url.pathname.startsWith("/qa-missing"))
      problems.push(`HTTP ${response.status()} ${url.pathname}`);
  });
  for (const path of ["/", "/about", "/services", "/work", "/work?category=food", "/companies", "/clients", "/contact", "/book", "/privacy", "/terms", "/logo",
    "/work/de-food-kampney", "/work/buzzly-health", "/work/buzzly-properties", "/companies/de-food-kampney", "/companies/buzzly-health", "/companies/buzzly-properties"]) {
    await page.goto(path, { waitUntil: "networkidle" });
  }
  // The only expected error: the deliberate 404 below, checked separately.
  expect(problems).toEqual([]);
});

test("narrow phones (320px) have no horizontal overflow", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium");
  await page.setViewportSize({ width: 320, height: 640 });
  for (const path of ["/", "/about", "/services", "/work", "/companies", "/clients", "/contact", "/book", "/work/buzzly-health", "/companies/buzzly-properties", "/privacy"]) {
    await test.step(path, async () => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    });
  }
});

test("configured booking: a failed embed offers the direct Cal.com link and no confirmation", async ({ page }) => {
  test.skip(!bookingConfigured, "needs a build with a dummy NEXT_PUBLIC_CAL_LINK");
  await page.route("https://app.cal.com/embed/embed.js", route => route.fulfill({ status: 503, body: "" }));
  await page.goto("/book");
  const direct = page.getByRole("link", { name: "Open on Cal.com ↗" }).last();
  await expect(direct).toBeVisible();
  await expect(direct).toHaveAttribute("href", `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK}`);
  await page.getByRole("button", { name: /Choose a time/ }).click();
  const failure = page.getByRole("status").filter({ hasText: "We couldn’t load the calendar here." });
  await expect(failure).toBeVisible();
  await expect(failure.getByRole("link", { name: "Open on Cal.com ↗" })).toHaveAttribute("href", `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK}`);
  await expect(failure.getByRole("link", { name: "send us a message", exact: true })).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("heading", { name: "See you soon." })).toHaveCount(0);
});

test("configured booking: time-zone note only appears once the calendar is open", async ({ page }) => {
  test.skip(!bookingConfigured, "needs a build with a dummy NEXT_PUBLIC_CAL_LINK");
  await page.route("https://app.cal.com/embed/embed.js", route => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.goto("/book");
  await expect(page.getByText(/Times are shown in/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Choose a time/ })).toBeEnabled();
  await page.getByRole("button", { name: /Choose a time/ }).click();
  await expect(page.getByText(/Times are shown in/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a time." })).toBeFocused();
});
