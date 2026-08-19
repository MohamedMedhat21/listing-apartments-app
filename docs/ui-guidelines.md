# UI guidelines — styles and layout

Visual and layout conventions for `apps/web`. This document is the authority for **design tokens and layout composition**; it is where the AGENTS.md rules "follow the project's design system" and "do not introduce arbitrary colors or spacing values" point.

**Authority.** [requirements.md](requirements.md) remains the single source of truth. Section 8 there owns page behavior (8.2) and responsive targets (8.3); this document decides only how those are expressed visually, and cites them rather than restating them. Where the two appear to disagree, `requirements.md` wins and the disagreement is reported, not silently resolved.

**Scope.** Consumed by phases P6 through P9 of [implementation-plan.md](implementation-plan.md). Nothing here introduces UI behavior that `requirements.md` does not already specify.

---

## 1. Token contract

All visual values are defined once, in `apps/web/src/app/globals.css`, and consumed as Tailwind utility classes. A component that contains a raw hex color, a raw pixel value, or an arbitrary-value class such as `text-[13px]` is a bug, not a style choice.

The variable names below follow the contract shadcn/ui generates for Tailwind CSS 4, so CLI-installed primitives resolve against our palette without modification. Two families are ours rather than shadcn's: the `--status-*` tokens and `--accent-strong`.

Tailwind 4 defines theme values in CSS, not in a JS config. There is no `tailwind.config.ts` in this project.

```css
@import 'tailwindcss';

:root {
  /* Neutral scale — Tailwind slate */
  --background: #ffffff;
  --foreground: #0f172a; /* slate-900 */
  --card: #ffffff;
  --card-foreground: #0f172a;
  --muted: #f1f5f9; /* slate-100 */
  --muted-foreground: #64748b; /* slate-500 */
  --border: #e2e8f0; /* slate-200 */
  --input: #e2e8f0;

  /* Accent — single hue, teal */
  --primary: #0f766e; /* teal-700 */
  --primary-foreground: #ffffff;
  --accent-strong: #115e59; /* teal-800, hover/active */
  --ring: #0f766e;

  --destructive: #b91c1c; /* red-700 */
  --destructive-foreground: #ffffff;

  /* Apartment status (BR-1 enum) */
  --status-available: #047857; /* emerald-700 */
  --status-reserved: #b45309; /* amber-700 */
  --status-sold: #475569; /* slate-600 */

  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ...one mapping per variable above... */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**Light theme only.** Dark mode is a deliberate omission (see section 9). The `prefers-color-scheme: dark` block from the Next.js scaffold is removed rather than left dormant, so there is no half-supported second theme to keep correct.

### Spacing and radius

Tailwind's default 4px-based scale is the whole spacing vocabulary: `1`, `2`, `3`, `4`, `6`, `8`, `12`, `16`. Anything outside it needs a reason recorded here first. Radius comes from `--radius`: `rounded-md` for inputs and badges, `rounded-lg` for cards.

### Typography

Geist, wired through `next/font` in `layout.tsx`. The scaffold's `body { font-family: Arial }` override is removed — it currently defeats the loaded font.

| Role            | Classes                                             |
| --------------- | --------------------------------------------------- |
| Page title      | `text-2xl sm:text-3xl font-semibold tracking-tight` |
| Section heading | `text-lg font-semibold`                             |
| Card title      | `text-base font-semibold`                           |
| Body            | `text-sm`                                           |
| Meta / caption  | `text-xs text-muted-foreground`                     |
| Price           | `text-lg font-semibold tabular-nums`                |

`tabular-nums` on prices and numeric specs keeps digits from shifting column width between cards.

---

## 2. Layout system

**Page shell** — already established in `app/layout.tsx`: `<html class="h-full">`, `<body class="min-h-full flex flex-col">`, with `<main class="flex-1">` between a header and footer so the footer sits at the bottom on short pages.

**Container** — one component, `components/layout/page-container.tsx`, applying `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`. Pages do not hand-roll their own gutters; that is how padding drifts between routes.

**Card grid** — implementing the column targets in `requirements.md` 8.3:

```
grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

**Vertical rhythm** — `py-8` for page sections, `space-y-6` between blocks within a section, `gap-4` inside a card.

**Filters** — a persistent sidebar or inline row from `md` up; below `md` they collapse behind a disclosure (`requirements.md` 8.3). The disclosure is a shadcn `Collapsible`, not a custom toggle.

**No horizontal scrolling at any width** (8.3). Long unit names and project names truncate with `truncate` or `line-clamp-2` rather than widening their container.

---

## 3. Component inventory

`components/ui/` holds shadcn primitives and nothing else. Anything that knows what an apartment is belongs in a feature folder. This mirrors the tree in AGENTS.md section 4.

**shadcn/ui primitives to install** — only these, and only when the phase that needs one arrives:

`button`, `input`, `select`, `card`, `badge`, `skeleton`, `collapsible`, `label`, `form`, `pagination`

**Project components:**

