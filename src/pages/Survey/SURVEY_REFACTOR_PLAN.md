# SurveyEditableComponent Refactor Plan

## Status

| Phase | Description | Status |
|-------|--------------|--------|
| **Phase 1** | Remove Survey context; use `useSurveyState` hook + props; add unit tests | **Done** |
| **Phase 2** | Split `SurveyEditableComponent` into section components (folder layout below) | **In progress** |

**Done so far:** Context removed (Phase 1). Phase 2: `types.ts`, `useSurveyEditableLocalState`, `SurveyDocLinkEditDialog`, `SurveyMissingFieldsAlerts`, and `SurveyApplicationPreferenceCard` are extracted and wired in. Missing-fields block, Application Preference card, and the doc-link Dialog in `SurveyEditableComponent` are replaced by these components. Unit tests added for `SurveyDocLinkEditDialog`, `SurveyMissingFieldsAlerts`, and `SurveyApplicationPreferenceCard`. **Still inline:** Academic Background card, Languages Test and Certificates card.

---

## 1. Who uses it (minimal surface area)

| Consumer | Usage | Impact of refactor |
|----------|--------|---------------------|
| **SurveyComponent.tsx** | Accepts `initialSurvey` and optional `onSurveySuccess`; calls `useSurveyState`, renders `<SurveyEditableComponent {...surveyActions} />`. | Phase 1 done: props-based. Phase 2 is internal to Survey. |
| **SingleStudentPage** (tab 5) | Renders `<SurveyComponent initialSurvey={...} onSurveySuccess={refetch} />`. | No SurveyProvider. |
| **Survey/index.tsx** | Renders `<SurveyComponent initialSurvey={...} />`. | No SurveyProvider. |

**Conclusion:** Phase 1 refactor is done and self-contained. Phase 2 (splitting the big component) is internal to the Survey page.

---

## 2. Current structure (~2,391 lines, single file)

- **Data:** Survey state and handlers come from **props** (passed from `SurveyComponent`, which uses `useSurveyState`). Local state in `SurveyEditableComponent` is only:
  - `baseDocsflagOffcanvas` / `baseDocsflagOffcanvasButtonDisable` (doc link edit dialog)
  - `anchorEl` (GPA help popover)
- **UI blocks (in order)** — still all in one file:
  1. **Missing-fields alerts** (~127 lines) – Two Cards: “missing academic/application preference” and “missing/outdated language skills”.
  2. **Academic Background card** (~1,015 lines) – High School, University (Bachelor), Second degree, Practical experience, GPA (Bayerische formula) help popover, “Last update” + Update button.
  3. **Application Preference card** (~358 lines) – Expected year/semester, target subjects, degree, language, outside Germany, private unis, special wish, “Last update” + Update button.
  4. **Languages Test and Certificates card** (~708 lines) – Banners, then English / German / GRE / GMAT blocks (each: isPassed, certificate, date, score), “Last update” + Update button.
  5. **Dialog** (~44 lines) – Admin-only: edit documentation link for grading system.

**Fixed:** Banner invalid props (`ReadOnlyMode`, `bg`) removed; no TSC errors from Banner in this file.

---

## 3. Goals (React + TypeScript best practices, modular, extensible)

- **Single responsibility:** One component per logical section (or one per card).
- **Testability:** Sections and shared UI can be unit tested with mocked `SurveyContext` or props.
- **Maintainability:** Smaller files; clear boundaries; shared types and helpers in one place.
- **Extensibility:** Easy to add a new survey section or a new language/test type without touching the rest.
- **Context usage:** Keep using `useSurvey()` only where needed; pass explicit props into subcomponents where it simplifies tests and reuse.

---

## 4. Folder and file layout (Phase 2 — in progress)

**Current:** SurveyComponent.tsx, SurveyEditableComponent.tsx (slimmer; Academic Background + Languages cards still inline), index.tsx, types.ts, hooks/useSurveyEditableLocalState.ts, components/ (SurveyMissingFieldsAlerts, SurveyApplicationPreferenceCard, SurveyDocLinkEditDialog). Unit tests for these components added.

