import { describe, expect, it } from "vitest";
import { buildGroundedContext } from "./retrieval";
import { buildQwenMessages, serializeGroundedContext } from "./prompt";
import type { ChatTurn } from "./types";

describe("Qwen grounded prompt", () => {
  it("serializes reviewed facts without links or private references", () => {
    const serialized = serializeGroundedContext(buildGroundedContext(["work-leonardo"]));
    expect(serialized).toContain("R&D System Engineer");
    expect(serialized).toContain("Non-public details are intentionally excluded");
    expect(serialized).not.toContain("references/");
    expect(serialized).not.toContain("https://");
  });

  it("keeps only the latest three conversation pairs", () => {
    const history: ChatTurn[] = Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `turn-${index}`,
    }));
    const messages = buildQwenMessages({
      question: "What do you do at EOC?",
      intent: "portfolio",
      context: buildGroundedContext(["work-eoc"]),
      history,
    });
    const transcript = messages.map((message) => message.content).join("\n");
    expect(transcript).not.toContain("turn-0");
    expect(transcript).not.toContain("turn-1");
    expect(transcript).toContain("turn-2");
    expect(transcript).toContain("turn-7");
  });

  it("uses dedicated instructions for small talk and unknown questions", () => {
    const smallTalk = buildQwenMessages({ question: "Hi", intent: "small-talk", context: [], history: [] });
    const unknown = buildQwenMessages({ question: "Weather?", intent: "unknown", context: [], history: [] });
    expect(smallTalk[0]?.content).toContain("respond warmly");
    expect(unknown[0]?.content).toContain("Ask one concise clarifying question");
  });
});
