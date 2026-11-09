import { defineConfig, devices } from "@playwright/test";

const appPort = 38472;
// Tests run over HTTPS, like the real deployment (see tests/browser/https-proxy.mjs).
const baseURL = "https://127.0.0.1:38443";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 2,
  reporter: [["list"], ["html", { open: "never", outputFolder: "qa-reports/playwright-html" }]],
  use: { baseURL, ignoreHTTPSErrors: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    {
      command: `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${appPort}`,
      url: `http://127.0.0.1:${appPort}`,
      reuseExistingServer: false,
      env: { SUPABASE_URL: "", SUPABASE_SECRET_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "", RESEND_API_KEY: "", SLACK_WEBHOOK_URL: "", DISCORD_WEBHOOK_URL: "" },
    },
    {
      command: `node tests/browser/https-proxy.mjs 38443 ${appPort}`,
      url: baseURL,
      ignoreHTTPSErrors: true,
      reuseExistingServer: false,
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
