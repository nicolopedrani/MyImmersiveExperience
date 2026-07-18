import type { EvidenceRef, PortfolioContent, ProfileEntry } from "./types";

const reviewedAt = "2026-07-18";
const resumeUrl = `${import.meta.env.BASE_URL}CV_Pedrani.pdf`;

const cvEvidence: EvidenceRef = {
  id: "cv-2026",
  label: "Nicolò Pedrani — CV, July 2026",
  kind: "cv",
  verifiedAt: reviewedAt,
  publicUrl: resumeUrl,
};

const profileEvidence: EvidenceRef = {
  id: "reviewed-profile-2026",
  label: "Reviewed professional profile, July 2026",
  kind: "reviewed-profile",
  verifiedAt: reviewedAt,
};

const entries = [
  {
    id: "about",
    category: "introduction",
    eyebrow: "Welcome",
    title: "R&D engineering, applied machine learning and computational physics",
    summary:
      "I work on real-time computer vision and infrared sensor systems, with a background spanning applied machine learning, data platforms and research software.",
    details: [
      "This portfolio is a compact, explorable account of my verified professional experience, research and interests.",
      "Every factual card is derived from the reviewed July 2026 profile, current CV, authored papers or an official public product page.",
    ],
    skills: ["Computer vision", "Machine learning", "Scientific computing", "System engineering"],
    chatAliases: ["about", "who are you", "profile", "overview", "background", "introduce yourself"],
    curatedAnswer:
      "I am an R&D engineer focused on real-time computer vision, performance optimisation and infrared sensor systems. My background also includes applied machine learning, data platforms and computational physics.",
    evidence: [profileEvidence, cvEvidence],
    links: [{ label: "Download current CV", href: resumeUrl, kind: "download" }],
  },
  {
    id: "work-leonardo",
    category: "work",
    eyebrow: "Current role",
    title: "R&D System Engineer",
    organization: "Leonardo S.p.A.",
    period: "December 2023 — present · Milan, Italy",
    summary:
      "I develop and optimise real-time computer vision algorithms and contribute to infrared sensor-system design and performance analysis.",
    details: [
      "Develop and optimise algorithms for threat detection and declaration.",
      "Analyse stakeholder needs and system requirements, and contribute to signal processing, system design and optimisation on target computing platforms.",
      "Support technical interfaces and trials while keeping non-public specifications and implementation details outside this portfolio.",
      "My MAIR-related work is described only at the level supported by Leonardo's public product information.",
    ],
    skills: ["C++", "MATLAB", "Simulink", "Computer vision", "Signal processing", "Infrared systems"],
    chatAliases: [
      "leonardo",
      "current job",
      "current role",
      "r&d",
      "computer vision",
      "infrared",
      "mair",
      "engineer",
      "engineering work",
      "system engineering",
    ],
    curatedAnswer:
      "At Leonardo I develop and optimise real-time computer-vision algorithms for threat detection and declaration. I also work on stakeholder and system requirements, infrared sensor-system design, signal processing, performance analysis and optimisation on target platforms. Non-public details are intentionally excluded.",
    evidence: [
      cvEvidence,
      profileEvidence,
      {
        id: "leonardo-mair",
        label: "Leonardo — MAIR public product page",
        kind: "official-product",
        verifiedAt: reviewedAt,
        publicUrl: "https://electronics.leonardo.com/en/products/mair",
      },
    ],
    links: [
      {
        label: "Leonardo MAIR product page",
        href: "https://electronics.leonardo.com/en/products/mair",
        kind: "external",
      },
    ],
  },
  {
    id: "work-eoc",
    category: "work",
    eyebrow: "Part-time role",
    title: "Data Assistant",
    organization: "EOC · IOSI Prostate Cancer Group",
    period: "May 2026 — present · Lugano, Switzerland",
    summary:
      "I clean and organise clinical databases and build interactive tools for data entry and visualisation of statistical analyses.",
    details: [
      "Clean, structure and maintain data used by the prostate-cancer group.",
      "Develop browser-based workflows that make data entry and statistical outputs easier to inspect.",
    ],
    skills: ["Python", "JavaScript", "SQL", "Vercel", "Data cleaning", "Data visualisation"],
    chatAliases: ["eoc", "iosi", "prostate cancer", "data assistant", "clinical data", "lugano"],
    curatedAnswer:
      "At EOC, within the IOSI Prostate Cancer Group, I work part-time on database cleaning and organisation and on interactive tools for data entry and visualisation of statistical analyses.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "work-deloitte",
    category: "work",
    eyebrow: "Consulting",
    title: "Data Scientist",
    organization: "Deloitte Consulting",
    period: "October 2022 — December 2023 · Milan, Italy",
    summary:
      "I delivered forecasting, clustering, customer-segmentation and recommendation solutions across energy, fashion and retail.",
    details: [
      "Worked across the delivery lifecycle, from requirements to deployment and maintenance.",
      "Built Power BI dashboards, including LLM-enabled features.",
      "Worked with Azure Machine Learning and ETL workflows using Azure Data Factory and Salesforce.",
    ],
    skills: ["Python", "SQL", "Power BI", "Azure ML", "Azure Data Factory", "Forecasting", "Classification"],
    chatAliases: ["deloitte", "consulting", "forecasting", "clustering", "power bi", "azure", "retail", "fashion", "energy"],
    curatedAnswer:
      "At Deloitte I worked on forecasting, clustering, customer segmentation and recommendation solutions for energy, fashion and retail. I also built Power BI dashboards, including LLM-enabled features, and worked with Azure Machine Learning and Azure Data Factory ETL workflows.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "education",
    category: "education",
    eyebrow: "Education",
    title: "Physics, from fundamentals to computation",
    organization: "University of Milan",
    period: "B.Sc. 2015–2018 · M.Sc. 2019–2021",
    summary:
      "I earned both my B.Sc. and M.Sc. in Physics with 110/110 cum laude.",
    details: [
      "The physics curriculum developed the mathematical, modelling and computational foundation behind my later research and engineering work.",
      "Additional training includes the MathWorks Computer Vision Engineer pathway and IBM AI Engineering coursework.",
    ],
    skills: ["Physics", "Mathematical modelling", "Scientific computing", "Computer vision", "AI engineering"],
    chatAliases: ["education", "degree", "university", "physics", "masters", "bachelor", "courses"],
    curatedAnswer:
      "I hold a B.Sc. and an M.Sc. in Physics from the University of Milan, both awarded with 110/110 cum laude. I also completed focused training in computer vision and AI engineering.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "research-phd",
    category: "research",
    eyebrow: "Research period",
    title: "Atomistic simulations and slow modes",
    organization: "Italian Institute of Technology",
    period: "2021 — 2022 · former PhD candidate",
    summary:
      "I worked in Michele Parrinello's Atomistic Simulations group on molecular dynamics, enhanced sampling and scientific machine learning.",
    details: [
      "Research interests included transfer operators, slow modes, stochastic simulation and enhanced sampling.",
      "The Deep-TICA work by Bonati, Piccini and Parrinello is methodological context for the group. It is not one of my publications.",
    ],
    skills: ["Molecular dynamics", "Enhanced sampling", "Transfer operators", "Scientific ML", "Stochastic simulation"],
    chatAliases: ["phd", "iit", "parrinello", "research", "deep tica", "deep-tica", "slow modes", "molecular dynamics"],
    curatedAnswer:
      "During my PhD research period at IIT I worked in Michele Parrinello's Atomistic Simulations group, with interests in molecular dynamics, enhanced sampling, transfer operators and slow modes. Deep-TICA is a methodological reference from the group context, not a publication I authored.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "publication-neuromorphic",
    category: "publication",
    eyebrow: "Scientific Reports · 2022",
    title: "Dynamical stochastic simulation of complex electrical behaviour in neuromorphic networks of metallic nanojunctions",
    summary:
      "A stochastic resistor-network model for the complex electrical behaviour of nanostructured metallic neuromorphic systems.",
    details: [
      "My documented contribution covers co-conception of the algorithm; development, implementation and testing; simulations, data processing and analysis.",
      "The work connects computational modelling with experimentally observed behaviour in nanostructured gold networks.",
    ],
    skills: ["Stochastic modelling", "Simulation", "Scientific software", "Data analysis"],
    chatAliases: ["neuromorphic", "network paper", "metallic nanojunctions", "scientific reports", "publication"],
    curatedAnswer:
      "I co-authored a Scientific Reports paper on stochastic simulation of neuromorphic networks of metallic nanojunctions. My documented contribution included co-conceiving the algorithm, developing, implementing and testing it, and carrying out simulations, data processing and analysis.",
    evidence: [
      {
        id: "paper-neuromorphic",
        label: "Scientific Reports 12, 12234 (2022)",
        kind: "publication",
        verifiedAt: reviewedAt,
        publicUrl: "https://doi.org/10.1038/s41598-022-15996-9",
      },
      profileEvidence,
    ],
    links: [
      {
        label: "Read the paper",
        href: "https://doi.org/10.1038/s41598-022-15996-9",
        kind: "external",
      },
    ],
  },
  {
    id: "publication-oxdna",
    category: "publication",
    eyebrow: "Entropy · 2022",
    title: "OxDNA to Study Species Interactions",
    summary:
      "Coarse-grained molecular simulations of competitive and cooperative interactions between single-stranded DNA species.",
    details: [
      "My documented contribution includes software development, methodology and investigation.",
      "The study uses oxDNA simulations to examine how interacting DNA species compete for or cooperate around shared resources.",
    ],
    skills: ["oxDNA", "Molecular simulation", "Research software", "Methodology"],
    chatAliases: ["oxdna", "dna paper", "entropy", "species interactions", "publication"],
    curatedAnswer:
      "I co-authored an Entropy paper using oxDNA to study competitive and cooperative interactions between single-stranded DNA species. My documented contribution covered software, methodology and investigation.",
    evidence: [
      {
        id: "paper-oxdna",
        label: "Entropy 24(4), 458 (2022)",
        kind: "publication",
        verifiedAt: reviewedAt,
        publicUrl: "https://doi.org/10.3390/e24040458",
      },
      profileEvidence,
    ],
    links: [
      {
        label: "Read the paper",
        href: "https://doi.org/10.3390/e24040458",
        kind: "external",
      },
    ],
  },
  {
    id: "personal-football",
    category: "personal",
    eyebrow: "Beyond engineering",
    title: "Football coaching",
    summary:
      "Coaching strengthens the communication, preparation and teamwork I bring to technical work.",
    details: [
      "The relevant experience is football coaching; this portfolio does not present a professional playing career.",
      "Explaining decisions clearly and helping a group improve are skills I value in both sport and engineering.",
    ],
    skills: ["Coaching", "Communication", "Teamwork"],
    chatAliases: ["football", "soccer", "coach", "coaching", "sport"],
    curatedAnswer:
      "Outside engineering I have experience in football coaching. I value it as a practical way to develop communication, preparation and teamwork.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "personal-volunteering",
    category: "personal",
    eyebrow: "Beyond engineering",
    title: "Volunteering",
    summary:
      "Volunteering has included teaching and companion activities, reinforcing patience, responsibility and empathy.",
    details: [
      "Only the high-level activities confirmed in the current CV are included here.",
      "The experience complements the technical profile with a focus on service and human connection.",
    ],
    skills: ["Teaching", "Responsibility", "Empathy"],
    chatAliases: ["volunteer", "volunteering", "teaching", "community"],
    curatedAnswer:
      "My volunteering experience includes teaching and companion activities. It is an important part of how I practise patience, responsibility and empathy outside technical work.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "personal-curiosity",
    category: "personal",
    eyebrow: "Beyond engineering",
    title: "Reading and travelling",
    summary:
      "Reading and travelling are two of the ways I keep curiosity active beyond work.",
    details: [
      "The portfolio deliberately avoids invented stories or claims about individual destinations and books.",
      "These interests are presented as personal context rather than professional achievements.",
    ],
    skills: ["Curiosity", "Continuous learning", "Perspective"],
    chatAliases: ["reading", "books", "travel", "travelling", "hobbies", "interests"],
    curatedAnswer:
      "Reading and travelling are important personal interests. They help me maintain curiosity and encounter perspectives outside my day-to-day technical work.",
    evidence: [cvEvidence, profileEvidence],
    links: [],
  },
  {
    id: "project-immersive",
    category: "project",
    eyebrow: "Selected project",
    title: "MyImmersiveExperience",
    summary:
      "An explorable, room-based portfolio built with TypeScript and HTML5 Canvas and deployed as a static GitHub Pages application.",
    details: [
      "The project combines original pixel-art dioramas, accessible HTML navigation and a browser-side conversational layer.",
      "On compatible devices, Qwen3 0.6B generates answers locally from reviewed portfolio context; curated answers remain as the resilient fallback.",
    ],
    skills: ["TypeScript", "HTML5 Canvas", "Accessibility", "Web Workers", "Client-side ML"],
    chatAliases: ["this project", "portfolio project", "immersive experience", "typescript", "canvas", "github pages"],
    curatedAnswer:
      "MyImmersiveExperience is this room-based portfolio. It uses TypeScript and HTML5 Canvas, exposes each room through accessible HTML controls, and can run a grounded Qwen3 0.6B conversation locally in compatible browsers.",
    evidence: [profileEvidence],
    links: [
      {
        label: "View source on GitHub",
        href: "https://github.com/nicolopedrani/MyImmersiveExperience",
        kind: "external",
      },
    ],
  },
] as const satisfies readonly ProfileEntry[];

export const portfolioContent = {
  profile: {
    name: "Nicolò Pedrani",
    role: "R&D System Engineer",
    positioning:
      "Real-time computer vision, infrared sensor systems, applied machine learning and computational physics.",
    location: "Milan, Italy · Lugano, Switzerland",
    lastReviewed: reviewedAt,
    siteUrl: "https://nicolopedrani.github.io/",
    resumeUrl,
  },
  entries,
} satisfies PortfolioContent;

export type PortfolioEntryId = (typeof entries)[number]["id"];

export function getPortfolioEntry(id: string): ProfileEntry | undefined {
  return portfolioContent.entries.find((entry) => entry.id === id);
}
