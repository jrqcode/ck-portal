---
version: 1
name: Caiden-Keller-Portal
source: Adapted from the Airbnb design.md at https://getdesign.md/airbnb/design-md (structure, scales, and shape language) with Caiden-Keller Homes brand colour substituted for Rausch.
description: A calm, photography-led client portal for a single custom home builder. Clean white canvas, near-black ink, and one voltage of Caiden-Keller Red (#d92227) — taken from the company wordmark — carrying every primary CTA and active state. A secondary muted gold (#b6a071), drawn from the dividers and photo borders on caiden-kellerhomes.com, appears only in the homeowner area as a decorative rule. Type runs Inter at modest weights; display sits at 20–28px rather than heavy 700+ enterprise weights, because the product leans on build photography for visual heft. Two densities share one system: a compact, table-friendly admin area for builder staff, and a comfortable, photo-forward homeowner area with no dense tables anywhere.
---

# DESIGN.md — Caiden-Keller Homes Portal

**This file is binding.** Do not introduce a colour, font, radius, or spacing
value that is not defined here. If something genuinely needs a token that
doesn't exist, add it here first, with a reason, then use it.

## Colors

### Brand & Accent

| Token | Hex | Contrast on white | Use |
|---|---|---|---|
| `primary` | `#d92227` | 4.99:1 ✅ AA | The single brand colour. Primary CTA backgrounds, active nav, focus rings, brand marks. |
| `primary-hover` | `#c21e22` | 6.0:1 | Pointer-over on primary surfaces. |
| `primary-active` | `#a81a1e` | 7.2:1 | Press / pointer-down. |
| `primary-disabled` | `#f2c2c3` | — | Pale tint for disabled CTAs. Never carries text below 18px. |
| `primary-tint` | `#fdf2f2` | — | Faint wash for selected table rows and active sidebar items. |
| `accent-gold` | `#b6a071` | 2.54:1 ❌ | **Decorative only, homeowner area only.** Section rules, milestone rails, photo-card borders. Never text, never a fill behind text, never an interactive surface. |
| `accent-gold-soft` | `#c1b086` | — | Lighter rule weight on tinted surfaces. |

Caiden-Keller Red is the only saturated colour in the company wordmark and is
already the link and button colour on caiden-kellerhomes.com. It replaces
Airbnb's Rausch one-for-one and is used the same way: **scarcely**. Most screens
should be 90% white and ink with one or two red moments.

The gold mirrors how the marketing site uses it — as a rule and a border, never
as a fill or a label. It fails contrast badly, so the rule above is absolute.

### Status

Because the brand accent is red, status colour must not be. A red "primary"
button beside a red "delayed" badge is unreadable as meaning.

| Token | Hex | Contrast | Use |
|---|---|---|---|
| `status-progress` | `#b45309` | 5.02:1 ✅ | In progress, needs attention, awaiting a decision. |
| `status-progress-tint` | `#fef6ec` | — | Badge and banner background for the above. |
| `status-complete` | `#15803d` | 5.02:1 ✅ | Complete, approved, signed off. |
| `status-complete-tint` | `#f0faf3` | — | Badge background for the above. |
| `status-hold` | `#6a6a6a` | 5.7:1 | On hold, not started, draft. |
| `destructive` | `#a81a1e` | 7.2:1 | Irreversible admin actions only (delete a project or update). Never appears in the homeowner area. |

### Surface, Text, Hairlines

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#ffffff` | Default page floor. |
| `surface-soft` | `#f7f7f7` | Disabled fields, hover backgrounds, filter bands. |
| `surface-strong` | `#f2f2f2` | Circular icon-button surface, table header fill. |
| `ink` | `#222222` | Headlines and primary text. |
| `body` | `#3f3f3f` | Running text. |
| `muted` | `#6a6a6a` | Secondary text, meta lines, timestamps. |
| `muted-soft` | `#929292` | Placeholder text, disabled labels. |
| `hairline` | `#dddddd` | Default 1px dividers. |
| `hairline-soft` | `#ebebeb` | Dividers on tinted surfaces. |
| `border-strong` | `#c1c1c1` | Input outlines at rest. |
| `on-primary` | `#ffffff` | Text and icons on `primary`. |
| `scrim` | `#000000` at 50% | Modal backdrop. |

**There is no dark mode.** The source system is light-only, and a single light
theme is the right call for homeowners who sign in twice a month. Do not add a
theme switcher.

## Typography

### Font Family

**Inter** for everything — display, body, navigation, captions. The source
system uses Airbnb Cereal VF and names Inter as its closest open substitute;
per that note, display line-heights are pulled ~2% tighter than the source.

Stack: `Inter, -apple-system, system-ui, Roboto, 'Helvetica Neue', sans-serif`

There is no separate display family. Do not add one. (The marketing site's
Playfair Display is a marketing voice and does not belong in the portal.)

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-xl` | 28px | 700 | 1.40 | 0 | Homeowner "My Build" page title. |
| `display-lg` | 22px | 500 | 1.16 | -0.44px | Project name on a detail page. |
| `display-md` | 21px | 700 | 1.40 | 0 | Section heads ("Latest progress"). |
| `display-sm` | 20px | 600 | 1.18 | -0.18px | Sub-section titles. |
| `title-md` | 16px | 600 | 1.25 | 0 | Card titles, update headlines. |
| `title-sm` | 16px | 500 | 1.25 | 0 | Column heads, list group labels. |
| `body-md` | 16px | 400 | 1.5 | 0 | Running text. **Homeowner default.** |
| `body-sm` | 14px | 400 | 1.43 | 0 | Meta lines, dates, captions. **Admin default.** |
| `caption` | 14px | 500 | 1.29 | 0 | Field labels. |
| `caption-sm` | 13px | 400 | 1.23 | 0 | Legal and footnote text. |
| `badge` | 11px | 600 | 1.18 | 0 | Status badge text. |
| `micro-label` | 12px | 700 | 1.33 | 0 | Micro labels on cards. |
| `button-md` | 16px | 500 | 1.25 | 0 | Primary CTA labels. |
| `button-sm` | 14px | 500 | 1.29 | 0 | Compact / pill button labels. |
| `link` | 14px | 400 | 1.43 | 0 | Inline links. |
| `nav-link` | 16px | 600 | 1.25 | 0 | Top and sidebar nav labels. |

### Principles

Display weights stay modest. Photography carries hierarchy in the homeowner
area; a 28px/700 page title is deliberately quiet because a full-width progress
photo sits above it.

The source system's one loud typographic moment is a rating number. Ours is the
**current stage name** on the homeowner landing page — rendered at `display-xl`
against the hero photo. It is the one thing every homeowner opens the portal to
read, so it gets the loudest treatment in the system.

## Layout

### Spacing System

Base unit 4px, 2px micro-step. Carried over from the source unchanged.

`xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `base` 16 · `lg` 24 · `xl` 32 · `xxl` 48 · `section` 64

### Two Densities

This is the one structural addition to the source system. Both areas use the
same tokens; they differ only in which ones they reach for.

| | Admin `(admin)` | Homeowner `(portal)` |
|---|---|---|
| Default body type | `body-sm` (14px) | `body-md` (16px) |
| Section rhythm | `spacing.xl` (32px) | `spacing.section` (64px) |
| Card padding | `spacing.base` (16px) | `spacing.lg` (24px) |
| Max content width | 1280px | 1080px |
| Row height | 44px table rows | n/a — no tables |
| Primary layout | Data tables, left sidebar nav | Photo cards, top nav |
| Gold rule | Never | Section dividers, milestone rail |

**No dense tables in the homeowner area.** Documents and milestones render as
stacked cards or list items with generous touch targets, never as a data grid.
This is a hard rule, not a preference.

### Grid & Container

- Admin caps at 1280px; tables scroll horizontally inside their own container
  rather than the page scrolling.
- Homeowner caps at 1080px so photos and text stay readable.
- Photo grids reduce column count at each breakpoint and never reflow rows.

## Shape

Soft, per the source. There is essentially no hard corner except the page grid.

`none` 0 · `xs` 4px · `sm` 8px · `md` 14px · `lg` 20px · `xl` 32px · `full` 9999px

- Buttons: `sm` (8px)
- Cards, photos, photo thumbnails: `md` (14px)
- Badges, pills, avatars, icon buttons: `full`
- Inputs: `sm` (8px)

## Elevation

**One shadow tier, plus flat.** Do not invent intermediate tiers.

- Flat (no shadow): body, headers, tables, list rows — 95% of surfaces.
- Float: `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0`
  — hovered photo cards, dropdowns, popovers.
- Modal scrim: `scrim` at 50%.

Depth comes from photography, white-on-white surface separation, and rounded
corner clipping — not from layered shadows.

## Components

| Component | Background | Text | Radius | Size |
|---|---|---|---|---|
| `button-primary` | `primary` | `on-primary` | `sm` | 48px tall, 14px/24px padding |
| `button-primary-sm` | `primary` | `on-primary` | `sm` | 36px tall — admin only |
| `button-secondary` | `canvas` + 1px `border-strong` | `ink` | `sm` | 48px tall |
| `button-tertiary` | transparent | `ink` | `sm` | text only, underline on hover |
| `button-destructive` | `canvas` + 1px `destructive` | `destructive` | `sm` | admin only |
| `badge-status` | `*-tint` | matching `status-*` | `full` | 24px tall, `badge` type |
| `card` | `canvas` | `ink` | `md` | flat; float on hover only if clickable |
| `photo-card` | `canvas` | `ink` | `md` | photo clipped to radius, meta beneath |
| `input` | `canvas` + 1px `border-strong` | `ink` | `sm` | 48px tall (44px admin) |
| `table-row` | `canvas`, `surface-soft` on hover | `body` | `none` | 44px, 1px `hairline` divider |
| `sidebar-item-active` | `primary-tint` | `primary` | `sm` | admin only |

### Buttons

One primary button per screen region. If two actions look equally important,
one of them isn't — make it secondary.

### Photo Cards

The homeowner area's primary unit. Photo clipped to `rounded.md`, aspect-ratio
box so the grid never jumps while images load, then 2–3 lines of meta beneath:
title in `title-md`, date in `body-sm` `muted`.

### Forms

Labels sit above inputs in `caption`. Errors render below the field in
`destructive` at `body-sm`, and the input outline switches to `destructive`.
Never rely on colour alone — always pair with text.

## Responsive Behaviour

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 744px | Admin sidebar collapses to a sheet; tables become stacked cards. Homeowner photo grid goes 1-up; top nav collapses to logo + menu. |
| Tablet | 744–1128px | Admin sidebar collapses to icons; tables keep priority columns only. Homeowner grid 2-up. |
| Desktop | 1128–1440px | Admin full sidebar + full table. Homeowner grid 3-up. |
| Wide | > 1440px | Content caps at 1280px (admin) / 1080px (homeowner); gutters absorb the rest. |

**Posting an update must work well on a phone.** Builder staff use it standing on
a job site, one-handed, in daylight. It is the most important mobile surface in
the product — treat desktop as the secondary case for that screen only.

### Touch Targets

- Primary CTAs minimum 48×48px.
- Every homeowner-area interactive element minimum 44×44px.
- Admin may go to 36px for dense table row actions, and no smaller.

## Accessibility

- Body text meets WCAG AA (4.5:1). All three of `primary`, `status-progress`,
  and `status-complete` clear it on white — this is why those specific hexes
  were chosen over the literal brand tints.
- `accent-gold` never carries text. It is a 2.54:1 decorative rule.
- Focus is always visible: 2px `primary` ring at 2px offset.
- Status is never colour alone — badges always carry a text label.

## Known Gaps

- Selections/decisions and change orders are designed for but not built in v1.
  When added, decisions use `status-progress`, never `primary`.
- Empty states are defined per screen rather than globally; keep them plain and
  instructional, since homeowners see them on day one of a build.
- No print stylesheet yet. Documents download as their original files.
