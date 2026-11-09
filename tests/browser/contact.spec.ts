import { expect, test, type Page } from "@playwright/test";

const send = (page: Page) => page.getByRole("button", { name: /Send inquiry/ });
const status = (page: Page) => page.locator(".contact-status");

async function fillInquiry(page: Page) {
  await page.getByLabel("Your name").fill("Synthetic QA");
  await page.getByLabel(/^Email/).fill("qa@example.com");
  await page.getByLabel("What would you like to build?").selectOption("content");
  await page.getByLabel("Tell us more").fill("Synthetic inquiry to exercise the contact form.");
}

test("invalid inquiry focuses and describes the first invalid field", async ({ page }) => {
  await page.goto("/contact");
  await send(page).click();
  const name = page.getByLabel("Your name");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(status(page)).toContainText("highlighted fields");
});

test("unconfigured storage explains that the form is unavailable", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText(/Our inbox is being set up/)).toBeVisible();
  await fillInquiry(page);
  await send(page).click();
  await expect(status(page)).toContainText("Please try again");
});

test("retry retains the submission key and success clears the form", async ({ page }) => {
  const keys: string[] = [];
  const ready = page.waitForResponse(response => response.url().endsWith("/api/contact") && response.request().method() === "GET");
  await page.route("**/api/contact", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { ready: true } });
    keys.push(route.request().postDataJSON().idempotencyKey);
    if (keys.length === 1) return route.fulfill({ status: 503, json: { error: "Storage temporarily unavailable" } });
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/contact");
  await ready;
  await fillInquiry(page);
  await send(page).click();
  await expect(status(page)).toContainText("Storage temporarily unavailable");
  await send(page).click();
  await expect(status(page)).toContainText("Your message has reached Buzzly");
  await expect(status(page)).toBeFocused();
  await expect(page.getByLabel("Your name")).toHaveValue("");
  expect(keys).toHaveLength(2);
  expect(keys[0]).toMatch(/^[a-f0-9-]{36}$/);
  expect(keys[1]).toBe(keys[0]);
});
