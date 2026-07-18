export type EntryCategory =
  | "introduction"
  | "work"
  | "research"
  | "education"
  | "publication"
  | "personal"
  | "project";

export type EvidenceKind =
  | "cv"
  | "reviewed-profile"
  | "publication"
  | "official-product";

export interface EvidenceRef {
  id: string;
  label: string;
  kind: EvidenceKind;
  verifiedAt: string;
  publicUrl?: string;
}

export interface EntryLink {
  label: string;
  href: string;
  kind: "internal" | "external" | "download";
}

export interface ProfileEntry {
  id: string;
  category: EntryCategory;
  eyebrow: string;
  title: string;
  organization?: string;
  period?: string;
  summary: string;
  details: readonly string[];
  skills: readonly string[];
  chatAliases: readonly string[];
  curatedAnswer: string;
  evidence: readonly EvidenceRef[];
  links: readonly EntryLink[];
}

export interface PortfolioContent {
  profile: {
    name: string;
    role: string;
    positioning: string;
    location: string;
    lastReviewed: string;
    siteUrl: string;
    resumeUrl: string;
  };
  entries: readonly ProfileEntry[];
}
