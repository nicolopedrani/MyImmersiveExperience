# Architecture

Last reviewed: 18 July 2026.

## Data flow

```text
portfolio.ts
   ├── detail panel and contextual station navigator
   ├── room hotspots and deep links
   ├── guided route
   └── retrieval → GroundedContext[] → Qwen Web Worker → factual guard
                          └──────────────→ curated fallback
```

`PortfolioContent` owns display text, skills, chat aliases, links and evidence. Rooms store geometry and entry IDs only,
so Canvas, HTML navigation and chat cannot develop separate biographies.

## World

The world uses a 20 × 13 grid rendered at 32 pixels per tile. `RoomDefinition` declares doors, terrain, typed hotspots
and `RoomProp` objects. A prop's footprint is both its rendered footprint and collision geometry. Pure functions handle
bounds, transitions and interaction lookup.

Static terrain, props, doors and labels are prerendered to in-memory canvases. Each visible frame draws only that layer,
the selection outline and the original avatar. Device pixel ratio is capped at 2.

- Atrium Studio: profile, project and local conversation.
- Professional Systems Lab: Leonardo sensors, EOC/IOSI clinical data and Deloitte analytics.
- Research Library Lab: education, PhD context and two publications.
- Common Ground: football coaching, volunteering, reading and travelling.

## Navigation and accessibility

Content hashes such as `#work/eoc` synchronise room, avatar, hotspot, station button and detail card. Room hashes position
the avatar without opening a card. Browser history works without server-side routing on GitHub Pages.

Canvas is an enhancement. Room buttons plus the contextual “Stations in this room” navigation expose every entry and
chat action with ordinary HTML controls. The skip link targets that navigator. Keyboard handling suppresses defaults
only for recognised controls; touch uses Pointer Events.

## Boundaries

- No backend, analytics or remote inference API.
- No runtime dependency on private reference files.
- No user-agent browser classification.
- No model request, worker creation or cache write before explicit consent.
