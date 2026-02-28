# Kevin Ryan & Associates — Brand Guidelines

**Visual Identity Guidelines**
Version 1.0 — February 2026
kevinryan.io

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

The primary logo consists of **KEVIN** in black and **RYAN** in green, stacked to equal visual width using letter-spacing on RYAN. The lighter "& associates" underlines the full width of the name block. This is the default mark for all applications.

All logo files use outlined vector paths (no font dependencies) to ensure identical rendering across every platform and device.

### Clear Space

Maintain clear space around the logo equal to the cap height of the letter **K**. No other graphic elements, text, or edge boundaries should intrude into this zone.

### Minimum Size

The primary logo should not be reproduced smaller than **120px wide** for digital or **30mm wide** for print. Below this size, use the KR monogram instead.

### Master Files

| File | Format | Use |
|------|--------|-----|
| `kevin-ryan-logo-outlined.svg` | SVG (outlined paths) | Master — all production use |
| `kevin-ryan-logo-dark.svg` | SVG (outlined paths) | Dark background variant |
| `kevin-ryan-logo-live-text.svg` | SVG (live text) | Editable variant (requires Google Fonts) |
| `logo-transparent-darktext.svg` | SVG (outlined paths) | Transparent background, dark text |
| `logo-transparent-whitetext.svg` | SVG (outlined paths) | Transparent background, white text |

PNG rasters are provided at 256, 512, 800, and 1200px for contexts that require bitmap images.

---

## 02 — Logo Variants

The logo is available in four configurations. Use the appropriate variant based on the background context. **The green of RYAN never changes across any variant.**

| Variant | KEVIN | RYAN | & associates | Background |
|---------|-------|------|-------------|------------|
| Standard | `#0A0A0A` (black) | `#A8E10C` (green) | `#0A0A0A` (black) | Light (`#FFFFFF` or `#F9FAFB`) |
| Reversed | `#FFFFFF` (white) | `#A8E10C` (green) | `#FFFFFF` (white) | Dark (`#0A0A0A` or `#111111`) |

### Colour Rules

- KEVIN is always black on light backgrounds, white on dark backgrounds.
- RYAN is always `#A8E10C` regardless of background.
- "& associates" follows the same colour as KEVIN.
- The green must never be altered, lightened, darkened, or replaced with another colour.

### File Formats

- **SVG** (outlined paths) is the master format for all logo files.
- **PNG** rasters are provided at 256, 512, 800, and 1200px for bitmap contexts.
- **ICO** files at 16/32/48px are provided for browser favicons.

---

## 03 — KR Monogram

The KR monogram is the compact form of the identity. Use it for app icons, social media avatars, favicons, and anywhere the full logo would be illegible at small sizes. The monogram follows the same colour rules as the primary logo.

### Sizing

The monogram is designed to be legible at all sizes from 16px (favicon) up to 512px (app stores).

Standard sizes provided: 16, 32, 48px (favicon), 64, 128, 192, 256, 512px (app icons), and 400, 800px (social media).

### Application Guide

| Context | File | Size |
|---------|------|------|
| Browser favicon | `favicon-dark.ico` or `favicon-light.ico` | 16/32/48px multi-resolution |
| Social media avatar | `kr-social-dark-400.png` or `800.png` | 400 or 800px |
| Mobile app icon | `kr-icon-dark-192.png` (Android) or `512.png` (App Store) | 192 or 512px |
| Slack / Teams | `kr-icon-dark-128.png` | 128px |
| Watermark / overlay | `kr-icon-transparent-256.png` or `512.png` | 256 or 512px |

---

## 04 — Colour Palette

The palette is derived from the kevinryan.io design system. It is minimal and high-contrast, rooted in Swiss International Style principles. Green is the single accent colour; everything else is a shade of black, gray, or white.

### Primary Colours

| Swatch | Name | Hex | RGB |
|--------|------|-----|-----|
| 🟩 | **Lime** | `#A8E10C` | 22, 163, 74 |
| ⬛ | **Primary Black** | `#0A0A0A` | 10, 10, 10 |
| ⬜ | **White** | `#FFFFFF` | 255, 255, 255 |

### Neutral Colours

| Swatch | Name | Hex | RGB |
|--------|------|-----|-----|
| ⬛ | Near Black | `#111111` | 17, 17, 17 |
| 🔲 | Dark Gray | `#374151` | 55, 65, 81 |
| 🔲 | Mid Gray | `#6B7280` | 107, 114, 128 |
| 🔲 | Light Gray | `#E5E7EB` | 229, 231, 235 |
| ⬜ | Off-White | `#F9FAFB` | 249, 250, 251 |

### Colour Usage

| Colour | Usage |
|--------|-------|
| **Lime** `#A8E10C` | RYAN in logo, accent colour, links, interactive elements, section numbers, highlights |
| **Primary Black** `#0A0A0A` | KEVIN in logo, headings, primary text on light backgrounds |
| **Dark Gray** `#374151` | Body text, secondary content, paragraph text |
| **Mid Gray** `#6B7280` | Captions, metadata, tertiary information, timestamps |
| **Light Gray** `#E5E7EB` | Borders, dividers, subtle separators |
| **Off-White** `#F9FAFB` | Alternating section backgrounds, cards, subtle surface differentiation |
| **White** `#FFFFFF` | Primary background, clean open space |