| Path                                                | Purpose                                  | Phase |
| --------------------------------------------------- | ---------------------------------------- | ----- |
| `components/layout/page-container.tsx`              | Container widths and gutters             | P6    |
| `components/layout/site-header.tsx`                 | Brand, link to listing, auth entry point | P6    |
| `components/layout/site-footer.tsx`                 | Static footer                            | P6    |
| `components/apartments/apartment-grid.tsx`          | The responsive grid wrapper              | P7    |
| `components/apartments/apartment-card.tsx`          | One listing card                         | P7    |
| `components/apartments/apartment-card-skeleton.tsx` | Loading placeholder, card-shaped         | P7    |
| `components/apartments/status-badge.tsx`            | `ApartmentStatus` to badge               | P7    |
| `components/apartments/listing-empty-state.tsx`     | Zero matches                             | P7    |
| `components/apartments/listing-error-state.tsx`     | Failed request, with retry               | P7    |
| `components/apartments/apartment-gallery.tsx`       | Detail images plus thumbnails            | P8    |
| `components/apartments/spec-grid.tsx`               | Price, beds, baths, area, floor, status  | P8    |
| `components/filters/search-input.tsx`               | Debounced `q`, writes to URL             | P7    |
| `components/filters/filter-panel.tsx`               | Groups filters, collapses under `md`     | P7    |
| `components/filters/sort-select.tsx`                | BR-13 sort values                        | P7    |

The empty and error states live under `apartments/` rather than a generic folder because they describe the outcome of an apartment query specifically. If a second feature ever needs them, that is the point at which they get promoted — not before (AGENTS.md: no abstractions without a concrete reuse case).

---

## 4. Status badges

`ApartmentStatus` is the only place color carries meaning:

| Status      | Token                | Treatment                      |
| ----------- | -------------------- | ------------------------------ |
| `AVAILABLE` | `--status-available` | Tinted background, dark text   |
| `RESERVED`  | `--status-reserved`  | Tinted background, dark text   |
| `SOLD`      | `--status-sold`      | Neutral, visibly de-emphasised |

The badge always renders its text label, so meaning never rests on hue alone and the mapping needs no separate icon or pattern.

---

## 5. States

`requirements.md` 8.2 requires loading, empty, error, and 404 to be four distinct states. Visually:

- **Loading** — skeletons that match the final layout, at the same aspect ratio and card height, so nothing shifts when data lands. Never a spinner.
- **Empty** — neutral, states that no apartments matched, and offers a clear-filters action that resets the URL query.
- **Error** — visually distinct from empty, names the failure, and offers a retry. A failed fetch must never render as an empty list (8.2).
- **404** — Next.js `not-found.tsx`, reached via `notFound()` for a missing or soft-deleted apartment (BR-5, BR-6).

---

## 6. Imagery

- Cover images render at `aspect-[4/3]` with `object-cover`, so mixed source dimensions do not change card height.
- `imageUrls` may legitimately be empty (BR-17). Those apartments get a placeholder built from `--muted` and an icon, not a broken image frame.
- The gallery on the details page treats the first URL as the cover; thumbnails appear only when there is more than one image.
- `next/image` uses `images.unoptimized: true`. BR-17 permits any valid external http/https URL, including URLs entered after deployment, so a finite `remotePatterns` allowlist cannot represent the API contract. Image dimensions, lazy loading, and layout-shift prevention still come from the component; only the optimization proxy is bypassed.

---

## 7. Accessibility

Baseline, complementing the rules in AGENTS.md:

- Text meets WCAG AA contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries. The tokens above were chosen with this in mind but must be **verified with a contrast checker in P6**, not assumed.
- Focus is always visible, using `--ring` via `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Outlines are never removed without a replacement.
- Interactive controls are at least 44px on their smallest axis (8.3): `min-h-11` on buttons, inputs, and the mobile filter trigger.
- One `<h1>` per page; heading levels descend without skipping. Cards use a heading element for the unit name, not a styled `<div>`.
- Every input has an associated `<label>`; placeholders are not labels.

---

## 8. Formatting

Formatting lives in `lib/formatters.ts` (P6) so a value cannot be formatted two ways in two places:

- **Price** — `Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })`. EGP with thousands separators (8.2). Always EGP; the API never returns another currency (BR-15).
- **Area** — integer plus `m²`.
- **Bedrooms and bathrooms** — count plus a singular or plural noun.

Arabic and RTL are out of scope (`requirements.md` 2.3), so `en-EG` is the only locale.

---

## 9. Not covered here

Deliberate omissions, so their absence reads as a decision:

- **Dark mode** — not requested by `requirements.md`; a second theme doubles the visual QA surface for no graded benefit.
- **Animation** — no animation library. Only Tailwind transitions on hover and focus.
- **Icons** — `lucide-react`, installed as part of the approved shadcn/ui stack. shadcn's required support packages (`@base-ui/react`, `class-variance-authority`, `clsx`, and `tailwind-merge`) are implementation details of that same approved stack, not additional product capabilities.
- **A component library beyond the P6–P9 inventory** — components are added when a phase needs them.
