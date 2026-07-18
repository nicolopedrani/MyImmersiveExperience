import { getPortfolioEntry, portfolioContent } from "../content/portfolio";
import {
  clearLocalModelCache,
  detectLocalModelCapability,
  LocalModelController,
  MODEL_DOWNLOAD_BYTES,
} from "../chat/localModel";
import { retrievePortfolioAnswer } from "../chat/retrieval";
import { validateGroundedResponse } from "../chat/rewriteGuard";
import type { ChatMode, ChatTurn, WorkerResponse } from "../chat/types";

type OpenEntry = (entryId: string) => void;

interface StoredMessage {
  role: "visitor" | "guide";
  text: string;
  entryIds: readonly string[];
  locallyGenerated?: boolean;
}

const MODE_KEY = "mie.chatMode";
const HISTORY_KEY = "mie.chatHistory";

function formatRemainingTime(seconds: number): string {
  if (seconds < 60) return `about ${Math.max(1, Math.ceil(seconds))}s remaining`;
  return `about ${Math.ceil(seconds / 60)} min remaining`;
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

function canUseModal(dialog: HTMLDialogElement): boolean {
  return typeof dialog.showModal === "function";
}

function openDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) return;
  if (canUseModal(dialog)) dialog.showModal();
  else dialog.setAttribute("open", "");
}

function safeCloseDialog(dialog: HTMLDialogElement): void {
  if (!dialog.open) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function readHistory(): StoredMessage[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (message): message is StoredMessage =>
          typeof message === "object" &&
          message !== null &&
          (message.role === "visitor" || message.role === "guide") &&
          typeof message.text === "string" &&
          Array.isArray(message.entryIds),
      )
      .slice(-12);
  } catch {
    return [];
  }
}

export class PortfolioChat {
  private readonly dialog = requiredElement<HTMLDialogElement>("chat-dialog");
  private readonly consentDialog = requiredElement<HTMLDialogElement>("model-consent-dialog");
  private readonly messages = requiredElement<HTMLOListElement>("chat-messages");
  private readonly form = requiredElement<HTMLFormElement>("chat-form");
  private readonly input = requiredElement<HTMLInputElement>("chat-input");
  private readonly suggestions = requiredElement<HTMLDivElement>("chat-suggestions");
  private readonly modeButton = requiredElement<HTMLButtonElement>("chat-mode-button");
  private readonly modelStatus = requiredElement<HTMLParagraphElement>("model-status");
  private readonly modelProgressContainer = requiredElement<HTMLDivElement>("model-progress-container");
  private readonly modelProgress = requiredElement<HTMLProgressElement>("model-progress");
  private readonly modelProgressLabel = requiredElement<HTMLOutputElement>("model-progress-label");
  private readonly cancelButton = requiredElement<HTMLButtonElement>("chat-cancel");
  private readonly consentCancelButton = requiredElement<HTMLButtonElement>("model-consent-cancel");
  private readonly modelController = new LocalModelController();
  private readonly storedMessages = readHistory();
  private mode: ChatMode = sessionStorage.getItem(MODE_KEY) === "local-qwen" ? "local-qwen" : "curated";
  private hasRenderedHistory = false;
  private busy = false;
  private loadingModel = false;
  private downloadStartedAt: number | undefined;

  constructor(private readonly openEntry: OpenEntry) {
    this.updateModeButton();
    this.bindEvents();
    this.modelController.setProgressListener((progress) => {
      this.updateModelProgress(progress);
      this.setModelStatus(progress.status);
    });
  }

  open(): void {
    openDialog(this.dialog);
    if (!this.hasRenderedHistory) {
      if (this.storedMessages.length === 0) {
        this.renderMessage({
          role: "guide",
          text: "I am the conversational avatar of Nicolò's reviewed portfolio—not Nicolò himself. Enable local Qwen for grounded, generative answers, or ask immediately using curated mode.",
          entryIds: ["about"],
        });
      } else {
        this.storedMessages.forEach((message) => this.renderMessage(message));
      }
      this.renderSuggestions([
        "What do you do at Leonardo?",
        "Tell me about your publications",
        "What is your technical background?",
      ]);
      this.hasRenderedHistory = true;
    }
    window.setTimeout(() => this.input.focus(), 0);
  }

  close(): void {
    safeCloseDialog(this.dialog);
  }

