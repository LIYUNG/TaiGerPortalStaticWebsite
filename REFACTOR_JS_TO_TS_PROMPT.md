# TaiGerPortalStaticWebsite: TypeScript React Type Hardening Prompt

Use this prompt in Cursor to complete type hardening for the TaiGerPortalStaticWebsite TypeScript React project. Work in the **TaiGerPortalStaticWebsite** workspace only.

---

## Progress (resume from here if interrupted)

- **Conversion** ✅ DONE — All `src` files converted from JavaScript/JSX to TypeScript/TSX.
- **Config** ✅ DONE — Vite, Vitest, ESLint (flat config), TypeScript (strict), i18next-scanner, lint-staged configured.
- **Shared types** ✅ DONE — `src/api/types.ts`, `src/types/taiger-common.d.ts`, `src/types/global-d.ts`, `src/vite-env.d.ts`.
- **Core modules** ✅ DONE — Entry, routes, API, config, contexts, hooks, i18n, menu, components, Demo pages.
- **Remaining** — 2 `.js` files: `src/__mocks__/styleMock.js`, `src/Demo/CRM/components/meetingUtils.js`.
- **Next** — Fix type warnings: add missing interfaces, eliminate implicit `any`, type event handlers and callbacks.

---

## 1. Goal

- **Complete type hardening** across the codebase: add missing interfaces, fix implicit `any`, type event handlers and callbacks.
- Keep behavior identical: no feature changes, no UI changes.
- Ensure `npm run build`, `npm run test:ci`, and `npm run lint` all pass with no type or lint warnings.

---

## 2. Current Project Context

