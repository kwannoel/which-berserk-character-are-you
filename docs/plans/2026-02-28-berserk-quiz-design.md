# Which Berserk Character Are You? — Design Doc

## Overview

A personality quiz that matches users to one of 21 Berserk characters based on trait-based scoring. Delivered as a single static HTML file with no build tools or external dependencies (aside from one Google Fonts link).

## Format

- Single `index.html` file
- No frameworks, no build step — open in browser and play
- Dark manga aesthetic: black/charcoal backgrounds, off-white text, deep red (#8B0000) accents, rough textures

## Characters (21)

| Group | Characters |
|-------|-----------|
| Core | Guts, Griffith, Casca, Skull Knight, Schierke, Zodd |
| Companions | Serpico, Farnese, Rickert, Puck, Isidro, Judeau |
| Band of the Hawk | Corkus |
| Apostles | Locus, Grunbeld, Irvine, Ganishka |
| God Hand | Void, Slan |
| Outcasts | Egg of the Perfect World, Sonia |

## Personality Traits (6 Axes)

| Trait | Low End | High End |
|-------|---------|----------|
| Ambition | Content / accepting | Driven / power-seeking |
| Bonds | Lone wolf / detached | Deeply loyal / connected |
| Darkness | Light-hearted / hopeful | Grim / morally gray |
| Resilience | Fragile / yielding | Unbreakable / enduring |
| Intellect | Instinctive / emotional | Strategic / calculating |
| Wrath | Peaceful / composed | Explosive / vengeful |

Each character has a trait profile (scores 1-10 per trait), an iconic quote, a short personality description (2-3 sentences), a "why you match" comparison blurb, and a **stylized SVG portrait** embedded as base64 inline in the HTML.

## Character Images

- Each of the 21 characters gets a stylized SVG illustration (portrait/bust style)
- Embedded directly in the HTML as inline SVGs — no external image requests
- Art style: high-contrast, manga-inspired linework that matches the dark aesthetic
- Used on: results page (large), share card (medium), and runner-up section (small)

## Quiz Structure

- **12 questions**, each with **4 answer choices**
- Each answer adds points to 2-3 traits simultaneously
- Questions are thematic to Berserk's world but don't require manga knowledge (moral dilemmas, value questions, hypothetical scenarios)
- Mix of question types to cover all 6 trait axes thoroughly

### Example Question

> *A companion falls behind on a dangerous path. The group is at risk if you stop.*
> - A) Go back alone to get them — no one gets left behind *(+Bonds, +Wrath)*
> - B) The group's survival comes first — hard truth *(+Intellect, +Ambition)*
> - C) Find a way to help without stopping the group *(+Intellect, +Bonds)*
> - D) They knew the risks. Keep moving. *(+Darkness, +Resilience)*

## Quiz Flow

1. **Landing page** — Title, dark manga-style hero section, "Begin the Struggle" button
2. **Questions** — One at a time, smooth transitions, progress bar at top
3. **Calculating...** — Brief dramatic animation (1-2 seconds)
4. **Results page** — Full character profile

## Results Page

Top to bottom:

1. **Character reveal** — Large character name, iconic quote
2. **Personality description** — 2-3 sentences summarizing the match
3. **"Why you match"** — 1-2 sentences connecting user traits to the character
4. **Trait breakdown** — Radar chart (hexagonal, 6 axes) showing user scores vs character scores
5. **Runner-up** — "You were also close to: [character]" with a one-liner
6. **Share section** — "Copy Link" button + "Download Result Card" button
7. **Retake** — "Try Again" button

## Sharing

### URL Hash

`index.html#r=guts` — skips the quiz and shows the result page directly.

### Downloadable Image Card

Canvas-generated PNG (~1200x630):
- Dark textured background
- Character name + iconic quote
- Mini radar chart
- "Which Berserk Character Are You?" branding

## Technical Architecture

Single `index.html` containing embedded `<style>` and `<script>` blocks.

### Data Structures

- `characters[]` — 21 character objects with trait profiles, quotes, descriptions
- `questions[]` — 12 question objects with answer-to-trait mappings

### Core Functions

- `calculateResult()` — Sum trait scores from answers, compute Euclidean distance to each character's trait profile, return best match + runner-up
- `renderResult()` — Build results page + radar chart using Canvas API
- `generateCard()` — Canvas-to-PNG for downloadable share image
- `hashRouting()` — On load, check for `#r=character` and skip to result

### Matching Algorithm

Euclidean distance between the user's normalized trait vector and each character's trait profile. Lowest distance = best match.

### External Resources

- One Google Fonts `<link>` tag for a serif display font — the only external dependency
- Radar chart drawn with native Canvas API
- Share image generated with native Canvas API
