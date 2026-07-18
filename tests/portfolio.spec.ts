import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function installFakeQwen(
  page: Page,
  options: { response?: string; holdGeneration?: boolean; holdLoading?: boolean } = {},
): Promise<void> {
  await page.addInitScript((configuration) => {
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: {
        requestAdapter: async () => ({ features: { has: (feature: string) => feature === "shader-f16" } }),
      },
    });
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: async () => ({ quota: 2_000_000_000, usage: 100_000_000 }) },
    });

    class FakeWorker extends EventTarget {
      postMessage(message: { type: string; requestId?: string }): void {
        if (message.type === "load") {
          this.emit({
            type: "progress",
            status: "Downloading Qwen model files",
            progress: 50,
            loaded: 289_500_000,
            total: 579_000_000,
          });
          if (!configuration.holdLoading) this.emit({ type: "ready" });
        }
        if (message.type === "generate" && !configuration.holdGeneration) {
          this.emit({
            type: "result",
            requestId: message.requestId,
            text:
              configuration.response ??
              "At Leonardo I develop and optimise real-time computer vision algorithms and contribute to infrared sensor-system design and performance analysis.",
          });
        }
        if (message.type === "cancel") this.emit({ type: "cancelled", requestId: message.requestId });
        if (message.type === "dispose") this.emit({ type: "disposed" });
      }

      terminate(): void {}

      private emit(data: unknown): void {
        window.setTimeout(() => this.dispatchEvent(new MessageEvent("message", { data })), 0);
      }
    }

    Object.defineProperty(window, "Worker", { configurable: true, value: FakeWorker });
  }, options);
}

async function enableFakeQwen(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.getByRole("button", { name: "Enable local Qwen" }).click();
  const confirm = page.getByRole("button", { name: "Download and enable" });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.locator("#model-status")).toContainText("Qwen3 0.6B is ready");
}

test("loads the verified portfolio and opens a deep-linked entry", async ({ page }) => {
  await page.goto("#work/eoc");
  await expect(page).toHaveTitle(/Nicolò Pedrani/);
  await expect(page.locator("#detail-title")).toHaveText("Data Assistant");
  await expect(page.locator("#detail-summary")).toContainText("clinical databases");
  await expect(page.locator("#room-title")).toHaveText("Professional Systems Lab");
  await expect(page.getByRole("button", { name: "EOC · clinical data" })).toHaveAttribute("aria-current", "true");
});

test("exposes every room through contextual HTML stations without a complete index", async ({ page }) => {
  await page.goto("");
  await expect(page.locator("#portfolio-index")).toHaveCount(0);
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.locator("#room-title")).toHaveText("Research Library Lab");
  await page.getByRole("button", { name: "oxDNA study" }).click();
  await expect(page).toHaveURL(/#research\/oxdna-paper$/);
  await expect(page.locator("#detail-title")).toHaveText("OxDNA to Study Species Interactions");
});

test("answers from curated content without model requests before consent", async ({ page }) => {
  const modelRequests: string[] = [];
  page.on("request", (request) => {
    if (/huggingface|jsdelivr|onnx/i.test(request.url())) modelRequests.push(request.url());
  });
  await page.goto("");
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await expect(page.getByRole("button", { name: "Enable local Qwen" })).toBeEnabled();
  await page.getByLabel("Ask about the portfolio").fill("What are your publications?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator(".chat-message--guide").last()).toContainText("two papers");
  expect(modelRequests).toEqual([]);
});

test("simulates consent, progress and grounded local Qwen generation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Worker integration is covered once in desktop Chromium.");
  await installFakeQwen(page);
  await page.goto("");
  await enableFakeQwen(page);
  await page.getByLabel("Ask about the portfolio").fill("What do you do at Leonardo?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator(".chat-message--guide").last()).toContainText("real-time computer vision");
  await expect(page.locator(".chat-message__label").last()).toContainText("Local Qwen · grounded");
  await expect(page.getByRole("button", { name: /Source: R&D System Engineer/ })).toBeVisible();
});

test("cancels local generation and shows the curated fallback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Worker cancellation is covered once in desktop Chromium.");
  await installFakeQwen(page, { holdGeneration: true });
  await page.goto("");
  await enableFakeQwen(page);
  await page.getByLabel("Ask about the portfolio").fill("What do you do at Leonardo?");
  await page.getByRole("button", { name: "Send" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator(".chat-message--guide").last()).toContainText("threat detection and declaration");
  await expect(page.locator(".chat-message__label").last()).toContainText("curated");
});

test("cancels a model download and keeps curated chat usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Worker download cancellation is covered once in desktop Chromium.");
  await installFakeQwen(page, { holdLoading: true });
  await page.goto("");
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.getByRole("button", { name: "Enable local Qwen" }).click();
  const confirm = page.getByRole("button", { name: "Download and enable" });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.locator("#model-progress-container")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Local Qwen model download progress" })).toHaveJSProperty("value", 50);
  await expect(page.locator("#model-progress-label")).toContainText("50%");
  await expect(page.locator("#model-progress-label")).toContainText("290 of 579 MB");
  await page.getByRole("button", { name: "Cancel download" }).click();
  await expect(page.locator("#model-status")).toContainText("download cancelled");
  await expect(page.getByRole("button", { name: "Enable local Qwen" })).toBeEnabled();
});

test("rejects an ungrounded local result and shows the curated fallback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Worker rejection is covered once in desktop Chromium.");
  await installFakeQwen(page, {
    response: "At Leonardo I improved system performance by 99 percent and deployed the result worldwide.",
  });
  await page.goto("");
  await enableFakeQwen(page);
  await page.getByLabel("Ask about the portfolio").fill("What do you do at Leonardo?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator(".chat-message--guide").last()).toContainText("threat detection and declaration");
  await expect(page.locator(".chat-message__label").last()).toContainText("curated");
  await expect(page.locator("#model-status")).toContainText("did not pass the factual guard");
});

test("keeps deep links in sync with browser history", async ({ page }) => {
  await page.goto("#room/work");
  await page.getByRole("button", { name: "EOC · clinical data" }).click();
  await expect(page).toHaveURL(/#work\/eoc$/);
  await page.goBack();
  await expect(page).toHaveURL(/#room\/work$/);
  await expect(page.locator("#room-title")).toHaveText("Professional Systems Lab");
  await page.goForward();
  await expect(page.locator("#detail-title")).toHaveText("Data Assistant");
});

test("moves keyboard users to the contextual station navigator", async ({ page }, testInfo) => {
  await page.goto("");
  const skipLink = page.getByRole("link", { name: "Skip to the room stations" });
  if (testInfo.project.name === "webkit") {
    // macOS WebKit follows the system preference that may exclude links from the Tab sequence.
    await skipLink.focus();
  } else {
    await page.keyboard.press("Tab");
  }
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#room-stations")).toBeFocused();
});

test("supports keyboard-only map interaction", async ({ page }) => {
  await page.goto("#room/work");
  const canvas = page.locator("#portfolio-world");
  await canvas.focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#status-text")).not.toBeEmpty();
  await expect(canvas).toBeFocused();
});

test("has no critical or serious automated accessibility violations", async ({ page }) => {
  await page.goto("");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  expect(serious).toEqual([]);
});

test("renders deterministic room dioramas", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Visual baselines use desktop Chromium.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("");
  for (const room of ["hub", "work", "research", "beyond"] as const) {
    await page.goto(`#room/${room}`);
    await expect(page.locator("#portfolio-world")).toHaveScreenshot(`room-${room}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.03,
    });
  }
});
