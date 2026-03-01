# Kevin Ryan & Associates — Brand Guidelines

**Version 2.0 — February 2026**
**kevinryan.io**

---

## Contents

1. Primary Logo
2. Logo Variants
3. KR Monogram
4. Colour Palette
5. Typography
6. Spacing & Grid
7. Usage Rules

---

## 01 — Primary Logo

The primary logo uses **Work Sans Black** for KEVIN and RYAN, stacked to equal visual width using letter-spacing on RYAN. The lighter "& associates" underlines the full width. Work Sans is the only typeface used in the logo — it is distinct from the site body (Archivo) and display (Bebas Neue) fonts.

**Clear Space:** Maintain clear space around the logo equal to the cap height of the letter K. No other graphic elements, text, or edge boundaries should intrude into this zone.

**Minimum Size:** The primary logo should not be reproduced smaller than 120px wide for digital or 30mm wide for print. Below this size, use the KR monogram instead.

### Assets

| Variant | SVG | PNG sizes |
|---|---|---|
| Dark text on light bg | `kevin-ryan-logo-outlined.svg` | 256, 512, 800, 1200px |
| White text on dark bg | `kevin-ryan-logo-whitetext.svg` | 256, 512, 800, 1200px |
| Dark background | `kevin-ryan-logo-dark-bg.svg` | 512, 800, 1200px |
| Live text (editable) | `kevin-ryan-logo-live-text.svg` | — |

---

## 02 — Logo Variants

The logo is available in four configurations. Use the appropriate variant based on the background context. The lime green of RYAN never changes across any variant.