  private bindEvents(): void {
    requiredElement<HTMLButtonElement>("chat-close").addEventListener("click", () => this.close());
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.close();
    });
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.answer(this.input.value);
    });
    this.modeButton.addEventListener("click", () => {
      if (this.mode === "local-qwen") {
        this.mode = "curated";
        sessionStorage.setItem(MODE_KEY, this.mode);
        this.updateModeButton();
        this.setModelStatus("Curated fallback answers are active. Cached Qwen files remain on this device.");
      } else {
        void this.offerLocalMode();
      }
    });
    this.cancelButton.addEventListener("click", () => this.modelController.cancel());
    this.consentCancelButton.addEventListener("click", () => {
      if (this.loadingModel) {
        this.loadingModel = false;
        this.modelController.dispose();
        this.mode = "curated";
        sessionStorage.setItem(MODE_KEY, this.mode);
        this.updateModeButton();
        this.setModelStatus("Local Qwen download cancelled; curated answers remain active.");
        safeCloseDialog(this.consentDialog);
        this.stopModelProgress("Download cancelled");
      }
      safeCloseDialog(this.consentDialog);
    });
    requiredElement<HTMLButtonElement>("model-consent-confirm").addEventListener("click", () => {
      void this.enableLocalMode();
    });
    requiredElement<HTMLButtonElement>("model-cache-clear").addEventListener("click", () => {
      void this.clearCache();
    });
  }

  private async offerLocalMode(): Promise<void> {
    const detail = requiredElement<HTMLParagraphElement>("model-capability-detail");
    const confirm = requiredElement<HTMLButtonElement>("model-consent-confirm");
    this.hideModelProgress();
    detail.textContent = "Checking WebGPU and browser storage…";
    confirm.disabled = true;
    openDialog(this.consentDialog);
    const capability = await detectLocalModelCapability();
    const storage = capability.availableStorageBytes
      ? ` Approximately ${Math.floor(capability.availableStorageBytes / 1024 / 1024)} MB is available.`
      : "";
    detail.textContent = `${capability.reason}${storage}`;
    confirm.disabled = !capability.available;
  }

  private async enableLocalMode(): Promise<void> {
    const confirm = requiredElement<HTMLButtonElement>("model-consent-confirm");
    confirm.disabled = true;
    this.loadingModel = true;
    this.consentCancelButton.textContent = "Cancel download";
    this.startModelProgress();
    this.setModelStatus("Preparing local Qwen…");
    try {
      await this.modelController.load();
      if (!this.loadingModel) return;
      this.mode = "local-qwen";
      sessionStorage.setItem(MODE_KEY, this.mode);
      this.updateModeButton();
      this.setModelStatus("Qwen3 0.6B is ready. Answers are generated locally from verified portfolio context.");
      safeCloseDialog(this.consentDialog);
      this.completeModelProgress();
    } catch (error) {
      if (!this.loadingModel) return;
      this.mode = "curated";
      sessionStorage.setItem(MODE_KEY, this.mode);
      this.updateModeButton();
      this.setModelStatus(error instanceof Error ? error.message : "The local model could not be loaded.");
      this.stopModelProgress("Download interrupted");
      confirm.disabled = false;
    } finally {
      this.loadingModel = false;
      this.consentCancelButton.textContent = "Keep curated answers";
    }
  }

  private getConversationHistory(): ChatTurn[] {
    return this.storedMessages.slice(-6).map((message) => ({
      role: message.role === "visitor" ? "user" : "assistant",
      content: message.text,
    }));
  }

  private getPreviousEntryIds(): readonly string[] {
    return [...this.storedMessages].reverse().find((message) => message.role === "guide" && message.entryIds.length > 0)
      ?.entryIds ?? [];
  }

  private async answer(rawQuestion: string): Promise<void> {
    const question = rawQuestion.trim();
    if (!question || this.busy) return;
    this.input.value = "";
    const history = this.getConversationHistory();
    const previousEntryIds = this.getPreviousEntryIds();
    this.addMessage({ role: "visitor", text: question, entryIds: [] });
    const curated = retrievePortfolioAnswer(question, previousEntryIds);

    this.busy = true;
    this.setBusy(true);
    let finalAnswer = curated.answer;
    let locallyGenerated = false;
    if (this.mode === "local-qwen") {
      this.setModelStatus("Qwen is generating from the verified portfolio context…");
      try {
        const generated = await this.modelController.generate({
          question,
          intent: curated.intent,
          context: curated.context,
          history,
        });
        if (validateGroundedResponse(generated, curated.context, curated.intent)) {
          finalAnswer = generated;
          locallyGenerated = true;
        } else {
          this.setModelStatus("Qwen's response did not pass the factual guard; showing the curated fallback.");
        }
      } catch (error) {
        this.setModelStatus(error instanceof Error ? `${error.message} Curated fallback shown.` : "Qwen failed; curated fallback shown.");
      }
    }

    this.addMessage({ role: "guide", text: finalAnswer, entryIds: curated.entryIds, locallyGenerated });
    this.renderSuggestions(curated.suggestions);
    this.busy = false;
    this.setBusy(false);
    if (locallyGenerated) this.setModelStatus("Local Qwen · grounded in reviewed portfolio sources.");
  }

  private addMessage(message: StoredMessage): void {
    this.storedMessages.push(message);
    if (this.storedMessages.length > 12) this.storedMessages.splice(0, this.storedMessages.length - 12);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(this.storedMessages));
    this.renderMessage(message);
  }

  private renderMessage(message: StoredMessage): void {
    const item = document.createElement("li");
    item.className = `chat-message chat-message--${message.role}`;
    const label = document.createElement("span");
    label.className = "chat-message__label";
    label.textContent =
      message.role === "visitor" ? "You" : message.locallyGenerated ? "Portfolio avatar · Local Qwen · grounded" : "Portfolio avatar · curated";
    const paragraph = document.createElement("p");
    paragraph.textContent = message.text;
    item.append(label, paragraph);

    const validEntries = message.entryIds.map(getPortfolioEntry).filter((entry) => entry !== undefined);
    if (validEntries.length > 0) {
      const links = document.createElement("div");
      links.className = "chat-message__sources";
      validEntries.forEach((entry) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `Source: ${entry.title}`;
        button.addEventListener("click", () => {
          this.close();
          this.openEntry(entry.id);
        });
        links.append(button);
      });
      item.append(links);
    }

    this.messages.append(item);
    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  private renderSuggestions(suggestions: readonly string[]): void {
    this.suggestions.replaceChildren();
    suggestions.slice(0, 3).forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion;
      button.addEventListener("click", () => {
        this.input.value = suggestion;
        void this.answer(suggestion);
      });
      this.suggestions.append(button);
    });
  }

  private setBusy(value: boolean): void {
    this.form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = value;
    this.input.disabled = value;
    this.cancelButton.hidden = !value || this.mode !== "local-qwen";
  }

  private updateModeButton(): void {
    const local = this.mode === "local-qwen";
    this.modeButton.textContent = local ? "Use curated fallback" : "Enable local Qwen";
    this.modeButton.setAttribute("aria-pressed", String(local));
    if (!local) this.modelStatus.textContent = "Curated answers are active; local Qwen is optional.";
  }

  private setModelStatus(message: string): void {
    this.modelStatus.textContent = message;
  }

  private startModelProgress(): void {
    this.downloadStartedAt = performance.now();
    this.placeModelProgress();
    this.modelProgressContainer.hidden = false;
    this.modelProgress.value = 0;
    this.modelProgressLabel.textContent = "0% · 0 of 579 MB";
  }

  private updateModelProgress(progress: Extract<WorkerResponse, { type: "progress" }>): void {
    if (this.downloadStartedAt === undefined) this.downloadStartedAt = performance.now();
    this.placeModelProgress();
    this.modelProgressContainer.hidden = false;
    const percentage = Math.max(0, Math.min(100, progress.progress ?? 0));
    this.modelProgress.value = percentage;

    const loaded = progress.loaded ?? 0;
    const total = progress.total ?? MODEL_DOWNLOAD_BYTES;
    const loadedMegabytes = Math.min(Math.round(loaded / 1_000_000), Math.round(total / 1_000_000));
    const totalMegabytes = Math.round(total / 1_000_000);
    let estimate = "";
    const elapsedSeconds = (performance.now() - this.downloadStartedAt) / 1000;
    if (elapsedSeconds >= 3 && loaded > 0 && loaded < total) {
      const bytesPerSecond = loaded / elapsedSeconds;
      estimate = ` · ${formatRemainingTime((total - loaded) / bytesPerSecond)}`;
    }
    this.modelProgressLabel.textContent = `${Math.round(percentage)}% · ${loadedMegabytes} of ${totalMegabytes} MB${estimate}`;
  }

  private completeModelProgress(): void {
    this.downloadStartedAt = undefined;
    this.placeModelProgress();
    this.modelProgressContainer.hidden = false;
    this.modelProgress.value = 100;
    this.modelProgressLabel.textContent = "100% · model ready";
  }

  private stopModelProgress(label: string): void {
    this.downloadStartedAt = undefined;
    this.placeModelProgress();
    this.modelProgressContainer.hidden = false;
    this.modelProgressLabel.textContent = `${Math.round(this.modelProgress.value)}% · ${label}`;
  }

  private hideModelProgress(): void {
    this.downloadStartedAt = undefined;
    this.modelProgressContainer.hidden = true;
    this.modelProgress.value = 0;
    this.modelProgressLabel.textContent = "0%";
  }

  private placeModelProgress(): void {
    const anchor = this.consentDialog.open
      ? requiredElement<HTMLParagraphElement>("model-capability-detail")
      : this.modelStatus;
    if (this.modelProgressContainer.previousElementSibling !== anchor) anchor.after(this.modelProgressContainer);
  }

  private async clearCache(): Promise<void> {
    this.modelController.dispose();
    this.mode = "curated";
    sessionStorage.setItem(MODE_KEY, this.mode);
    this.updateModeButton();
    const deleted = await clearLocalModelCache();
    this.hideModelProgress();
    this.setModelStatus(
      deleted > 0 ? `Removed ${deleted} local model cache entr${deleted === 1 ? "y" : "ies"}.` : "No model cache was found.",
    );
  }
}

export function getModelDownloadMegabytes(): number {
  return Math.round(MODEL_DOWNLOAD_BYTES / 1_000_000);
}

export function getResumeUrl(): string {
  return portfolioContent.profile.resumeUrl;
}
