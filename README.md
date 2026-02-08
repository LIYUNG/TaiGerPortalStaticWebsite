# TaiGer Portal Static Website

React + TypeScript frontend (Vite). Migrated from Create React App.

## Tech stack

- **React** 18 + **TypeScript** (strict)
- **Vite** 5 (dev and build)
- **React Router** v6, **TanStack Query**, **MUI** 5
- **Vitest** + **Testing Library**
- **i18n**: react-i18next; **Context**: AuthProvider, SnackBarProvider

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server (e.g. [http://localhost:3006](http://localhost:3006)). |
| `npm run build` | `tsc` + production build. Set API endpoint before building. |
| `npm run preview` | Serve production build locally. |
| `npm run typecheck` | `tsc --noEmit` — type-check only (use before commit/CI). |
| `npm run test` | Vitest watch. |
| `npm run test:ci` | Vitest single run (CI). |
| `npm run test:coverage` | Vitest with coverage. |
| `npm run lint` | ESLint. |
| `npm run lint:fix` | ESLint with auto-fix. |
| `npm run format` | Prettier on `src/**`. |

## TypeScript and type hardening

- **Shared types**: `src/api/types.ts` — `AuthContextValue`, `AuthUserData`, `Application`, `ApiResponse`, `MeetingResponse`, `AdmissionsStatRow`, etc.
- **Strategy**: Prefer reusing/extending these; add new shared types there when used by more than one module. Component-specific props stay in the component file (e.g. `MeetingCardProps` in `MeetingCard.tsx`).
- **Refactoring guide**: Step-by-step fixes for event handlers, props, state, API responses: **[docs/REFACTORING_JS_TO_TS_STRATEGY.md](docs/REFACTORING_JS_TO_TS_STRATEGY.md)**.

Quick check before pushing:

```bash
npm run typecheck
```

## Type hardening progress (JS → TS)

- **Conversion** — All `src` files converted from JS/JSX to TS/TSX.
- **Config** — Vite, Vitest, ESLint (flat), TypeScript (strict), i18next-scanner, lint-staged.
- **Shared types** — `src/api/types.ts`, `src/types/taiger-common.d.ts`, `src/types/global-d.ts`, `src/vite-env.d.ts`.
- **Remaining** — Add missing props interfaces where needed; eliminate implicit `any`; type event handlers and callbacks (see refactoring doc).

### Priorities (when fixing types)

1. **Component props** — Add `ComponentNameProps` for components that receive props (see REFACTORING_JS_TO_TS_STRATEGY.md).
2. **Event handlers** — Type `e` as `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLElement>`, `React.FormEvent<HTMLFormElement>`, etc.
3. **Callbacks** — Type as `() => void`, `(id: string) => void`, `(data: SomeType) => void`.
4. **useState** — Use `useState<Type>(initial)` when the value is empty or generic.
5. **API/loaders** — Use `ApiResponse<T>`, typed loaders, and typed `useLoaderData()` where applicable.

### Verification

After type changes:

- [ ] `npm run build` succeeds
- [ ] `npm run test:ci` passes
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes

## Deployment

Set the API endpoint for the target environment before `npm run build`. See [Create React App deployment](https://facebook.github.io/create-react-app/docs/deployment) for build/deploy options.
