import { describe, expect, it } from "vitest";
import { normalizeText, retrievePortfolioAnswer, tokenize } from "./retrieval";

const questions: Array<[string, string]> = [
  ["What do you do at Leonardo?", "work-leonardo"],
  ["What is your current role?", "work-leonardo"],
  ["Tell me about MAIR", "work-leonardo"],
  ["Do you work with infrared systems?", "work-leonardo"],
  ["What do you do at EOC?", "work-eoc"],
  ["Tell me about IOSI", "work-eoc"],
  ["Do you work with clinical data?", "work-eoc"],
  ["What did you do at Deloitte?", "work-deloitte"],
  ["Have you used Power BI?", "work-deloitte"],
  ["Tell me about forecasting", "work-deloitte"],
  ["What is your education?", "education"],
  ["Where did you study physics?", "education"],
  ["Tell me about your PhD research", "research-phd"],
  ["Did you author Deep-TICA?", "research-phd"],
  ["What are your publications?", "publication-neuromorphic"],
  ["Tell me about the neuromorphic paper", "publication-neuromorphic"],
  ["What was your contribution to the network paper?", "publication-neuromorphic"],
  ["What is the oxDNA paper?", "publication-oxdna"],
  ["Did you develop software for oxDNA?", "publication-oxdna"],
  ["Do you coach football?", "personal-football"],
  ["Tell me about volunteering", "personal-volunteering"],
  ["Do you enjoy reading?", "personal-curiosity"],
  ["What are your travel interests?", "personal-curiosity"],
  ["What is MyImmersiveExperience?", "project-immersive"],
  ["Did you build this with TypeScript?", "project-immersive"],
  ["Can I see your CV?", "about"],
  ["Which skills do you use most?", "work-leonardo"],
  ["Hi", "about"],
  ["Give me an overview of your background", "about"],
  ["Do you have molecular dynamics experience?", "research-phd"],
  ["Have you worked with Azure?", "work-deloitte"],
];

describe("curated portfolio retrieval", () => {
  it.each(questions)("matches %s", (question, expectedEntry) => {
    const response = retrievePortfolioAnswer(question);
    expect(response.confidence).not.toBe("low");
    expect(response.entryIds).toContain(expectedEntry);
    expect(response.answer.length).toBeGreaterThan(30);
    expect(response.context.length).toBeGreaterThan(0);
  });

  it("does not treat the letters in 'which' as a greeting", () => {
    const response = retrievePortfolioAnswer("Which skills do you use most?");
    expect(response.answer).not.toMatch(/^Hello/);
  });

  it("returns a deterministic low-confidence answer for an unrelated question", () => {
    const first = retrievePortfolioAnswer("What is the weather on Mars tomorrow?");
    const second = retrievePortfolioAnswer("What is the weather on Mars tomorrow?");
    expect(first).toEqual(second);
    expect(first.confidence).toBe("low");
    expect(first.intent).toBe("unknown");
    expect(first.entryIds).toEqual([]);
  });

  it("classifies greetings as small talk and portfolio matches as grounded questions", () => {
    expect(retrievePortfolioAnswer("Hello").intent).toBe("small-talk");
    expect(retrievePortfolioAnswer("Tell me about Leonardo").intent).toBe("portfolio");
  });

  it("normalizes accents and drops stop words without substring matching", () => {
    expect(normalizeText("Nicolò's R&D")).toBe("nicolo s r&d");
    expect(tokenize("Which tools do you use?")).toEqual(["tools", "use"]);
  });

  it("carries the previous source into a genuine multi-turn follow-up", () => {
    const response = retrievePortfolioAnswer("How does that complement your engineering work?", ["work-eoc"]);
    expect(response.intent).toBe("portfolio");
    expect(response.entryIds).toContain("work-eoc");
    expect(response.entryIds).toContain("work-leonardo");
    expect(response.context.map((entry) => entry.entryId)).toEqual(expect.arrayContaining(["work-eoc", "work-leonardo"]));
  });
});
