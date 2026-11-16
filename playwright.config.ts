import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:48731",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 48731 --ignore-lock",
    url: "http://127.0.0.1:48731",
    reuseExistingServer: false,
  },
});