**Target layout:**

```
src/pages/Survey/
├── SurveyComponent.tsx
├── SurveyEditableComponent.tsx      # slim orchestrator: alerts + 3 section cards + dialog
├── SurveyEditableComponent.tsx      # slim orchestrator: alerts + 3 section cards + dialog
├── SURVEY_REFACTOR_PLAN.md          # this file
├── types.ts                         # shared types (props, survey slice types for sections)
├── hooks/
│   └── useSurveyEditableLocalState.ts   # offcanvas + anchor state and handlers
├── components/
│   ├── SurveyMissingFieldsAlerts.tsx    # two “missing info” cards
│   ├── SurveyAcademicBackgroundCard.tsx # whole Academic Background card (or split further*)
│   ├── SurveyApplicationPreferenceCard.tsx
│   ├── SurveyLanguagesCard.tsx          # Languages Test and Certificates card
│   ├── SurveyDocLinkEditDialog.tsx      # admin dialog
│   └── shared/
│       ├── SurveySectionCard.tsx        # Card + title (optional reusable wrapper)
│       ├── SurveyGpaHelpPopover.tsx     # GPA formula popover (used in Academic card)
│       └── (optional) SurveySelectField.tsx / SurveyTextField.tsx  # if we want to reduce repetition
```

\* **Optional deeper split for Academic Background:**  
`SurveyAcademicBackgroundCard` can itself compose: `SurveyHighSchoolSection`, `SurveyBachelorSection`, `SurveySecondDegreeSection`, `SurveyPracticalExperienceSection`. Same idea for **Languages**: `SurveyLanguagesCard` can compose `SurveyEnglishFields`, `SurveyGermanFields`, `SurveyGreFields`, `SurveyGmatFields` plus a small `SurveyLanguageBanners`. Do the card-level split first; sub-sections can be a second phase.

---

## 5. Data flow

- **Phase 1 (done):** Survey state and handlers live in **useSurveyState** (`@components/SurveyProvider/useSurveyState.ts`). **SurveyComponent** calls the hook with `initialSurvey` and passes the return value as props to **SurveyEditableComponent**. No React context.
- **Phase 2 (when splitting):** SurveyEditableComponent will pass to section components the slice of `survey` and handlers they need, plus `user`, `t`. Local UI state (offcanvas, popover) can move into **useSurveyEditableLocalState**. The hook returns `{ openOffcanvas, closeOffcanvas, openPopover, closePopover, ... }` and the dialog/popover components receive these as props so they stay presentational where possible.

Types in `types.ts` should include:

- `SurveyEditableComponentProps` (currently `[key: string]: unknown`; can narrow to `{ docName?: string }` or leave minimal for extension).
- Props for each section component (e.g. `SurveyAcademicBackgroundCardProps`: academic_background slice, handlers, user, t, optional popover state).
- Re-export or mirror any `@taiger-common/model` types used in the survey slice so section components don’t depend on the full survey shape.

---

## 6. Implementation order (Phase 2 — section split)

1. ~~**Add `types.ts`**~~ **Done.** Section props and shared types for the new components.
2. ~~**Add `useSurveyEditableLocalState`**~~ **Done.** Offcanvas and anchor state + handlers in hook; main file uses hook.
3. ~~**Extract `SurveyDocLinkEditDialog`**~~ **Done.** Replaced inline Dialog in main file.
4. ~~**Extract `SurveyMissingFieldsAlerts`**~~ **Done.** Replaced two Cards in main file.
5. ~~**Extract `SurveyApplicationPreferenceCard`**~~ **Done.** Replaced Application Preference card in main file.
6. **Extract `SurveyLanguagesCard`** (pending)  
   Props: `survey`, `user`, `t`, `handleChangeLanguage`, `handleTestDate`, `handleSurveyLanguageSubmit`. Include the two Banners inside. Remove the Languages card block from the main file.

