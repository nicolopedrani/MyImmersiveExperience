import { describe, expect, it } from "vitest";
import benchmark from "../../tests/fixtures/qwen-webgpu-apple-m1.json";
import { buildGroundedContext, retrievePortfolioAnswer } from "./retrieval";
import { validateGroundedResponse, validateLocalRewrite } from "./rewriteGuard";

const eocContext = buildGroundedContext(["work-eoc"]);
const verifiedEoc =
  "At EOC, within the IOSI Prostate Cancer Group, I work part-time on database cleaning and organisation and on interactive tools for data entry and visualisation of statistical analyses.";

describe("local Qwen factual guard", () => {
  it("accepts a concise answer grounded in the selected entry", () => {
    expect(
      validateGroundedResponse(
        "At EOC, within the IOSI Prostate Cancer Group, I work part-time on database cleaning and interactive tools for data entry and visualisation.",
        eocContext,
        "portfolio",
      ),
    ).toBe(true);
  });

  it("rejects thinking, prompt leakage, URLs and repeated text", () => {
    expect(validateGroundedResponse("<think>I should answer</think> At EOC I clean data.", eocContext, "portfolio")).toBe(false);
    expect(validateGroundedResponse("The verified context says that I work at EOC.", eocContext, "portfolio")).toBe(false);
    expect(validateGroundedResponse("See https://example.com for my EOC work.", eocContext, "portfolio")).toBe(false);
    expect(
      validateGroundedResponse(
        "At EOC I clean clinical data and build tools. At EOC I clean clinical data and build tools.",
        eocContext,
        "portfolio",
      ),
    ).toBe(false);
  });

  it("rejects new numbers and protected organisations", () => {
    expect(validateGroundedResponse("At EOC I improved data quality by 20 percent.", eocContext, "portfolio")).toBe(false);
    expect(validateGroundedResponse("At EOC I also collaborate with Deloitte on clinical data.", eocContext, "portfolio")).toBe(false);
    expect(validateGroundedResponse("At EOC I use TensorFlow to analyse clinical data.", eocContext, "portfolio")).toBe(false);
    expect(validateGroundedResponse("At EOC I also collaborate with deloitte on clinical data.", eocContext, "portfolio")).toBe(false);
  });

  it("allows small talk but constrains unknown questions to portfolio clarification", () => {
    expect(validateGroundedResponse("Hello! What would you like to explore?", buildGroundedContext(["about"]), "small-talk")).toBe(true);
    expect(validateGroundedResponse("Paris is the capital of France.", [], "unknown")).toBe(false);
    expect(validateGroundedResponse("Could you clarify which portfolio area you want to explore?", [], "unknown")).toBe(true);
  });

  it("retains the compatibility guard for the previous benchmark fixtures", () => {
    expect(validateLocalRewrite(verifiedEoc, verifiedEoc)).toBe(true);
    const failedOutput =
      "Okay, I'm ready to be the first person in the Verified Answer. I'm ready to be the first person to answer the question. I'm ready to be the first person to answer the question.";
    expect(validateLocalRewrite(failedOutput, verifiedEoc)).toBe(false);
  });

  it("keeps every recorded real WebGPU output inside its retrieved context", () => {
    let previousEntryIds: readonly string[] = [];
    for (const result of benchmark.results) {
      const retrieved = retrievePortfolioAnswer(result.prompt, previousEntryIds);
      expect(validateGroundedResponse(result.output, retrieved.context, retrieved.intent), result.prompt).toBe(true);
      previousEntryIds = retrieved.entryIds;
    }
  });
});
