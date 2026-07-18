# Chat and browser support

Last reviewed: 18 July 2026.

## Grounded conversation

Retrieval normalises each question, detects small talk and explicit multi-entry intents, then scores aliases, titles,
organisations, summaries and skills. It returns structured `GroundedContext`, source entry IDs, suggestions and a curated
fallback. The model never selects or generates source links.

With local Qwen enabled, the worker receives the current question, intent, grounding context and at most three recent
conversation pairs. Qwen generates the answer directly in non-thinking mode. The guard rejects new numbers, protected
entities, URLs, prompt leakage, thinking blocks, excessive length and repetition. A rejected or interrupted generation
falls back to the curated answer.

The interface calls itself a portfolio avatar, not Nicolò. It may write in first person and handle small talk, but every
personal or professional assertion must be present in the supplied context. DOM text nodes are used instead of
`innerHTML`.

## Local Qwen

The optional path uses `@huggingface/transformers@4.2.0` and
`onnx-community/Qwen3-0.6B-ONNX` in `q4f16` on WebGPU. Model and tokenizer total approximately 579 MB.

1. Curated mode works immediately.
2. The visitor explicitly asks to enable local Qwen.
3. Capability checks require WebGPU, `shader-f16` and at least 900 MB reported free storage when available.
4. The consent dialog displays model, origin, license, download size and cache behaviour.
5. A lazy module worker downloads and caches files with an accessible progress bar, aggregate percentage, transferred
   MB, a download-based ETA and cancellation. The ETA uses only the active transfer; it does not run a separate speed
   test.
6. Valid generated answers are labelled “Local Qwen · grounded”; every failure returns to curated mode.

Session storage retains mode and the latest 12 chat messages. Cache Storage can retain model files across visits until
the visitor clears them. No speed test, preload or user-agent rule is used.

## Known npm deprecation

`npm ci` reports `boolean@3.2.0` as deprecated through
`@huggingface/transformers → onnxruntime-node@1.24.3 → global-agent@3`. Transformers.js installs Node and web backends in
one package even though Vite selects the web export here. `boolean`, `global-agent` and `onnxruntime-node` are not present
in `dist`; `npm audit` currently reports no vulnerability.

The dependency stays pinned rather than overriding the exact ONNX version expected by Transformers.js. Dependabot
checks weekly, and the exception should be removed when a compatible upstream release updates the Node chain.

## Browser policy

The curated experience targets current and previous stable Chrome, Edge, Firefox and Safari releases and is exercised
through Chromium, Firefox, WebKit and mobile Chromium Playwright projects. Qwen is capability-gated and requires real
hardware validation; devices without suitable WebGPU retain the full curated experience.

## Recorded WebGPU benchmark

The regression fixture in `tests/fixtures/qwen-webgpu-apple-m1.json` records a real three-turn run in Google Chrome on
an 8 GB Apple M1 MacBook Air. The first uncached load completed in 53.7 seconds, a cached load in 10.5 seconds, and all
three final outputs passed the factual guard. The benchmark script is `node scripts/benchmark-qwen.mjs`; it uses a
temporary persistent browser profile so the downloaded model never enters the repository.

A second physical WebGPU device is still a release-owner manual check. Playwright browser emulation is not presented as
a substitute for different GPU hardware.