7. **Extract `SurveyAcademicBackgroundCard`**  
   Props: `survey`, `user`, `t`, `handleChangeAcademic`, `handleAcademicBackgroundSubmit`, popover state/handlers, `openOffcanvasWindow`, `surveyLink`. Move the entire Academic Background Card (including GPA popover) into this component. Optionally extract `SurveyGpaHelpPopover` as a child. Remove the block from the main file.

8. **Introduce `SurveySectionCard` (optional)**  
   If the three cards share the same Card + spacing + title pattern, wrap that in `SurveySectionCard` and use it in the three section components.

9. **Slim down `SurveyEditableComponent`**  
   It should only: use props (already in place), call `useSurveyEditableLocalState()`, and render:
   - `SurveyMissingFieldsAlerts`
   - `SurveyAcademicBackgroundCard`
   - `SurveyApplicationPreferenceCard`
   - `SurveyLanguagesCard`
   - `SurveyDocLinkEditDialog`

10. **Optional phase 2b:** Split `SurveyAcademicBackgroundCard` into High School / Bachelor / Second degree / Practical experience subcomponents; split `SurveyLanguagesCard` into per-test subcomponents. Add shared `SurveySelectField`/`SurveyTextField` only if duplication is still high.

---

## 7. Testing

- **Done:** `useSurveyState.test.ts`, `SurveyComponent.test.tsx`, `SurveyEditableComponent.test.tsx` (Academic Background, Application Preference, Languages sections visible), `Survey/index.test.tsx`. **Phase 2:** `SurveyDocLinkEditDialog.test.tsx`, `SurveyMissingFieldsAlerts.test.tsx`, `SurveyApplicationPreferenceCard.test.tsx` (unit tests with mocked props).
- **When Phase 2 is complete:** Add tests for `SurveyLanguagesCard` and `SurveyAcademicBackgroundCard` when extracted. SurveyEditableComponent integration test continues to assert section visibility.

---

## 8. Checklist

**Phase 1 (done):**

- [x] SurveyComponent accepts `initialSurvey` (and optional `onSurveySuccess`); SingleStudentPage and Survey/index pass it (no SurveyProvider).
- [x] SurveyEditableComponent receives survey + handlers via props (no context).
- [x] Banner type errors fixed (ReadOnlyMode/bg removed).
- [x] Unit tests for useSurveyState, SurveyComponent, SurveyEditableComponent; Survey index test still passes.

**Phase 2 (in progress):**

- [x] Dialog extracted (`SurveyDocLinkEditDialog`); missing-fields and Application Preference card extracted; behavior unchanged.
- [ ] SurveyLanguagesCard and SurveyAcademicBackgroundCard extracted (pending).
- [x] No new `any`; section props typed in `types.ts`.
- [x] Unit tests for SurveyDocLinkEditDialog, SurveyMissingFieldsAlerts, SurveyApplicationPreferenceCard.

---

## 9. Removing Survey Context — DONE

### Why we removed context

Survey state is provided via **SurveyProvider** (React Context), which is **nested inside SingleStudentPage** (Survey tab) and also inside the standalone **Survey/index.tsx** route. Removing the context would:

- Avoid nested context and make the Survey tab “just a component with props”.
- Make data flow explicit (props instead of `useSurvey()`), which is easier to test and reason about.
- Allow optional callbacks (e.g. `onSurveySuccess`) so the parent can refetch student data after an update.

### Previous context usage (removed)

| Location | Before | After (Phase 1) |
|----------|--------|------------------|
| **SingleStudentPage** (tab 5) | `<SurveyProvider value={...}><SurveyComponent /></SurveyProvider>` | `<SurveyComponent initialSurvey={...} onSurveySuccess={refetch} />` |
| **Survey/index.tsx** (standalone “My Profile” route) | Same: `<SurveyProvider value={{ ... }}><SurveyComponent /></SurveyProvider>`. Value comes from loader data + `user._id`. |
| **Survey/index.tsx** | Same with SurveyProvider | `<SurveyComponent initialSurvey={...} />` |
| **SurveyEditableComponent** | `useSurvey()` | Receives survey + handlers via **props** |
| **SurveyProvider/index** | Provider + useSurvey | Exports **useSurveyState** + other components only. |