- **Build**: Vite 5.x (not Create React App). `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`.
- **React**: 18.x with `createRoot`, functional components, hooks.
- **Testing**: Vitest (not Jest). `vitest.config.ts`, `setupTests.ts`.
- **Routing**: `react-router-dom` v6 — `createBrowserRouter`, `RouterProvider`, loaders via `api/dataLoader.ts`.
- **Data**: `@tanstack/react-query` (QueryClient in `src/api/client.ts`).
- **UI**: MUI 5 (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-charts`).
- **i18n**: `react-i18next` + `i18next`; namespaces under `src/i18n/{en,zh-CN,zh-TW}/`.
- **Context**: `AuthProvider`, `SnackBarProvider` (`contexts/use-snack-bar.tsx`).
- **External**: `@taiger-common/core`, `@taiger-common/model` (workspace packages).
- **Lint**: ESLint 9 flat config (`eslint.config.js`), `typescript-eslint` recommended.

---

## 3. Action Items to Fix Type Warnings

Prioritize these in order. Run `npm run build`, `npm run lint`, and `npx tsc --noEmit` after each batch to verify.

### Priority 1: Missing Component Props Interfaces

Add typed props interfaces for components that use destructured props without types.

| File / Area | Action |
|-------------|--------|
| `Demo/StudentDatabase/Meetings/MeetingCard.tsx` | Add `MeetingCardProps` interface for `meeting`, `isPast`, `onEdit`, `onDelete`, `onConfirm`, `showActions`. |
| `Demo/StudentDatabase/Meetings/MeetingFormModal.tsx` | Add `MeetingFormModalProps` for `open`, `onClose`, `onSave`, `meeting`, `isLoading`, `student`. |
| `Demo/StudentDatabase/Meetings/MeetingList.tsx` | Add props interface for student and meeting-related props. |
| `Demo/StudentDatabase/MeetingTab.tsx` | Add props interface. |
| `Demo/Admissions/AdmissionsTables.tsx`, `AdmissionsStat.tsx` | Add props interfaces. |
| `Demo/CVMLRLCenter/*` | Add props interfaces for `FileItem`, `FilesList`, `CVMLRLOverview`, `CVMLRLDashboard`, etc. |
| `Demo/ApplicantsOverview/ApplicationOverviewTabs.tsx` | Add props interface. |
| `Demo/Communications/MessageEdit.tsx` | Add props interface. |
| `Demo/Documentation/DocPageView.tsx` | Add props interface. |
| `Demo/CourseAnalysis/ProgramRequirements/ProgramRequirementsEditIndex.tsx` | Add props interface. |
| `Demo/Users/UsersTable.tsx` | Add props interface. |
| `Demo/TaiGerOrg/InternalDashboard/index.tsx` | Add props interface. |
| `Demo/EssayDashboard/EssayOverview.tsx` | Add props interface. |
| `components/table/*/TopToolbar.tsx` | Add props interfaces for each TopToolbar. |
| `hooks/useDialog.tsx` | Add typed generic or props for dialog state. |
| `contexts/use-snack-bar.tsx` | Ensure `SnackBarContextValue` is complete. |

### Priority 2: Implicit `any` in Functions

Add parameter and return types for functions that currently infer `any`.

| Pattern | Fix |
|---------|-----|
| `(dateTime) => ...` | Type as `(dateTime: string \| null \| undefined) => string`. |
| `(tz) => ...` | Type as `(tz: string) => string`. |
| `(part) => part.type === ...` | Type callback parameter: `(part: Intl.DateTimeFormatPart) => ...`. |
| `useState({})` | Type as `useState<Record<string, string>>({})` or a specific interface. |
| Event handlers `(e) => ...` | Type as `(e: React.ChangeEvent<HTMLInputElement>) => ...` etc. |
| Callbacks like `onEdit`, `onSave`, `onClose` | Type as `() => void` or `(id: string) => void` etc. |

**Example pattern** (MeetingCard.tsx):

```tsx
// Before
const formatDateTime = (dateTime) => { ... }

// After
const formatDateTime = (dateTime: string | null | undefined): string => { ... }
```

### Priority 3: Utils and Constants

| File | Action |
|------|--------|
| `src/utils/contants.tsx` | Fix typo: rename to `constants.ts` (or `constants.tsx` if it contains JSX). Update all imports. Add explicit types for exported values and helper functions. File is large (2600+ lines)—add interfaces for object literals and typed helper functions. |

### Priority 4: Test Files and Mocks

| File | Action |
|------|--------|
| `src/test/test-utils.tsx` | Ensure `renderWithQueryClient`, `createTestQueryClient` have typed parameters/return. |
| `src/__mocks__/styleMock.js` | Convert to `styleMock.ts` (or `.cjs` if needed for Jest/Vitest). |
| `src/Demo/Program/SingleProgram.test.tsx` | Ensure loader mock and `createMemoryRouter` types are correct. |
| Other `*.test.tsx` | Add typed props for wrapper components; avoid `any` in mocks. |

### Priority 5: Remaining JavaScript Files

| File | Action |
|------|--------|
| `src/__mocks__/styleMock.js` | Convert to `styleMock.ts` (returns empty object for CSS imports). |
| `src/Demo/CRM/components/meetingUtils.js` | Convert to `meetingUtils.ts`; add types for exported functions. |

### Priority 6: API and Loader Types

| Area | Action |
|------|--------|
| `api/dataLoader.ts` | Ensure all loaders return typed values (e.g. `LoaderFunction`, `defer` with typed data). |
| `api/request.ts`, `api/client.ts` | Ensure `getData<T>`, `postData`, etc. have correct generics. |
| `api/types.ts` | Add missing response/request interfaces for any API used without types. |

### Priority 7: Routes and Lazy Imports

| Area | Action |
|------|--------|
| `routes.tsx` | Ensure route `element` and `loader` are correctly typed. |
| `React.lazy(() => import(...))` | Ensure imported components have typed props (no implicit `any` at usage). |

---

## 4. Type Definitions to Introduce / Extend

- **Component props**: Define `ComponentNameProps` for every component that receives props. Include `children?: React.ReactNode` when applicable.
- **Event handlers**: Use `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent`, etc.
- **Callbacks**: Type as `() => void`, `(id: string) => void`, `(data: SomeType) => void`, etc.
- **useState**: Prefer `useState<Type>(initial)` over `useState(initial)` when the initial value is empty or generic.
- **Loader data**: Use `useLoaderData()` with `as LoaderData` or typed loader return from `api/types.ts`.

---

## 5. Strictness and Pitfalls

- Avoid `any` unless necessary (e.g. third-party with no types). Prefer `unknown` and type guards when the shape is unclear.
- `tsconfig.app.json` has `strict: true`. Fix implicit `any` by adding parameter and return types.
- For refs: use `useRef<HTMLDivElement>(null)` and `RefObject<HTMLDivElement>`.
- For `children`: use `React.ReactNode` in props.
- Environment variables: Use `import.meta.env.VITE_*` (Vite) or extend `ProcessEnv` in a `.d.ts` for `process.env`.
- Do not change logic, API contracts, or UX; only add types.

---

## 6. Verification Checklist

After type hardening:

- [ ] `npm run build` succeeds (no TypeScript or build errors).
- [ ] `npm run dev` runs and the app loads; login, navigation, and key flows work.
- [ ] `npm run test:ci` passes.
- [ ] `npm run lint` passes (no ESLint errors or warnings).
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] No remaining `.js`/`.jsx` in `src` (except documented exceptions).
- [ ] `src/utils/contants.tsx` renamed to `constants.ts`/`constants.tsx` and all imports updated.
- [ ] No implicit `any` in component props or callbacks.

---

## 7. Suggested Cursor Workflow

1. **Batch 1**: Add props interfaces to `Demo/StudentDatabase/Meetings/*` (MeetingCard, MeetingFormModal, MeetingList, MeetingTab). Run `tsc --noEmit` and lint.
2. **Batch 2**: Add props interfaces to `Demo/Admissions`, `Demo/CVMLRLCenter`, `Demo/ApplicantsOverview`, `Demo/Communications`, `Demo/Documentation`, `Demo/CourseAnalysis`, `Demo/Users`, `Demo/TaiGerOrg`, `Demo/EssayDashboard`.
3. **Batch 3**: Fix implicit `any` in helper functions (formatDateTime, formatTimezoneDisplay, etc.) and event handlers across the above files.
4. **Batch 4**: Convert remaining `.js` files (`styleMock.js`, `meetingUtils.js`) to TypeScript.
5. **Batch 5**: Rename `utils/contants.tsx` → `constants.ts` (or `.tsx`) and update imports; add types to exported values.
6. **Batch 6**: Type test utilities and mocks; ensure test files have no `any` where avoidable.
7. Run full **Section 6** checklist.

Use this prompt as the single source of requirements for TaiGerPortalStaticWebsite TypeScript type hardening.
