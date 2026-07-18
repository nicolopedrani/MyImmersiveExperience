/// <reference lib="webworker" />

import { InterruptableStoppingCriteria, pipeline } from "@huggingface/transformers";
import type { TextGenerationPipeline } from "@huggingface/transformers";
import { MODEL_DOWNLOAD_BYTES, MODEL_ID } from "./modelConfig";
import { buildQwenMessages } from "./prompt";
import type { WorkerRequest, WorkerResponse } from "./types";

let generator: TextGenerationPipeline | undefined;
let activeRequestId: string | undefined;
let stoppingCriteria: InterruptableStoppingCriteria | undefined;
let highestDownloadProgress = 0;
const downloadedFiles = new Map<string, { loaded: number; total: number }>();

function send(message: WorkerResponse): void {
  self.postMessage(message);
}

interface PipelineProgress {
  status?: string;
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
}

function reportDownloadProgress(update: PipelineProgress): void {
  if (update.file && update.total !== undefined) {
    const previous = downloadedFiles.get(update.file);
    downloadedFiles.set(update.file, {
      loaded:
        update.status === "done"
          ? update.total
          : Math.max(previous?.loaded ?? 0, Math.min(update.loaded ?? 0, update.total)),
      total: update.total,
    });
  }

  const loaded = [...downloadedFiles.values()].reduce((sum, file) => sum + file.loaded, 0);
  const callbackProgress = update.progress ?? 0;
  const aggregateProgress = loaded > 0 ? (loaded / MODEL_DOWNLOAD_BYTES) * 100 : callbackProgress;
  highestDownloadProgress = Math.min(99, Math.max(highestDownloadProgress, aggregateProgress));
  send({
    type: "progress",
    status: "Downloading Qwen model files",
    progress: highestDownloadProgress,
    file: update.file,
    loaded,
    total: MODEL_DOWNLOAD_BYTES,
  });
}

async function loadModel(): Promise<void> {
  if (generator) {
    send({
      type: "progress",
      status: "Qwen model ready",
      progress: 100,
      loaded: MODEL_DOWNLOAD_BYTES,
      total: MODEL_DOWNLOAD_BYTES,
    });
    send({ type: "ready" });
    return;
  }

  downloadedFiles.clear();
  highestDownloadProgress = 0;
  generator = (await pipeline("text-generation", MODEL_ID, {
    device: "webgpu",
    dtype: "q4f16",
    progress_callback: reportDownloadProgress,
  })) as TextGenerationPipeline;
  send({
    type: "progress",
    status: "Qwen model ready",
    progress: 100,
    loaded: MODEL_DOWNLOAD_BYTES,
    total: MODEL_DOWNLOAD_BYTES,
  });
  send({ type: "ready" });
}

async function generate(request: Extract<WorkerRequest, { type: "generate" }>): Promise<void> {
  await loadModel();
  if (!generator) throw new Error("The local Qwen model could not be initialised.");

  activeRequestId = request.requestId;
  stoppingCriteria = new InterruptableStoppingCriteria();
  const messages = buildQwenMessages(request);

  try {
    const output = await generator(messages, {
      max_new_tokens: 180,
      do_sample: false,
      repetition_penalty: 1.08,
      stopping_criteria: stoppingCriteria,
      tokenizer_encode_kwargs: { enable_thinking: false },
    });
    if (activeRequestId !== request.requestId || stoppingCriteria.interrupted) {
      send({ type: "cancelled", requestId: request.requestId });
      return;
    }
    const generated = output as unknown as Array<{
      generated_text?: Array<{ role: string; content: string }> | string;
    }>;
    const value = generated[0]?.generated_text;
    const text = Array.isArray(value) ? value.at(-1)?.content : value;
    send({ type: "result", requestId: request.requestId, text: text?.trim() ?? "" });
  } finally {
    if (activeRequestId === request.requestId) {
      activeRequestId = undefined;
      stoppingCriteria = undefined;
    }
  }
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === "cancel") {
    if (request.requestId === activeRequestId) stoppingCriteria?.interrupt();
    return;
  }

  void (async () => {
    try {
      if (request.type === "load") await loadModel();
      if (request.type === "generate") await generate(request);
      if (request.type === "dispose") {
        stoppingCriteria?.interrupt();
        generator = undefined;
        send({ type: "disposed" });
        self.close();
      }
    } catch (error) {
      send({
        type: "error",
        requestId: request.type === "generate" ? request.requestId : undefined,
        message: error instanceof Error ? error.message : "Unknown local-model error",
      });
    }
  })();
});