### Approach (implemented): replace context with a hook + props

1. **Extract `useSurveyState(initialValue: SurveyStateValue)`**  
   Move the current SurveyProvider body (useState + all handlers and API calls) into a custom hook. Same inputs (initial value), same return shape (survey + handlers). No React context. Can add optional `onSuccess?: () => void` so the parent can refetch after a successful submit.

2. **SurveyComponent**  
   Accept `initialSurvey: SurveyStateValue`. Inside: `const survey = useSurveyState(initialSurvey)` (and optional `onSuccess`). Render `<SurveyEditableComponent {...survey} />` (or equivalent props). SurveyComponent becomes the only place that runs the hook.

3. **SurveyEditableComponent**  
   Accept full props (survey + all handlers). Use **props** instead of `useSurvey()`. No context dependency. Only the top of the file changes (~20 lines); the rest of the 2,385 lines keep using the same variable names (survey, handleChangeAcademic, etc.).

4. **SingleStudentPage**  
   Replace  
   `<SurveyProvider value={...}><SurveyComponent /></SurveyProvider>`  
   with  
   `<SurveyComponent initialSurvey={{ academic_background, application_preference, survey_link, student_id }} onSurveySuccess={refetch} />`  
   (refetch optional). Remove SurveyProvider import and wrapper.

5. **Survey/index.tsx**  
   Same: remove SurveyProvider; pass `initialSurvey` (from loader + user) into SurveyComponent. Optionally pass `onSurveySuccess` to invalidate loader if using React Router loaders.

6. **SurveyProvider (component)**  
   Remove: delete the Provider and `useSurvey`. Keep the file for:
   - Export **useSurveyState** (new hook).
   - Keep existing exports used by InterviewSurveyForm (SurveyHeader, StepIndicators, etc.); they do not depend on the survey context.

### Refactoring effort (remove context)

| Task | Effort | Risk |
|------|--------|------|
| Extract **useSurveyState** from SurveyProvider (state + handlers + API calls) | **Medium** (~300 lines into hook) | Low |
| Define **SurveyEditableComponentProps** (survey + ~10 handlers) | Small | Low |
| **SurveyEditableComponent**: read from props instead of `useSurvey()` (top ~20 lines) | Small | Low |
| **SurveyComponent**: accept `initialSurvey`, call `useSurveyState`, pass props down | Small | Low |
| **SingleStudentPage**: remove SurveyProvider, pass `initialSurvey` (and optional `onSurveySuccess`) | Small | Low |
| **Survey/index.tsx**: remove SurveyProvider, pass `initialSurvey` | Small | Low |
| Remove **SurveyProvider** component and **useSurvey** from SurveyProvider/index.tsx; keep other exports | Small | Low |
| Optional: **onSurveySuccess** callback for refetch / loader invalidation | Small | Low |

**Total:** **Medium**. Main work is (1) extracting the hook from the Provider and (2) defining and threading props from SurveyComponent into SurveyEditableComponent. The large SurveyEditableComponent body stays as-is except the initial “get survey and handlers from props”.

### Summary

- **Context removal is done.** Data flow is props-based; SingleStudentPage has no nested provider; `onSurveySuccess` allows refetch after survey updates.
- **Next:** Phase 2 is to split `SurveyEditableComponent` into the section components (Section 4 layout); each will receive props from the parent (no context).

---

*Summary: Phase 1 done — Survey context removed; useSurveyState + props; unit tests added. Phase 2 pending — split SurveyEditableComponent into types, useSurveyEditableLocalState, and section components (SurveyMissingFieldsAlerts, SurveyAcademicBackgroundCard, SurveyApplicationPreferenceCard, SurveyLanguagesCard, SurveyDocLinkEditDialog) per the proposed layout above.*
