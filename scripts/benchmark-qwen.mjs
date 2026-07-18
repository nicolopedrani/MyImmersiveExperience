/* global document, navigator, performance, window */
import process from "node:process";
import { chromium } from "@playwright/test";

const applicationUrl = process.env.QWEN_BENCHMARK_URL ?? "http://127.0.0.1:5173/MyImmersiveExperience/";
const profileDirectory = process.env.QWEN_BENCHMARK_PROFILE ?? "/tmp/myimmersiveexperience-qwen-benchmark";
const chromePath =
  process.env.QWEN_CHROME_PATH ??
  (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined);

const prompts = [
  "What do you do at Leonardo?",
  "What do you do at EOC?",
  "How does that complement your engineering work?",
];

function log(message) {
  process.stderr.write(`${message}\n`);
}

async function waitForStatus(page, pattern, timeoutMs) {
  const startedAt = Date.now();
  let previous = "";
  while (Date.now() - startedAt < timeoutMs) {
    const status = (await page.locator("#model-status").textContent())?.trim() ?? "";
    if (status !== previous) {
      log(`[Qwen] ${status}`);
      previous = status;
    }
    if (pattern.test(status)) return status;
    await page.waitForTimeout(2_000);
  }
  throw new Error(`Timed out waiting for ${String(pattern)}. Last status: ${previous}`);
}

const context = await chromium.launchPersistentContext(profileDirectory, {
  executablePath: chromePath,
  headless: true,
  args: ["--enable-unsafe-webgpu", "--enable-features=WebGPUDeveloperFeatures"],
});

try {
  await context.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.__qwenBenchmarkResults = [];
    window.Worker = class BenchmarkWorker extends NativeWorker {
      constructor(...arguments_) {
        super(...arguments_);
        this.addEventListener("message", (event) => {
          if (event.data?.type === "result") window.__qwenBenchmarkResults.push(event.data.text);
        });
      }
    };
  });
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(applicationUrl, { waitUntil: "networkidle" });
  const capability = await page.evaluate(async () => {
    const gpu = navigator.gpu;
    if (!gpu) return { gpu: false, adapter: false, shaderF16: false, userAgent: navigator.userAgent };
    const adapter = await gpu.requestAdapter();
    return {
      gpu: true,
      adapter: Boolean(adapter),
      shaderF16: adapter?.features.has("shader-f16") ?? false,
      adapterInfo: adapter?.info
        ? {
            vendor: adapter.info.vendor,
            architecture: adapter.info.architecture,
            device: adapter.info.device,
            description: adapter.info.description,
          }
        : undefined,
      userAgent: navigator.userAgent,
    };
  });
  log(`[Capability] ${JSON.stringify(capability)}`);

  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await page.getByRole("button", { name: "Enable local Qwen" }).click();
  const confirm = page.getByRole("button", { name: "Download and enable" });
  await confirm.waitFor({ state: "visible" });
  await page.waitForFunction(() => !document.querySelector("#model-consent-confirm")?.hasAttribute("disabled"), null, {
    timeout: 30_000,
  });

  const loadStartedAt = performance.now();
  await confirm.click();
  await waitForStatus(page, /Qwen3 0\.6B is ready/, 1_200_000);
  const loadMilliseconds = Math.round(performance.now() - loadStartedAt);

  const results = [];
  for (const prompt of prompts) {
    const answerCount = await page.locator(".chat-message--guide").count();
    const generationStartedAt = performance.now();
    await page.getByLabel("Ask about the portfolio").fill(prompt);
    await page.getByRole("button", { name: "Send" }).click();
    await page.waitForFunction(
      (previousCount) => document.querySelectorAll(".chat-message--guide").length > previousCount,
      answerCount,
      { timeout: 180_000 },
    );
    const answer = page.locator(".chat-message--guide").last();
    const text = (await answer.locator("p").textContent())?.trim() ?? "";
    const label = (await answer.locator(".chat-message__label").textContent())?.trim() ?? "";
    const status = (await page.locator("#model-status").textContent())?.trim() ?? "";
    const rawModelOutput = await page.evaluate(() => window.__qwenBenchmarkResults.at(-1) ?? "");
    const generationMilliseconds = Math.round(performance.now() - generationStartedAt);
    log(`[Answer] ${prompt} (${generationMilliseconds} ms) -> ${label}: ${text}`);
    if (rawModelOutput !== text) log(`[Raw model output] ${rawModelOutput}`);
    results.push({ prompt, rawModelOutput, text, label, status, generationMilliseconds });
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        model: "onnx-community/Qwen3-0.6B-ONNX",
        dtype: "q4f16",
        device: "webgpu",
        capability,
        loadMilliseconds,
        results,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await context.close();
}
