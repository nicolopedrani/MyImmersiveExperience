import type {
  ChatIntent,
  ChatTurn,
  GroundedContext,
  LocalModelCapability,
  WorkerRequest,
  WorkerResponse,
} from "./types";

export { MODEL_DOWNLOAD_BYTES } from "./modelConfig";
const MINIMUM_FREE_STORAGE = 900 * 1024 * 1024;
const MODEL_CACHE_PATTERN = /(transformers|huggingface|onnx|qwen)/i;

interface NavigatorWithGpu extends Navigator {
  gpu?: {
    requestAdapter: () => Promise<{ features?: { has: (feature: string) => boolean } } | null>;
  };
}

export async function detectLocalModelCapability(): Promise<LocalModelCapability> {
  const gpu = (navigator as NavigatorWithGpu).gpu;
  if (!gpu) return { available: false, reason: "WebGPU is not exposed by this browser or device." };

  let adapter: { features?: { has: (feature: string) => boolean } } | null;
  try {
    adapter = await gpu.requestAdapter();
  } catch {
    return { available: false, reason: "The browser could not request a WebGPU adapter." };
  }
  if (!adapter) return { available: false, reason: "No compatible WebGPU adapter is available." };
  if (!adapter.features?.has("shader-f16")) {
    return { available: false, reason: "The available GPU does not support the shader-f16 feature required by Qwen." };
  }

  try {
    const estimate = await navigator.storage?.estimate();
    if (estimate?.quota !== undefined && estimate.usage !== undefined) {
      const availableStorageBytes = Math.max(0, estimate.quota - estimate.usage);
      if (availableStorageBytes < MINIMUM_FREE_STORAGE) {
        return {
          available: false,
          reason: "Less than 900 MB of browser storage is currently available.",
          availableStorageBytes,
        };
      }
      return { available: true, reason: "WebGPU and sufficient browser storage are available.", availableStorageBytes };
    }
  } catch {
    // Storage estimation is optional. The visitor still sees the model size before consenting.
  }

  return { available: true, reason: "WebGPU is available; browser storage could not be estimated." };
}

export interface LocalGenerationRequest {
  question: string;
  intent: ChatIntent;
  context: readonly GroundedContext[];
  history: readonly ChatTurn[];
}

export class LocalModelController {
  private worker: Worker | undefined;
  private ready = false;
  private loadReject: ((reason: Error) => void) | undefined;
  private loadCleanup: (() => void) | undefined;
  private activeRequestId: string | undefined;
  private activeReject: ((reason: Error) => void) | undefined;
  private activeCleanup: (() => void) | undefined;
  private progressListener: ((message: Extract<WorkerResponse, { type: "progress" }>) => void) | undefined;

  setProgressListener(listener: (message: Extract<WorkerResponse, { type: "progress" }>) => void): void {
    this.progressListener = listener;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    this.worker = new Worker(new URL("./model.worker.ts", import.meta.url), { type: "module" });
    return this.worker;
  }

  async load(): Promise<void> {
    if (this.ready) return;
    const worker = this.ensureWorker();
    await new Promise<void>((resolve, reject) => {
      const cleanup = (): void => {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        this.loadReject = undefined;
        this.loadCleanup = undefined;
      };
      const onMessage = (event: MessageEvent<WorkerResponse>): void => {
        const message = event.data;
        if (message.type === "progress") this.progressListener?.(message);
        if (message.type === "ready") {
          cleanup();
          this.ready = true;
          resolve();
        }
        if (message.type === "error" && !message.requestId) {
          cleanup();
          reject(new Error(message.message));
        }
      };
      const onError = (): void => {
        cleanup();
        reject(new Error("The local-model worker stopped unexpectedly."));
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      this.loadReject = reject;
      this.loadCleanup = cleanup;
      worker.postMessage({ type: "load" } satisfies WorkerRequest);
    });
  }

  async generate(request: LocalGenerationRequest): Promise<string> {
    await this.load();
    const worker = this.ensureWorker();
    const requestId = crypto.randomUUID();
    this.activeRequestId = requestId;
    return new Promise<string>((resolve, reject) => {
      const cleanup = (): void => {
        worker.removeEventListener("message", onMessage);
        this.activeRequestId = undefined;
        this.activeReject = undefined;
        this.activeCleanup = undefined;
      };
      const onMessage = (event: MessageEvent<WorkerResponse>): void => {
        const message = event.data;
        if (message.type === "progress") this.progressListener?.(message);
        if (message.type === "result" && message.requestId === requestId) {
          cleanup();
          resolve(message.text);
        }
        if (message.type === "cancelled" && message.requestId === requestId) {
          cleanup();
          reject(new Error("Local Qwen generation cancelled."));
        }
        if (message.type === "error" && message.requestId === requestId) {
          cleanup();
          reject(new Error(message.message));
        }
      };
      this.activeReject = reject;
      this.activeCleanup = cleanup;
      worker.addEventListener("message", onMessage);
      worker.postMessage({ type: "generate", requestId, ...request } satisfies WorkerRequest);
    });
  }

  cancel(): void {
    if (!this.activeRequestId) return;
    this.worker?.postMessage({ type: "cancel", requestId: this.activeRequestId } satisfies WorkerRequest);
    this.activeReject?.(new Error("Local Qwen generation cancelled."));
    this.activeCleanup?.();
    this.activeRequestId = undefined;
    this.activeReject = undefined;
    this.activeCleanup = undefined;
  }

  dispose(): void {
    this.loadReject?.(new Error("Local Qwen download cancelled."));
    this.loadCleanup?.();
    this.activeReject?.(new Error("Local Qwen generation stopped."));
    this.activeCleanup?.();
    if (this.worker) {
      this.worker.postMessage({ type: "dispose" } satisfies WorkerRequest);
      this.worker.terminate();
    }
    this.worker = undefined;
    this.ready = false;
    this.loadReject = undefined;
    this.loadCleanup = undefined;
    this.activeRequestId = undefined;
    this.activeReject = undefined;
    this.activeCleanup = undefined;
  }
}

export async function clearLocalModelCache(): Promise<number> {
  if (!("caches" in window)) return 0;
  const keys = await caches.keys();
  const matching = keys.filter((key) => MODEL_CACHE_PATTERN.test(key));
  const deleted = await Promise.all(matching.map((key) => caches.delete(key)));
  return deleted.filter(Boolean).length;
}
