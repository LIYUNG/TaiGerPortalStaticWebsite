# TaiGerPortalStaticWebsite: JavaScript React → TypeScript React Refactor Prompt

Use this prompt in Cursor to refactor the **entire** TaiGerPortalStaticWebsite project from JavaScript/JSX to TypeScript/TSX. Work in the **TaiGerPortalStaticWebsite** workspace only.

---

## Progress (resume from here if interrupted)

- **Section 3** ✅ DONE — TypeScript, Babel, ESLint, Jest, i18next-scanner, lint-staged configured.
- **Section 5 (partial)** ✅ DONE — `src/react-app-env.d.ts`, `src/api/types.ts` added. (`taiger-common` has TS source; skip `.d.ts` unless package has no types.)
- **Section 4.2 (Entry)** ✅ DONE — `index.tsx`, `App.tsx`, `reportWebVitals.ts`, `setupTests.ts`, `serviceWorker.ts` created; old `.js` removed.
- **Section 4.4 (Store/constants)** ✅ DONE — `store/constant.ts` created; `config.ts` created; old `constant.js` and `config.js` removed.
- **Section 4.5 (API)** ✅ DONE (partial) — `api/request.ts`, `api/client.ts`, `api/types.ts` created; old `request.js`, `client.js` removed. `api/index.js`, `dataLoader.js`, `query.js` still JS (convert when doing full API pass).
- **Section 4.6** ✅ DONE — Config: `config.ts` (see 4.4).
- **Section 4.7** ✅ DONE — `contexts/use-snack-bar.tsx` (SnackBarContextValue typed).
- **Section 4.8** ✅ DONE — `components/AuthProvider/index.tsx` (AuthContextValue, AuthUserdataState from api/types).
- **Section 4.9** ✅ DONE — `hooks/useDialog.tsx`, `useCalendarEvents.ts`, `useCommunications.ts`, `useStudents.ts`.
- **Section 4.10** ✅ DONE — `i18n.ts`, `i18next/translation.ts`, `en.ts`, `zh-CN.ts`, `zh-TW.ts`.
- **Section 4.11** ✅ DONE — `menu-sidebar.tsx` (MenuItem interface).
- **Section 4.12 (components)** ✅ DONE. All components converted: Banner, ThemeProvider, Buttons, ApplicationProgressCard, Tabs, DateComponent, GaugeCard, Overlay, Charts (4), Calendar (4), ChatList (3), EmbeddedChatList (3), SurveyProvider (8), Message (3), NavBar/NavSearch, ExtendableTable, FilePreview, PDFViewer, Offcanvas, Input/searchableMuliselect, MaterialReactTable, MuiDataGrid, ProgramRequirementsTable, EditorJs (3), table/* (index, programs-table, users-table, all-courses, students, interviews), StudentOverviewTable (index.tsx, finalDecisionOverview.tsx).
- **Section 4.13 (Demo)** — **Bulk rename done.** All remaining .js/.jsx in src/ were renamed via `scripts/rename-js-to-ts.js`: .jsx→.tsx, .js→.tsx (if JSX) or .ts. **268 files** renamed (246→.tsx, 22→.ts). Only `src/utils/contants.js` was intended to be skipped (for 4.15 constants.ts rename); it was renamed to contants.tsx—either revert to .js for 4.15 or rename to constants.ts and update imports. **Next:** Fix type errors in renamed files (add interfaces, remove PropTypes, fix `any`), then 4.14–4.15, PropTypes (6), verification (8).
- **Next** — Fix type errors in bulk-renamed files (tsc/lint); utils/contants → constants (4.15); PropTypes (6); verification (8).

---

## 1. Goal

- Convert all `src` code from **JavaScript/JSX** to **TypeScript/TSX**.
- Add proper TypeScript types and interfaces across the codebase.
- Keep behavior identical: no feature changes, no UI changes.
- Preserve existing tooling where possible (Create React App, Babel, Jest, ESLint, Prettier, i18next-scanner, Husky).

---

## 2. Project Context (Do Not Change Behavior)

- **Build**: Create React App (`react-scripts` 5.x). Use CRA’s built-in TypeScript support (no eject).
- **React**: 18.x with `createRoot`, functional components, hooks.
- **Routing**: `react-router-dom` v6 — `createBrowserRouter`, `RouterProvider`, `Outlet`, `Navigate`, loaders via `api/dataLoader.js`.
- **Data**: `@tanstack/react-query` (QueryClient in `src/api/client.js`). No Redux usage in `src` (package can stay for now).
- **UI**: MUI 5 (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-charts`).
- **i18n**: `react-i18next` + `i18next`; namespaces under `src/i18n/{en,zh-CN,zh-TW}/`.
- **Context**: `AuthProvider` (`src/components/AuthProvider`), `SnackBarProvider` (`src/contexts/use-snack-bar.js`).
- **External**: `@taiger-common/core` (workspace package) — keep imports; add `@types` or type declarations only if needed.

---

## 3. Configuration Changes (Do First) ✅ DONE

1. **TypeScript**
   - Add `typescript` and `@types/react`, `@types/react-dom`, `@types/node` to `package.json` (versions compatible with React 18 and Node 18+).
   - Add `tsconfig.json` at project root with:
     - `"jsx": "react-jsx"`, `"module": "ESNext"`, `"moduleResolution": "node"`, `"target": "ES2020"` (or aligned with current Babel target).
     - `"strict": true`, `"noEmit": true`, `"include": ["src"]`, `"allowJs": true` during migration; set `allowJs` to `false` after all files are converted.
   - Add `src/react-app-env.d.ts` with `/// <reference types="react-scripts" />` (CRA convention).

2. **Babel**
   - Add `@babel/preset-typescript` to `babel.config.js` so both `.ts`/`.tsx` and `.js`/`.jsx` are transpiled (CRA may override; if so, rely on CRA’s TS support and only ensure no conflict).

3. **ESLint**
   - Add `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`. Extend `plugin:@typescript-eslint/recommended` (or `recommended-type-checked` if desired).
   - In overrides, use the TypeScript parser for `**/*.{ts,tsx}`; keep existing rules for `**/*.{js,jsx}` until removed.
   - Update `parserOptions` to include `project: true` (or `./tsconfig.json`) for type-aware rules if you use them.
   - Keep existing React/Prettier/TanStack rules; turn off `react/prop-types` for `.tsx` (replaced by TypeScript).

4. **Jest**
   - In `jest.config.js`, ensure `moduleFileExtensions` includes `'ts', 'tsx'` and transform handles `\.(ts|tsx)$` (e.g. `babel-jest` with preset-typescript, or `ts-jest` if you prefer). Update `testMatch` to include `**/*.test.{ts,tsx}` and `setupFilesAfterEnv` to point to `setupTests.ts` once converted.

5. **i18next-scanner**
   - In `i18next-scanner.config.engine.js`, add `'src/**/*.{ts,tsx}'` to `input` and add `'.ts', '.tsx'` to `func.extensions` so new TS/TSX files are scanned.

6. **lint-staged**
   - Extend pattern from `**/*.{js,jsx}` to `**/*.{js,jsx,ts,tsx}` so Prettier and ESLint run on TS/TSX.

7. **Prettier**
   - No config change required; Prettier supports TS by default.

---

## 4. File Conversion Strategy

- **Order**: Config first, then entry and app shell, then shared code, then feature code.
  1. Config and types: `tsconfig.json`, `react-app-env.d.ts`, global/shared types (see below). ✅
  2. Entry: `src/index.js` → `index.tsx`, `src/App.js` → `App.tsx`, etc. ✅
  3. Routes and loaders: `src/route.js`, `src/routes.js`, `src/route.js` → `.tsx` (they use JSX). Update lazy imports to `.tsx` as you rename.
  4. Store/constants: `src/store/constant.js` → `constant.ts`, `src/utils/contants.js` → `constants.ts` (fix typo: “contants” → “constants”) and update all imports.
  5. API: `src/api/*.js` → `.ts` or `.tsx` (e.g. `client.ts`, `request.ts`, `dataLoader.ts`, `query.ts`, `index.ts`). Add types for request/response and loader return types where possible.
  6. Config: `src/config.js` → `config.ts`. ✅
  7. Contexts: `src/contexts/use-snack-bar.js` → `use-snack-bar.tsx` (JSX). Type context value and provider props. ✅
  8. Auth: `src/components/AuthProvider/index.js` → `index.tsx`. Type `AuthContext` value and `userdata` shape. ✅
  9. Hooks: `src/hooks/*.js` / `*.jsx` → `.ts` or `.tsx`. Type parameters and return types. ✅
  10. i18n: `src/i18n.js`, `src/i18next/*.js` → `.ts`. Keep JSON under `src/i18n/` as-is. ✅
  11. Menu/routing helpers: `src/menu-sidebar.js` → `menu-sidebar.tsx`. ✅
  12. Components: Convert every file under `src/components/**` from `.js`/`.jsx` to `.ts`/`.tsx`. Use `.tsx` where the file contains JSX.
  13. Demo (pages/features): Convert every file under `src/Demo/**` and `src/Demo/**/**` from `.js`/`.jsx` to `.ts`/`.tsx`. Preserve folder structure and lazy imports in `routes`/`route`.
  14. Test data: `src/test/*.js` → `.ts` (or keep as `.ts` with typed exports). `src/__mocks__/*.js` → `.ts` if they are code; otherwise leave.
  15. Utils: `src/utils/contants.js` → `constants.ts` (and fix typo everywhere).

- **Naming**:
  - Files that contain JSX → `.tsx`; pure logic/config/types → `.ts`.
  - Keep the same base file names (e.g. `MeetingCard.jsx` → `MeetingCard.tsx`). Update all imports to the new extensions (or rely on resolution that drops extension).

- **Imports**: After renaming, ensure every import path points to the new file (`.ts`/`.tsx`). CRA and TypeScript resolve without extension; be consistent.

---

## 5. Type Definitions to Introduce

- **React**
  - Use `React.FC` sparingly; prefer `(props: Props) => JSX.Element` or explicit return type where it helps.
  - For component props: define an interface per component (e.g. `MeetingCardProps`) and use it for the first parameter.

- **Context**
  - `AuthContext`: type for `{ userdata, isAuthenticated, login, handleLogout, ... }` and for `userdata` (e.g. `{ error, success, data, isLoaded, res_modal_message, res_modal_status }`). Use `undefined` in the default context value if appropriate.
  - `SnackBarContext`: type for `{ setOpenSnackbar, setSeverity, setMessage }`.

- **Router**
  - Type loader functions in `api/dataLoader.js`: use `LoaderFunction` from `react-router-dom` and concrete return types (or a shared type for “page data”) where applicable.
  - Routes defined in `routes.js`/`route.js`: ensure `element` and `children` are typed by inference (no `any`).

- **API**
  - `request.js`: type the axios instance, `getData`/`postData`/`putData`/`deleteData` (e.g. generic `getData<T>(url): Promise<T>`).
  - API response shapes: introduce interfaces for responses used in the app (e.g. verify, logout, students, programs). Put them in `src/api/types.ts` or next to the API module.

- **Config / constants**
  - `config.js`: type `appConfig` (all keys and values).
  - `store/constant.js`: type the object (values are strings or functions that return strings). Use a single interface or namespace.

- **@taiger-common/core**
  - If the package has no types, add a `src/types/taiger-common.d.ts` with `declare module '@taiger-common/core' { ... }` declaring the used exports (e.g. `PROGRAM_SUBJECTS`, `SCHOOL_TAGS`, `is_TaiGer_Student`, `is_TaiGer_role`, `is_TaiGer_Admin`, `is_TaiGer_Agent`, `is_TaiGer_Editor`, `isProgramDecided`, etc.) so that imports type-check.

- **Third-party libraries**
  - Install `@types/*` for any library that lacks bundled types (e.g. `query-string`, `export-to-csv`, `react-google-charts`, `namor`, etc.). Use `// @ts-ignore` or `declare module` only where no types exist and minimal typing is acceptable.

- **Events and handlers**
  - Type event handlers as `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, etc. Avoid `any` for event parameters.

---

## 7. Strictness and Pitfalls

- Avoid `any` unless necessary (e.g. third-party with no types). Prefer `unknown` and type guards when the shape is unclear.
- Use `strict: true` in `tsconfig.json`. Fix implicit `any` by adding parameter and return types.
- For refs: type as `RefObject<HTMLDivElement>` (or the right element). Use `useRef<Type>(null)`.
- For `children`: use `React.ReactNode` in props.
- For lazy-loaded components: ensure `React.lazy(() => import('./path'))` resolves to a component that TypeScript knows returns `JSX.Element` (or use a typed wrapper if needed).
- Environment variables: `process.env.REACT_APP_*` — extend `ProcessEnv` in a `.d.ts` if you want them typed.
- Do not change logic, API contracts, or UX; only add types and rename/restructure files for TypeScript.

---

## 8. Verification Checklist

After refactor:

- [ ] `npm run build` succeeds (no TypeScript or build errors).
- [ ] `npm run start` runs and the app loads; login, navigation, and key flows work.
- [ ] `npm run test` (or `test:ci`) passes; update tests to `.test.ts`/`.tsx` and fix any type errors.
- [ ] `npm run lint` passes (ESLint for both JS and TS).
- [ ] `translations-scan` still picks up keys from `.ts`/`.tsx` (i18next-scanner config updated).
- [ ] No remaining `.js`/`.jsx` in `src` (except possibly a few left intentionally; if so, document).
- [ ] All imports of `contants.js` updated to `constants.ts` and typo fixed across the repo.
- [ ] `tsconfig.json` has `"allowJs": false` and no skipped files.

---

## 9. Suggested Cursor Workflow

1. Apply **Section 3** (config) and **Section 5** (shared types / `react-app-env.d.ts`, `api/types.ts`, `taiger-common.d.ts`) in one pass.
2. Convert entry and app shell (**Section 4**, steps 2–3), then store, API, config, contexts, hooks, i18n, menu.
3. Convert `src/components` and then `src/Demo` in batches (e.g. by folder). After each batch, run `npm run build` and fix errors.
4. Run full build, tests, and lint; fix remaining type and lint issues.
5. Set `allowJs: false`, fix any stragglers, then run the **Section 8** checklist again.

Use this prompt as the single source of requirements for the TaiGerPortalStaticWebsite JavaScript → TypeScript refactor.
