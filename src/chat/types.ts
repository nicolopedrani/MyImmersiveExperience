export type ChatMode = "curated" | "local-qwen";
export type ChatIntent = "portfolio" | "small-talk" | "unknown";

export interface GroundedContext {
  entryId: string;
  title: string;
  organization?: string;
  period?: string;
  facts: readonly string[];
  skills: readonly string[];
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type WorkerRequest =
  | { type: "load" }
  | {
      type: "generate";
      requestId: string;
      question: string;
      intent: ChatIntent;
      context: readonly GroundedContext[];
      history: readonly ChatTurn[];
    }
  | { type: "cancel"; requestId: string }
  | { type: "dispose" };

export type WorkerResponse =
  | { type: "progress"; status: string; progress?: number; file?: string; loaded?: number; total?: number }
  | { type: "ready" }
  | { type: "result"; requestId: string; text: string }
  | { type: "cancelled"; requestId: string }
  | { type: "error"; requestId?: string; message: string }
  | { type: "disposed" };

export interface LocalModelCapability {
  available: boolean;
  reason: string;
  availableStorageBytes?: number;
}
