import { describe, expect, it } from "vitest";
import { getPortfolioEntry, portfolioContent } from "./portfolio";

const requiredEntries = [
  "about",
  "work-leonardo",
  "work-eoc",
  "work-deloitte",
  "education",
  "research-phd",
  "publication-neuromorphic",
  "publication-oxdna",
  "personal-football",
  "personal-volunteering",
  "personal-curiosity",
  "project-immersive",
];

describe("verified portfolio content", () => {
  it("contains every required topic exactly once", () => {
    const ids = portfolioContent.entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(requiredEntries));
  });

  it("attaches reviewed evidence to every entry", () => {
    for (const entry of portfolioContent.entries) {
      expect(entry.evidence.length, entry.id).toBeGreaterThan(0);
      for (const evidence of entry.evidence) {
        expect(evidence.verifiedAt).toBe("2026-07-18");
        expect(evidence.publicUrl ?? "").not.toContain("references/");
      }
    }
  });

  it("describes Deep-TICA only as non-authored methodological context", () => {
    const phd = getPortfolioEntry("research-phd");
    expect(phd?.details.join(" ")).toContain("not one of my publications");
    const publicationText = portfolioContent.entries
      .filter((entry) => entry.category === "publication")
      .map((entry) => JSON.stringify(entry))
      .join(" ");
    expect(publicationText).not.toContain("Deep-TICA");
  });

  it("does not reintroduce removed or unverified claims", () => {
    const publicText = JSON.stringify(portfolioContent);
    const bannedClaims = [
      "professional player",
      "AC Como",
      "$2.1M",
      "23% reduction",
      "Kalman",
      "optical flow",
      "LangChain",
      "atmospheric modelling",
      "FPA photodetectors",
    ];
    bannedClaims.forEach((claim) => expect(publicText).not.toContain(claim));
  });

  it("uses public DOI and product links rather than bundled reference PDFs", () => {
    expect(getPortfolioEntry("publication-neuromorphic")?.links[0]?.href).toBe(
      "https://doi.org/10.1038/s41598-022-15996-9",
    );
    expect(getPortfolioEntry("publication-oxdna")?.links[0]?.href).toBe("https://doi.org/10.3390/e24040458");
    expect(getPortfolioEntry("work-leonardo")?.links[0]?.href).toBe("https://electronics.leonardo.com/en/products/mair");
  });
});