### CSS Custom Properties

```css
:root {
  --color-green: #A8E10C;
  --color-black: #0A0A0A;
  --color-white: #FFFFFF;
  --color-near-black: #111111;
  --color-dark-gray: #374151;
  --color-mid-gray: #6B7280;
  --color-light-gray: #E5E7EB;
  --color-off-white: #F9FAFB;
}
```

### Tailwind Mapping

These colours map to the Tailwind CSS palette used on kevinryan.io:

| Brand Token | Tailwind Class |
|-------------|---------------|
| Lime | `green-600` |
| Primary Black | `gray-950` / custom |
| Dark Gray | `gray-700` |
| Mid Gray | `gray-500` |
| Light Gray | `gray-200` |
| Off-White | `gray-50` |

---

## 05 — Typography

**Work Sans** is the sole typeface for the Kevin Ryan & Associates identity. It is a Google Font available at [fonts.google.com/specimen/Work+Sans](https://fonts.google.com/specimen/Work+Sans) and can be referenced from anywhere online.

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;700;900&display=swap');
```

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;700;900&display=swap" rel="stylesheet">
```

### Weights

| Weight | Name | Usage |
|--------|------|-------|
| **900** | Black | Logo (KEVIN, RYAN). Display headings. Hero text. |
| **700** | Bold | Section headings. Emphasis. Labels. UI controls. |
| **400** | Regular | Body text. Paragraph content. Navigation. |
| **300** | Light | Logo ("& associates"). Captions. Metadata. Section numbers. |

### Type Scale

| Role | Font | Size | Usage |
|------|------|------|-------|
| Display | Work Sans Black 900 | 48–64px | Cover titles, hero text |
| Heading 1 | Work Sans Black 900 | 28–36px | Section headings |
| Heading 2 | Work Sans Bold 700 | 20–24px | Sub-section headings |
| Heading 3 | Work Sans Bold 700 | 16–18px | Card titles, labels |
| Body | Work Sans Regular 400 | 14–16px | Paragraph text, navigation |
| Caption | Work Sans Light 300 | 11–13px | Metadata, timestamps, fine print |
| Micro | Work Sans Light 300 | 8–10px | Legal, footnotes, logo tagline |

### Line Height

- **Headings**: 1.2
- **Body text**: 1.6
- **Captions**: 1.4

---

## 06 — Spacing & Grid

The layout system uses an **8px base grid**. All spacing, padding, and margins should be multiples of 8. This produces consistent vertical rhythm and alignment across all touchpoints.

### Spacing Scale

| Value | Token | Usage |
|-------|-------|-------|
| 4px | `xs` | Tight inner padding, icon gaps |
| 8px | `sm` | Compact elements, inline spacing |
| 16px | `md` | Default component padding |
| 24px | `lg` | Section inner padding |
| 32px | `xl` | Card spacing, group separation |
| 48px | `2xl` | Major section breaks |
| 64px | `3xl` | Page section separation |
| 96px | `4xl` | Hero spacing, cover padding |

### Layout Principles

- Maximum content width: **1200px**. Centred with auto margins.
- Section pattern: alternate between white (`#FFFFFF`) and off-white (`#F9FAFB`) backgrounds.
- Dark sections (`#0A0A0A`) are used sparingly for emphasis — hero, footer, feature highlights.
- Grid: **12-column** on desktop, single column on mobile. Gutter: 24px.
- Section numbers (`01`, `02`, `03`…) in Work Sans Light, coloured green, positioned above section headings.
- Border radius: **6px** for cards and containers, **4px** for buttons and small elements.

### CSS Spacing Variables

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --max-width: 1200px;
}
```

---

## 07 — Usage Rules

These rules protect the integrity of the identity. When in doubt, refer to the master SVG files and this document.

### Do

- Use outlined SVG files as the primary logo source — they render identically everywhere.
- Maintain the minimum clear space (one cap-height K) around the logo at all times.
- Use the KR monogram at sizes below 120px / 30mm where the full logo becomes illegible.
- Use the dark background variant when placing the logo on dark surfaces.
- Reference Work Sans via Google Fonts for all web and digital applications.
- Keep the green at exactly `#A8E10C` — no variations, no gradients, no opacity changes.
- Use the alternating white / off-white section pattern for long-form page layouts.

### Don't

- Alter the proportions, letter-spacing, or stacking order of the logo.
- Change the green to any other colour, including lighter or darker shades.
- Place the logo on busy photographic backgrounds without a solid backing panel.
- Use drop shadows, gradients, outlines, or any effects on the logo.
- Recreate the logo in a different typeface — always use the supplied SVG assets.
- Use the full logo below minimum size — switch to the KR monogram instead.
- Mix Work Sans with other sans-serif typefaces in the same layout.

---

**Kevin Ryan & Associates**
kevinryan.io — Version 1.0 — February 2026
