# UI/UX Guide — TaiGerPortalStaticWebsite

> **Dual purpose.** This document is (a) the human style guide for anyone touching UI code in this repo, and (b) a prompt Claude can be pointed at when refactoring a single folder under `src/components/` or `src/pages/`. See [Refactor workflow](#refactor-workflow) for the copy-pasteable block.

---

## 1. Purpose & how to use this guide

We ship a React 18 + TypeScript + MUI v5 app with light and dark themes. The foundation is sound — light/dark palettes exist, most components already use the `sx` prop, and `@emotion` is the styling engine. What has drifted over time:

- A handful of hardcoded hex / named colors scattered across components and `index.css`.
- Ad-hoc `fontSize` / `fontWeight` overrides on top of `<Typography>`.
- One hardcoded-pixel margin in global CSS.
- No written rulebook — so every contributor (human or AI) re-invents conventions.

**How to use this file:**

1. When writing new UI, read [§3 The Rules](#3-the-rules) and follow them.
2. When refactoring an existing folder, copy the [Refactor workflow](#refactor-workflow) prompt, substitute the folder path, and run it.
3. When a batch is complete, tick the row in the [Batch tracker](#batch-tracker) and record the PR/commit.

---

## 2. Source of truth

Raw color, spacing, typography, and breakpoint values live in **exactly one place**:

- [src/components/ThemeProvider/themeLight.ts](../src/components/ThemeProvider/themeLight.ts) — light theme (typography, shape, component overrides).
- [src/components/ThemeProvider/themeDark.ts](../src/components/ThemeProvider/themeDark.ts) — dark theme.
- [src/components/ThemeProvider/paletteLight.ts](../src/components/ThemeProvider/paletteLight.ts) — light palette tokens.
- [src/components/ThemeProvider/paletteDark.ts](../src/components/ThemeProvider/paletteDark.ts) — dark palette tokens.

If you need a color or typography variant that isn't in the theme, **add it there first**, then reference it from your component. Never introduce a raw value downstream.

The theme currently exposes: `palette.primary`, `palette.secondary`, `palette.background`, `palette.text`, `palette.action`, `palette.divider`, plus MUI's auto-filled `palette.error` / `palette.warning` / `palette.info` / `palette.success`. Spacing base is 8px (`theme.spacing(1) === 8px`). Border radius is `8` (`theme.shape.borderRadius`). Typography variants `h1`, `h2`, `button` are customized; the rest are MUI defaults.

---

## 3. The Rules

Six rules. Each batch must satisfy all six.

### R1. Color — only the palette, ever

✅ Do

```tsx
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
<Card sx={{ border: `4px solid ${theme.palette.error.main}` }} />
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }} />
```

❌ Don't

```tsx
<Card sx={{ border: '4px solid red' }} />                 // named color
<Box sx={{ color: '#5f6368' }} />                         // hex
<Chip sx={{ bgcolor: 'rgba(0,0,0,0.2)' }} />              // rgb/rgba
import { red, green, grey } from '@mui/material/colors';  // MUI color import
```

Concrete before → after from the codebase:

- [src/components/Banner/ProgramLanguageNotMatchedBanner.tsx:24](../src/components/Banner/ProgramLanguageNotMatchedBanner.tsx#L24) and [src/components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner.tsx:29](../src/components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner.tsx#L29): `border: '4px solid red'` → `` border: `4px solid ${theme.palette.error.main}` ``.
- [src/components/ApplicationProgressCard/ApplicationProgressCardBody.tsx:13](../src/components/ApplicationProgressCard/ApplicationProgressCardBody.tsx#L13): `import { red } from '@mui/material/colors'` → delete the import and use `theme.palette.error.main`.

If a design truly needs a non-palette color (e.g., a brand accent for a one-off illustration), add it to `paletteLight.ts` + `paletteDark.ts` first as a named token.

### R2. Spacing — theme units, not px

✅ Do

```tsx
<Box sx={{ p: 2, my: 2.5, gap: 1 }} />                   // theme.spacing(2) = 16px
<Stack spacing={2} direction="row" />
<Box sx={{ p: { xs: 1, md: 2 } }} />                     // responsive
```

❌ Don't

```tsx
<Box sx={{ padding: '16px', marginTop: '20px' }} />      // raw px
<div style={{ margin: '10px 0' }} />                     // inline style
.white-line { margin: 20px 0; }                          // hardcoded CSS
```

Concrete before → after:

- [src/index.css:128](../src/index.css#L128): `.white-line { margin: 20px 0 }` — either delete the class if unused, or move the element into a styled component using `sx={{ my: 2.5 }}`.

### R3. Typography — variants only, extend the theme if needed

✅ Do

```tsx
<Typography variant="overline">Status</Typography>
<Typography variant="caption" color="text.secondary">note</Typography>
```

❌ Don't

```tsx
<Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>note</Typography>
<Box sx={{ fontSize: 14, fontWeight: 'bold' }} />
```

Concrete before → after:

- [src/components/Message/DocThreadEditor.tsx:157](../src/components/Message/DocThreadEditor.tsx#L157): `sx={{ fontSize: '0.75rem', letterSpacing: 0.5 }}` → use `variant="overline"` (which is already a themed variant with correct size & letter-spacing) and drop the `sx` overrides. If a new variant is genuinely needed, add it to `themeLight.ts` / `themeDark.ts` under `typography.{variantName}` first.

### R4. Dark-mode parity — no mode branching in components

Every color reference must resolve through the palette, so both themes render correctly without component-level conditionals. Differences between light and dark belong in `paletteDark.ts`, not in component code.

✅ Do

```tsx
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }} />
```

❌ Don't

```tsx
const bg = theme.palette.mode === 'dark' ? '#333' : '#fff';  // branch in component
<Box sx={{ bgcolor: bg }} />
```

Exception: the `ThemeProvider/` folder itself is allowed to use raw values and mode checks — it is the source of truth.

### R5. Responsiveness — `theme.breakpoints`, no raw media queries

✅ Do

```tsx
<Box sx={{ p: { xs: 1, sm: 2, md: 3 }, display: { xs: 'block', md: 'flex' } }} />
```

Or, inside `styled()`:

```tsx
const Main = styled('main')(({ theme }) => ({
  padding: theme.spacing(1),
  [theme.breakpoints.up('md')]: { padding: theme.spacing(3) },
}));
```

❌ Don't

```tsx
const Main = styled('main')`
  padding: 8px;
  @media (min-width: 900px) { padding: 24px; }  // raw media query
`;
```

### R6. Component extraction — inline, then promote

Extraction is a response to duplication, not a pre-emptive design decision.

- **1st occurrence**: use inline `sx`.
- **2nd occurrence (same file, or same feature folder)**: promote to a `styled()` component in the same file.
- **3rd occurrence (cross-feature)**: extract into `src/components/<Domain>/`.

Do not create wrapper components that only pass props through with minor styling — that's churn. If a `styled()` wrapper is shorter than `sx={{}}`, something is wrong.

---

## 4. Accessibility checklist

Applied to every batch alongside R1–R6:

- **Focus-visible**: do not override MUI's `:focus-visible` outline without a replacement of equal or better contrast.
- **Icon-only buttons**: `aria-label` required. Example: `<IconButton aria-label="close"><CloseIcon /></IconButton>`.
- **Color contrast**: text on background must meet WCAG AA (≥ 4.5:1). Use `theme.palette.text.primary` / `text.secondary` on `background.default` / `background.paper` — these are already audited.
- **Keyboard handlers**: every `onClick` on a non-button element needs a matching `onKeyDown` (Enter/Space), or switch to `<Button>` / `<IconButton>`.
- **Interactive boxes**: prefer `<Button variant="text">` over `<Box onClick>`; MUI handles focus, role, and keyboard for you.
- **Images**: `<img>` and `<Avatar src>` require `alt`.

---

## 5. Grep-based offender list

Run each pattern against the folder being refactored. Every match must be resolved before ticking the batch.

| # | Pattern (ripgrep) | Rule | Scope | Fix |
|---|---|---|---|---|
| 1 | `#[0-9a-fA-F]{3,8}` | R1 | `src/**/*.{ts,tsx}` **excluding** `src/components/ThemeProvider/` | Replace with `theme.palette.*` reference. |
| 2 | `\brgb(a)?\(` | R1 | `src/**/*.{ts,tsx,css}` **excluding** `src/components/ThemeProvider/` | Replace with `theme.palette.*` (use `alpha()` from `@mui/material/styles` for transparency). |
| 3 | `['"\`](red\|blue\|green\|black\|white\|grey\|gray\|yellow\|orange\|pink\|purple)['"\`]` | R1 | `src/**/*.{ts,tsx}` | Replace with palette reference. |
| 4 | `from ['"]@mui/material/colors['"]` | R1 | `src/**/*.{ts,tsx}` | Remove import; use `theme.palette.*`. |
| 5 | `\b\d+px\b` | R2 | inside `sx={{ ... }}` or `style={{ ... }}` in `*.tsx`; also `*.css` | Convert to MUI spacing units (`p: 2` = 16px). |
| 6 | `\bfontSize\s*:` or `\bfontWeight\s*:` | R3 | inside `sx={{ ... }}` in `*.tsx` | Use `<Typography variant=...>`; extend theme typography if a new variant is needed. |
| 7 | `palette\.mode\s*===?` | R4 | `src/**/*.{ts,tsx}` **excluding** `src/components/ThemeProvider/` | Move the conditional into `paletteDark.ts`. |
| 8 | `@media\s*\(` | R5 | `src/**/*.{ts,tsx}` | Use `theme.breakpoints` or `sx` responsive object. |
| 9 | `style=\{\{` on an MUI component | R-general | `src/**/*.tsx` | Switch to `sx={{ ... }}`. |

**Suggested ripgrep invocations** (run from repo root):

```bash
rg -n "#[0-9a-fA-F]{3,8}" src --glob "*.tsx" --glob "*.ts" --glob "!src/components/ThemeProvider/**"
rg -n "\brgb(a)?\(" src --glob "*.tsx" --glob "*.ts" --glob "*.css" --glob "!src/components/ThemeProvider/**"
rg -n "from ['\"]@mui/material/colors['\"]" src
rg -nU "sx=\{\{[^}]*\b\d+px\b" src --glob "*.tsx"
rg -nU "sx=\{\{[^}]*\bfontSize\s*:" src --glob "*.tsx"
rg -nU "sx=\{\{[^}]*\bfontWeight\s*:" src --glob "*.tsx"
rg -n "palette\.mode\s*===?" src --glob "*.tsx" --glob "*.ts" --glob "!src/components/ThemeProvider/**"
rg -n "@media\s*\(" src --glob "*.tsx" --glob "*.ts"
```

Scope any invocation to a single folder by appending the path, e.g., `... src/components/Banner/`.

---

## 6. Refactor workflow

Copy-paste this block, substitute `<FOLDER>`, and give it to Claude (or follow it yourself):

> Read `docs/UI_UX_GUIDE.md`. Refactor `<FOLDER>` to comply with rules R1–R6 and the accessibility checklist.
>
> For each grep pattern in §5, run it against this folder only. Fix every match by following the rule's "Fix" column. If a fix requires extending the theme (new palette token, new typography variant, new breakpoint usage), edit the relevant file under `src/components/ThemeProvider/` first, then consume the new token.
>
> Do not change behavior, props, routes, tests, i18n strings, or data fetching. Do not rename exports. Do not reformat unrelated code.
>
> Report the diff summary grouped by rule (R1, R2, R3, R4, R5, R6, a11y). For each grep pattern, report: matches found, matches fixed, matches intentionally left (with reason).

---

## 7. Out of scope

This guide does **not** govern:

- Business logic, data flow, API calls.
- i18n strings or copy.
- Routing, navigation structure.
- Test structure, test data, mocks.
- Build config (Vite, tsconfig, eslint).
- Folder reorganization or file renames.

If a batch uncovers problems in those areas, raise them separately — do not fold them into a UI/UX batch.

---

## Batch tracker

Tick each cell when the rule is verified for the folder, and tick **Done** when all six rules pass **and** every grep pattern in §5 returns zero matches inside the folder. Record the PR or commit hash that completed the batch.

`ThemeProvider/` is intentionally excluded — it is the source of truth and is edited *as part of* other batches when new tokens are needed.

### Components (`src/components/`)

| # | Target folder | R1 | R2 | R3 | R4 | R5 | R6 | a11y | Done | PR/commit |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `ApplicationLockControl/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 2 | `ApplicationProgressCard/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 3 | `AuthProvider/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 4 | `AuthWrapper/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 5 | `Banner/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 6 | `BreadcrumbsNavigation/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 7 | `Buttons/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 8 | `Calendar/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 9 | `Charts/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 10 | `ChatList/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 11 | `ConfirmDialog/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 12 | `DateComponent/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 13 | `EditorJs/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 14 | `ExtendableTable/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 15 | `FilePreview/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 16 | `Footer/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 17 | `GaugeCard/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 18 | `Input/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 19 | `Loading/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 20 | `MaterialReactTable/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 21 | `Message/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 22 | `Modal/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 23 | `MuiDataGrid/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 24 | `NavBar/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 25 | `Offcanvas/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 26 | `Overlay/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 27 | `PDFViewer/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 28 | `ProgramRequirementsTable/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 29 | `StudentOverviewTable/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 30 | `SurveyProvider/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 31 | `Tabs/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 32 | `TopBar/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 33 | `table/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |

### Pages (`src/pages/`)

| # | Target folder | R1 | R2 | R3 | R4 | R5 | R6 | a11y | Done | PR/commit |
|---|---|---|---|---|---|---|---|---|---|---|
| 34 | `Accounting/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 35 | `Admissions/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 36 | `AgentSupportDocuments/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 37 | `ApplicantsOverview/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 38 | `ArchivStudent/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 39 | `AssignmentAgentsEditors/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 40 | `Audit/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 41 | `Authentication/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 42 | `BaseDocuments/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 43 | `CRM/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 44 | `CVMLRLCenter/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 45 | `Communications/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 46 | `Contact/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 47 | `CourseAnalysis/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 48 | `CustomerSupport/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 49 | `Dashboard/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 50 | `Documentation/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 51 | `DownloadCenter/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 52 | `EssayDashboard/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 53 | `InterviewTraining/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 54 | `LearningResources/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 55 | `MyCourses/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 56 | `Notes/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 57 | `OfficeHours/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 58 | `PortalCredentialPage/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 59 | `Profile/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 60 | `Program/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 61 | `Settings/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 62 | `StudentApplications/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 63 | `StudentDatabase/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 64 | `StudentOverview/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 65 | `Survey/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 66 | `TaiGerOrg/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 67 | `TaiGerPublicProfile/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 68 | `UniAssist/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 69 | `Users/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| 70 | `Utils/` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |

### Global

| # | Target | R1 | R2 | R3 | R4 | R5 | R6 | a11y | Done | PR/commit |
|---|---|---|---|---|---|---|---|---|---|---|
| 71 | `src/index.css` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |

> When a new component or page folder is added, append a new row. When a batch's grep runs return zero matches **and** all rule columns are ticked, tick **Done** and record the PR/commit hash.
