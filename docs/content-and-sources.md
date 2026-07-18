# Content and source policy

Last reviewed: 18 July 2026.

## Canonical public content

`src/content/portfolio.ts` is the only runtime source of professional and personal facts. Changes must update that file
and its tests in the same commit. Each entry includes at least one `EvidenceRef` and a verification date.

Accepted evidence classes are:

- Current public CV.
- Reviewed professional profile.
- Authored publication and its documented author-contribution statement.
- Official public product page.

The content is intentionally written in English for recruiters, hiring managers and technical peers.

## Publication rules

Nicolò Pedrani's authored publications are:

1. *Dynamical stochastic simulation of complex electrical behaviour in neuromorphic networks of metallic
   nanojunctions*, Scientific Reports 12, 12234 (2022), <https://doi.org/10.1038/s41598-022-15996-9>.
2. *OxDNA to Study Species Interactions*, Entropy 24(4), 458 (2022),
   <https://doi.org/10.3390/e24040458>.

Deep-TICA by Bonati, Piccini and Parrinello is methodological context for the former PhD group. It must never be listed
as a publication authored by Nicolò.

## Leonardo boundary

Leonardo content may describe verified responsibilities from the public CV and the high-level public MAIR scope at
<https://electronics.leonardo.com/en/products/mair>. Non-public specifications, measured performance, implementation
details and material reproduced from the local brochure are excluded.

## Private references

The ignored `references/` directory is an editorial workspace. Application imports, tests and build scripts must not
read it. The production build may contain only the deliberately published current CV; papers and product information
are linked at their canonical public locations.

Before release, `rg -n "references/" dist src` and the content tests provide a guard against accidental publication.
