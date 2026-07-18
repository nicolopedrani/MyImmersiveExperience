import { normalizeText, tokenize } from "./retrieval";
import type { ChatIntent, GroundedContext } from "./types";

const protectedNames = [
  "Leonardo",
  "EOC",
  "IOSI",
  "Deloitte",
  "IIT",
  "Parrinello",
  "Deep-TICA",
  "MAIR",
  "University of Milan",
  "Scientific Reports",
  "Entropy",
  "Azure",
  "Power BI",
  "MATLAB",
  "Simulink",
  "Vercel",
  "Salesforce",
];
const metaLanguage =
  /<\/?think>|\b(system prompt|verified context|current question|instructions?|language model|as an ai|grounded context)\b/i;
const urlPattern = /(?:https?:\/\/|www\.)\S+/i;
const sentenceWords = new Set(["as", "at", "could", "for", "hello", "i", "in", "it", "my", "that", "the", "these", "this", "what", "within", "would"]);

function hasRepeatedSequence(value: string): boolean {
  const words = normalizeText(value).split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  for (let index = 0; index <= words.length - 5; index += 1) {
    const sequence = words.slice(index, index + 5).join(" ");
    if (seen.has(sequence)) return true;
    seen.add(sequence);
  }
  return false;
}

function hasUnsupportedNamedEntity(response: string, verified: string): boolean {
  const normalizedVerified = normalizeText(verified);
  for (const match of response.matchAll(/\b[A-Z][A-Za-z0-9+#.-]*\b/g)) {
    const entity = match[0];
    if (normalizeText(entity) === "i" || normalizedVerified.includes(normalizeText(entity))) continue;
    if (sentenceWords.has(normalizeText(entity))) continue;
    return true;
  }
  return false;
}

export function groundedContextText(context: readonly GroundedContext[]): string {
  return context
    .flatMap((entry) => [entry.title, entry.organization ?? "", entry.period ?? "", ...entry.facts, ...entry.skills])
    .join(" ");
}

export function validateGroundedResponse(
  response: string,
  context: readonly GroundedContext[],
  intent: ChatIntent,
): boolean {
  const trimmed = response.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (trimmed.length < 4 || words.length > 120) return false;
  if (metaLanguage.test(trimmed) || urlPattern.test(trimmed) || hasRepeatedSequence(trimmed)) return false;

  const verified = groundedContextText(context);
  const numbers = trimmed.match(/\b\d[\d./–—-]*\b/g) ?? [];
  const verifiedNumbers = new Set(verified.match(/\b\d[\d./–—-]*\b/g) ?? []);
  if (numbers.some((value) => !verifiedNumbers.has(value))) return false;
  const normalizedResponse = normalizeText(trimmed);
  const normalizedVerified = normalizeText(verified);
  if (
    protectedNames.some(
      (name) => normalizedResponse.includes(normalizeText(name)) && !normalizedVerified.includes(normalizeText(name)),
    )
  ) {
    return false;
  }
  if (hasUnsupportedNamedEntity(trimmed, verified)) return false;

  if (intent === "portfolio") {
    if (context.length === 0) return false;
    const verifiedTokens = new Set(tokenize(verified));
    const responseTokens = new Set(tokenize(trimmed));
    const shared = [...responseTokens].filter((token) => verifiedTokens.has(token)).length;
    if (shared < Math.min(3, verifiedTokens.size)) return false;
  }
  if (intent === "unknown" && !/\b(portfolio|work|research|publications?|skills?|interests?|ask|clarif)\b/i.test(trimmed)) {
    return false;
  }

  return true;
}

// Kept as a compatibility export for old benchmark fixtures while the public API migrates.
export function validateLocalRewrite(response: string, verified: string): boolean {
  return validateGroundedResponse(
    response,
    [{ entryId: "legacy", title: "Verified answer", facts: [verified], skills: [] }],
    "portfolio",
  );
}
