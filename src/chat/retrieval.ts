import { portfolioContent } from "../content/portfolio";
import type { ProfileEntry } from "../content/types";
import type { ChatIntent, GroundedContext } from "./types";

export interface CuratedResponse {
  answer: string;
  entryIds: readonly string[];
  context: readonly GroundedContext[];
  intent: ChatIntent;
  confidence: "high" | "medium" | "low";
  suggestions: readonly string[];
}

const stopWords = new Set([
  "a", "about", "an", "and", "are", "at", "be", "can", "did", "do", "does", "for", "from", "have",
  "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "please", "tell", "the", "to", "what",
  "when", "where", "which", "who", "with", "you", "your",
]);

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#&-]+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function scoreEntry(query: string, tokens: readonly string[], entry: ProfileEntry): number {
  const normalizedQuery = normalizeText(query);
  const aliases = entry.chatAliases.map(normalizeText);
  const searchable = normalizeText(
    [entry.title, entry.organization, entry.summary, ...entry.skills, ...entry.chatAliases].filter(Boolean).join(" "),
  );
  const searchableTokens = new Set(tokenize(searchable));
  let score = 0;

  for (const alias of aliases) {
    if (normalizedQuery === alias) score += 12;
    else if (alias.length > 3 && normalizedQuery.includes(alias)) score += 7;
  }
  for (const token of tokens) {
    if (searchableTokens.has(token)) score += token.length >= 7 ? 3 : 2;
    if (normalizeText(entry.title).includes(token)) score += 2;
    if (entry.organization && normalizeText(entry.organization).includes(token)) score += 2;
  }
  return score;
}

const standardSuggestions = [
  "What do you do at Leonardo?",
  "Tell me about your publications",
  "What is your technical background?",
];

export function buildGroundedContext(entryIds: readonly string[]): GroundedContext[] {
  const ids = new Set(entryIds);
  return portfolioContent.entries
    .filter((entry) => ids.has(entry.id))
    .map((rawEntry) => {
      const entry: ProfileEntry = rawEntry;
      return {
        entryId: entry.id,
        title: entry.title,
        organization: entry.organization,
        period: entry.period,
        facts: [entry.summary, ...entry.details, entry.curatedAnswer],
        skills: entry.skills,
      };
    });
}

function combinedResponse(
  answer: string,
  entryIds: readonly string[],
  suggestions: readonly string[],
  intent: ChatIntent = "portfolio",
): CuratedResponse {
  return { answer, entryIds, context: buildGroundedContext(entryIds), intent, confidence: "high", suggestions };
}

export function retrievePortfolioAnswer(question: string, previousEntryIds: readonly string[] = []): CuratedResponse {
  const normalized = normalizeText(question);
  const tokens = tokenize(question);

  if (!normalized) {
    return {
      answer: "Ask me about Nicolò's current work, research, publications, skills or interests.",
      entryIds: [],
      context: [],
      intent: "unknown",
      confidence: "low",
      suggestions: standardSuggestions,
    };
  }

  const greetingTokens = new Set(["hello", "hi", "hey", "welcome"]);
  if (tokens.length <= 2 && tokens.some((token) => greetingTokens.has(token))) {
    return combinedResponse(
      "Hello. I am the conversational guide to Nicolò's reviewed portfolio. I can help you explore his work, research, publications and interests.",
      ["about"],
      standardSuggestions,
      "small-talk",
    );
  }

  if (/\b(publications?|papers?|articles?)\b/.test(normalized)) {
    return combinedResponse(
      "I co-authored two papers in 2022: a Scientific Reports paper on stochastic simulation of neuromorphic metallic nanojunction networks, and an Entropy paper using oxDNA to study interactions between single-stranded DNA species. The portfolio cards describe my documented contribution to each paper.",
      ["publication-neuromorphic", "publication-oxdna"],
      ["What was your contribution to the neuromorphic paper?", "What did you do on the oxDNA paper?", "Tell me about your PhD research"],
    );
  }

  if (/\b(skills?|technologies|tools|stack)\b/.test(normalized)) {
    return combinedResponse(
      "My current core toolkit includes C++, MATLAB and Simulink for real-time computer vision and infrared systems; Python, JavaScript and SQL for data applications; and scientific-computing methods developed through physics and molecular-simulation research.",
      ["work-leonardo", "work-eoc", "work-deloitte", "research-phd"],
      ["What do you do at Leonardo?", "How do you use Python?", "Tell me about your research background"],
    );
  }

  if (/\b(work history|career|professional experience|current work|current roles?)\b/.test(normalized)) {
    return combinedResponse(
      "I currently work in R&D system engineering at Leonardo and part-time as a Data Assistant with the EOC/IOSI Prostate Cancer Group. Previously I worked as a Data Scientist at Deloitte Consulting. You can open each role for its verified scope and tools.",
      ["work-leonardo", "work-eoc", "work-deloitte"],
      ["What do you do at Leonardo?", "What do you do at EOC?", "What did you work on at Deloitte?"],
    );
  }

  if (/\b(cv|resume|curriculum)\b/.test(normalized)) {
    return combinedResponse(
      "The current July 2026 CV is available from the Resume link. It covers the current Leonardo and EOC roles, previous Deloitte experience, physics education, publications and additional activities.",
      ["about"],
      ["What is your current role?", "Tell me about your education", "What are your publications?"],
    );
  }

  const ranked = portfolioContent.entries
    .map((entry) => ({ entry, score: scoreEntry(question, tokens, entry) }))
    .sort((left, right) => right.score - left.score);
  const top = ranked[0];
  const isContinuation = /\b(that|this|those|it|they|them|their|also|more|complement|related)\b/.test(normalized);

  if (!top || top.score < 3) {
    if (isContinuation && previousEntryIds.length > 0) {
      const priorEntry = portfolioContent.entries.find((entry) => entry.id === previousEntryIds[0]);
      if (priorEntry) {
        return {
          answer: priorEntry.curatedAnswer,
          entryIds: previousEntryIds.slice(0, 2),
          context: buildGroundedContext(previousEntryIds.slice(0, 2)),
          intent: "portfolio",
          confidence: "medium",
          suggestions: standardSuggestions,
        };
      }
    }
    return {
      answer:
        "I could not match that question to a verified portfolio topic. Try asking about Leonardo, EOC, Deloitte, physics, the PhD research period, publications, this project or interests.",
      entryIds: [],
      context: [],
      intent: "unknown",
      confidence: "low",
      suggestions: standardSuggestions,
    };
  }

  const relatedIds = ranked
    .filter((candidate) => candidate.score >= Math.max(3, top.score - 2))
    .slice(0, 2)
    .map(({ entry }) => entry.id);
  const entryIds = isContinuation ? [...new Set([...relatedIds, ...previousEntryIds])].slice(0, 3) : relatedIds;
  return {
    answer: top.entry.curatedAnswer,
    entryIds,
    context: buildGroundedContext(entryIds),
    intent: "portfolio",
    confidence: top.score >= 7 ? "high" : "medium",
    suggestions: standardSuggestions.filter((suggestion) => !normalizeText(suggestion).includes(normalizeText(top.entry.title))),
  };
}