**Colour Rules:** KEVIN is always black (#0A0A0A) on light backgrounds, white on dark. RYAN is always lime #A8E10C regardless of background. "& associates" follows KEVIN. The lime must never be altered, lightened, darkened, or replaced.

**File Formats:** SVG (outlined paths) is the master format. PNG rasters are provided at 256, 512, 800, and 1200px. ICO files at 16/32/48px are provided for browser favicons. All files hosted at kevinryan.io/brand/.

---

## 03 — KR Monogram

The KR monogram is the compact form of the identity. Use it for app icons, social media avatars, favicons, and anywhere the full logo would be illegible at small sizes. Same colour rules apply.

**Sizing:** Legible from 16px (favicon) to 512px. Provided: 16/32/48px (favicon), 64/128/192/256/512px (app icons), 400/800px (social media).

### Application

| Context | File |
|---|---|
| Browser favicon | `favicon-dark.ico` or `favicon-light.ico` (16/32/48px) |
| Social media avatar | `kr-social-dark-400.png` or `800.png` |
| Mobile app icon | `kr-icon-dark-192.png` (Android) or `512.png` (App Store) |
| Slack / Teams | `kr-icon-dark-128.png` |
| Watermark / overlay | `kr-icon-transparent-256.png` or `512.png` |

---

## 04 — Colour Palette

The palette is taken directly from the kevinryan.io CSS custom properties. It uses warm neutrals and a single lime accent. The warm off-white (#F5F3EF) gives the site its distinctive warmth.

### Primary

| Name | Hex | RGB | CSS Variable |
|---|---|---|---|
| Lime | `#A8E10C` | 168, 225, 12 | `--accent` |
| Lime Dim | `#92C40A` | 146, 196, 10 | `--accent-dim` |
| Black | `#0A0A0A` | 10, 10, 10 | `--black` |
| White | `#F5F3EF` | 245, 243, 239 | `--white` |

### Neutrals

| Name | Hex | RGB | CSS Variable |
|---|---|---|---|
| Dark | `#111111` | 17, 17, 17 | `--dark` |
| Dark Mid | `#1A1A1A` | 26, 26, 26 | `--dark-mid` |
| Grey 800 | `#2E2D2B` | 46, 45, 43 | `--grey-800` |
| Grey 600 | `#55524E` | 85, 82, 78 | `--grey-600` |
| Grey 400 | `#7A7772` | 122, 119, 114 | `--grey-400` |
| Grey 200 | `#D4D1CB` | 212, 209, 203 | `--grey-200` |
| Grey 100 | `#ECEAE5` | 236, 234, 229 | `--grey-100` |
| Pure White | `#FFFFFF` | 255, 255, 255 | — |

### Usage

- **Lime #A8E10C** — RYAN in logo, accent, links, interactive elements, section numbers, selection highlight.
- **Black #0A0A0A** — KEVIN in logo, headings, primary text, nav bar border, ticker background.
- **White #F5F3EF** — Page background (warm). The site does not use pure white as a background.
- **Grey-600 #55524E** — Body text, paragraph content, secondary information.
- **Grey-400 #7A7772** — Captions, metadata, subtitle labels, footer text.
- **Grey-200 #D4D1CB** — Borders, dividers, card separators.
- **Grey-100 #ECEAE5** — Alternating section backgrounds, image placeholder fills.

---

## 05 — Typography

The site uses three typefaces with distinct roles. Archivo for body text, Bebas Neue for display headings, and Work Sans exclusively for the logo mark. This separation gives the logo its own identity while the editorial feel comes from Archivo and Bebas Neue.

### Display — Bebas Neue

CSS variable: `--font-display`

Section headings, numbers (01–09), capability titles, case study names. Always uppercase, letter-spacing 0.02em, line-height 0.88–0.92.

### Body — Archivo

CSS variable: `--font-sans`

Body text, navigation, labels, buttons, metadata. Weights 400–900. Line-height 1.6. Labels use weight 700, letter-spacing 0.14–0.18em, uppercase.

### Logo — Work Sans

Logo mark only — not used in site content. Black (900) for KEVIN/RYAN. Light (300) for "& associates".

### Type Scale

| Role | Font | Size | Usage |
|---|---|---|---|
| Display XL | Bebas Neue | clamp(4.5rem, 13vw, 12rem) | Hero heading, section titles |
| Display LG | Bebas Neue | clamp(2.5rem, 7vw, 6rem) | Section headings |
| Section No. | Bebas Neue | clamp(3.5rem, 5.5vw, 5.5rem) | Section numbers (01–09) |
| Body | Archivo 400 | 1.05rem / line-height 1.7 | Paragraph text |
| Label | Archivo 700 | 0.7rem / ls 0.18em | Subtitles, tags, uppercase |
| Button | Archivo 800 | 0.72rem / ls 0.14em | CTAs, nav links, uppercase |
| Caption | Archivo 700 | 0.68rem / ls 0.12em | Stats labels, metadata |

### Google Fonts

- **Archivo:** fonts.google.com/specimen/Archivo — weights 400, 500, 600, 700, 800, 900
- **Bebas Neue:** fonts.google.com/specimen/Bebas+Neue — single weight
- **Work Sans:** fonts.google.com/specimen/Work+Sans — weights 300, 900 (logo only)

---

## 06 — Spacing & Grid

The layout uses an 8px base grid with a maximum content width of 1400px and fluid padding via clamp(1.5rem, 5vw, 6rem). Section padding is 7rem (112px) vertically.

### Spacing Scale

| Size | Token | Usage |
|---|---|---|
| 4px | xs | Tight inner padding, icon gaps |
| 8px | sm | Compact elements, inline spacing |
| 16px | md | Default component padding |
| 24px | lg | Section inner padding |
| 32px | xl | Card spacing, group separation |
| 48px | 2xl | Major section breaks |
| 64px | 3xl | Page section separation |
| 112px | 4xl | Section vertical padding (7rem) |

### Layout Principles

- Maximum content width: 1400px, centred with auto margins.
- Container padding: clamp(1.5rem, 5vw, 6rem) — responsive fluid padding.
- Section pattern: alternate white (#F5F3EF), grey (#ECEAE5), dark (#111111), black (#0A0A0A).
- Hover pattern: accent lime fills on capability cards, client grid, case study backgrounds darken.
- Borders: 2px solid black for nav and ticker; 1px solid grey-200 for card grids.
- Grid: 12-column desktop via CSS Grid, single column mobile. Gap varies by context.
- Section headers: number (Bebas Neue, lime) + subtitle (Archivo 700, uppercase) + heading (Bebas Neue).

---

## 07 — Usage Rules

### Do

- Use outlined SVG files as the primary logo source — they render identically everywhere.
- Maintain the minimum clear space (one cap-height K) around the logo at all times.
- Use the KR monogram at sizes below 120px / 30mm where the full logo becomes illegible.
- Keep the lime at exactly #A8E10C — no variations, no gradients, no opacity changes.
- Use Bebas Neue for display headings, Archivo for body text, Work Sans for logo only.
- Maintain the warm palette — use #F5F3EF not pure white for page backgrounds.

### Don't

- Alter the proportions, letter-spacing, or stacking order of the logo.
- Change the lime to any other colour, including lighter or darker shades.
- Place the logo on busy photographic backgrounds without a solid backing panel.
- Use drop shadows, gradients, outlines, or any effects on the logo.
- Recreate the logo in a different typeface — always use the supplied SVG assets.
- Substitute Archivo or Bebas Neue with other typefaces, or use cool-toned greys.

---

**Kevin Ryan & Associates** — kevinryan.io
Version 2.0 — February 2026
