import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const slugs = ["de-food-kampney", "buzzly-health", "buzzly-properties"];
const routes = ["/", "/about", "/services", "/work", "/companies", "/clients", "/contact", "/book", "/privacy", "/terms", "/logo",
  ...slugs.flatMap(slug => [`/work/${slug}`, `/companies/${slug}`])];
const bookingConfigured = Boolean(process.env.NEXT_PUBLIC_CAL_LINK);

test("public routes render, fit the viewport, and have a heading", async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of routes) {
    await test.step(path, async () => {
      expect((await page.goto(path, { waitUntil: "domcontentloaded" }))?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
  expect((await page.goto("/qa-missing-page"))?.status()).toBe(404);
});

// Current, intended behaviour (reported separately from the old bug): a browser refresh on
// any interior page returns the visitor to the homepage hero.
test("refresh on an interior page returns to the homepage", async ({ page }) => {
  await page.goto("/services");
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.reload();
  await expect(page).toHaveURL("/");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

// Regression for the old bug: after one refresh, every client-side link bounced back to "/".
test("navigation works after a refresh", async ({ page }, info) => {
  await page.goto("/about");
  await page.reload();
  await expect(page).toHaveURL("/");
  const mobile = info.project.name === "mobile";
  const navigate = async (path: string) => {
    if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
    const scope = mobile ? page.getByRole("dialog") : page.locator("header").first();
    await scope.locator(`a[href="${path}"]`).first().click();
    await expect(page).toHaveURL(path);
    await expect(page.locator("h1")).toHaveCount(1);
  };
  for (const path of ["/work", "/about", "/companies", "/clients", "/services"]) await navigate(path);

  // Contact, then the booking link on the Contact page, then a sub-company page.
  if (mobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: /Let’s Connect/ }).click();
  } else {
    await page.locator("header").first().getByRole("link", { name: /Let’s Connect/ }).click();
  }
  await expect(page).toHaveURL("/contact");
  await page.getByRole("link", { name: /Schedule a 15.Minute Intro Call/i }).click();
  await expect(page).toHaveURL("/book");
  await page.locator("footer").getByRole("link", { name: "Buzzly Health" }).first().click();
  await expect(page).toHaveURL("/companies/buzzly-health");
});

test("mobile menu closes on Escape and restores focus", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("/about");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Work category filters cards and updates the URL", async ({ page }) => {
  await page.goto("/work");
  const grid = page.getByRole("region", { name: "Case studies" });
  await expect(grid.getByRole("article")).toHaveCount(3);
  const filter = page.getByRole("group", { name: "Filter case studies" });
  await filter.getByRole("button", { name: /^Health/ }).click();
  await expect(page).toHaveURL(/category=health/);
  await expect(grid.getByRole("article")).toHaveCount(1);
  await expect(grid.getByRole("heading")).toHaveText("Buzzly Health");
  await filter.getByRole("button", { name: /^All/ }).click();
  await expect(grid.getByRole("article")).toHaveCount(3);
});

test("booking fallback shows no scheduler requests", async ({ page }) => {
  test.skip(bookingConfigured);
  const requests: string[] = [];
  page.on("request", request => { if (/(^|\.)cal\.com$/.test(new URL(request.url()).hostname)) requests.push(request.url()); });
  await page.goto("/contact");
  await page.getByRole("link", { name: /Schedule a 15.Minute Intro Call/i }).click();
  await expect(page).toHaveURL("/book");
  await expect(page.getByRole("button", { name: /Choose a time/ })).toBeDisabled();
  await expect(page.getByText("Coming soon", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Send a message instead/ })).toHaveAttribute("href", "/contact");
  expect(requests).toEqual([]);
});

test("configured booking loads lazily and handles mocked completion", async ({ page }) => {
  test.skip(!bookingConfigured);
  let loads = 0;
  await page.route("https://app.cal.com/embed/embed.js", async route => {
    loads++;
    await route.fulfill({ contentType: "application/javascript", body: `
      const api = window.Cal.ns["buzzly-intro"];
      for (const [action, options] of api.q) {
        if (action === "inline") {
          const button = document.createElement("button");
          button.textContent = "Confirm test booking";
          options.elementOrSelector.append(button);
          button.onclick = () => {
            const entry = api.q.find(([name, event]) => name === "on" && event.action === "bookingSuccessfulV2");
            entry[1].callback({ detail: { data: { startTime: "2027-01-15T10:00:00Z" } } });
          };
        }
        if (action === "on" && options.action === "linkReady") options.callback();
      }
    ` });
  });
  await page.goto("/book");
  expect(loads).toBe(0);
  await page.getByRole("button", { name: /Choose a time/ }).click();
  await page.getByRole("button", { name: "Confirm test booking" }).click();
  await expect(page.getByRole("heading", { name: "See you soon." })).toBeFocused();
  expect(loads).toBe(1);
});

for (const path of ["/", "/work", "/contact", "/book", "/about", "/services", "/companies", "/clients", "/privacy", "/companies/buzzly-health", "/work/de-food-kampney"]) {
  test(`axe WCAG checks on ${path}`, async ({ page }, info) => {
    test.skip(info.project.name !== "chromium");
    await page.goto(path);
    // Scan the settled page: the splash must be gone and finite intro animations finished,
    // otherwise axe measures colours mid-fade. Infinite animations (shimmers) are ignored.
    await page.waitForFunction(() => !document.getElementById("splash") && document.getAnimations()
      .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== "running"), undefined, { timeout: 10_000 });
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    await info.attach("axe", { body: JSON.stringify(result.violations, null, 2), contentType: "application/json" });
    expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
  });
}
