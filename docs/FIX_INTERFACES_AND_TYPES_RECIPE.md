# Recipe: Fix Interfaces and Type Issues

Use this **copy-paste instruction** when you want an AI (or yourself) to fix TypeScript interface and type issues in this codebase in a consistent way.

---

## Copy-paste prompt (for AI or future you)

```
Fix interfaces and type issues in the specified file(s) using this recipe:

1. **Exact interfaces (no Record/unknown/any)**
   - Define interfaces with only the fields the component actually uses.
   - Do NOT use Record<string, unknown>, Record<string, any>, or any for props/state/data that you can type exactly.
   - For API responses or nested objects, add a small local interface (e.g. StudentCardStudent with _id, firstname, applications) instead of a broad index type.

2. **@taiger-common/core compatibility**
   - Helpers like calculateApplicationLockStatus, calculateProgramLockStatus, isProgramSubmitted, isProgramDecided, application_deadline_V2_calculator, ApplicationLockControl expect ApplicationProps (e.g. required decided).
   - Our api/types Application may have optional decided. At call sites, cast when passing to core: (application as ApplicationProps).
   - For calculateProgramLockStatus(programId): if programId can be undefined, either guard (e.g. programId ? calculateProgramLockStatus(programId as Record<string, unknown>) : calculateProgramLockStatus({})) or pass a definite value; do not pass undefined.

3. **Optional chaining for optional fields**
   - Use optional chaining for: student.applications?, application._id?.toString(), application.programId?.school, thread.doc_thread_id?._id, and any optional or possibly-undefined property.
   - When updating state derived from student_temp.applications, guard: application_idx !== -1 && student_temp.applications, then use student_temp.applications?.[application_idx] and check before mutating (e.g. appAtIdx?.closed = data.closed).

4. **Array callbacks and unknown[]**
   - If an array is typed as unknown[] (e.g. from API or doc_modification_thread), type the callback parameter as unknown and cast inside: (item: unknown) => (item as { _id: string })._id === id.
   - For .filter/.findIndex on such arrays, same approach: predicate (x: unknown) => ... with cast inside, or cast the array to a typed interface first (e.g. as { doc_thread_id?: { _id?: { toString(): string } } }[]).

5. **Event and callback types**
   - Use React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> for input/textarea onChange.
   - Type callback parameters explicitly (e.g. openRequirements_ModalWindow(ml_requirements: string), handleProgramStatus(student_id: string, application_id: string, isApplicationSubmitted: boolean)).

6. **API and state IDs**
   - When the API expects a string (e.g. application_id), use application_id ?? '' or application?._id?.toString() ?? '' so you never pass null/undefined where a string is required.
   - Keep state.application_id as string (or optional string); avoid null if the rest of the code uses '' for “none”.

7. **Third-party style objects**
   - If a shared style constant (e.g. spinner_style2) causes “Type 'string' is not assignable to type 'OverflowWrap | undefined'” (or similar), fix at use site: style={spinner_style2 as React.CSSProperties} rather than changing the shared constant, to avoid touching files with many unrelated errors.

8. **Run and verify**
   - After edits: run the linter (and tests if applicable) on the changed files and fix any remaining errors.
```

---

## ESLint fixes (use with the recipe)

When fixing **ESLint warnings/errors** in the same spirit (clean types, no dead code):

- **@typescript-eslint/no-unused-vars**
  - Intentionally unused parameters: use `catch { }` instead of `catch (_err) { }`; or remove the parameter (e.g. mock `t: (key: string) => key` instead of `t: (key: string, _options?: unknown) => key`).
  - Assigned but never used: remove the variable or prefix with `_` only if your ESLint config allows `argsIgnorePattern: "^_"`; otherwise remove or use it.

- **no-constant-condition**
  - Remove dead branches (e.g. `if (false) { ... } else { ... }` → keep only the else body and delete the `if (false)` branch and the extra `}`).

- **@typescript-eslint/no-empty-object-type**
  - Replace empty `interface Foo {}` with `type Foo = Record<string, never>` for “no props”, or add a real property. If the component does not use props, use `const Component = () => { ... }` and type props as `Record<string, never>` only if the type is still exported.

- **react-hooks/exhaustive-deps**
  - Constants (e.g. `TAB_KEYS`) that never change: remove them from the dependency array or move into the callback if the rule insists.
  - Missing deps: add them if safe, or add an eslint-disable-next-line with a short comment if the effect must run only on mount or on specific deps by design.

- **react-hooks/rules-of-hooks**
  - Hooks must run in the same order every render. Move all hooks to the top level; do not call hooks after an early return or inside conditionals. Restructure the component so hooks are unconditional.

After ESLint changes, run `npm run lint` (and tests) and fix any remaining issues.

---

## When to use this recipe

- You see TypeScript errors about `Record<string, unknown>`, `any`, or “possibly undefined”.
- Components use `application`, `student`, or API data without proper interfaces.
- You get errors from `@taiger-common/core` helpers (ApplicationProps, programId, etc.).
- You want to standardize how interfaces and types are fixed across the repo.

## Files already updated with this approach

- `src/Demo/Program/ProgramChangeRequestPage.tsx`
- `src/Demo/CRM/components/SimilarStudents.tsx`
- `src/Demo/CRM/components/CreateUserFromLeadModal.tsx`
- `src/Demo/CVMLRLCenter/EditorDocsProgress.tsx`
- `src/Demo/CourseAnalysis/ProgramRequirements/ProgramRequirementsNew.tsx`
- `src/Demo/MyCourses/CourseAnalysisV2.tsx`
- `src/Demo/Program/SingleProgramView.tsx`
- `src/Demo/StudentApplications/StudentApplicationsTableTemplate.tsx`
- `src/Demo/Program/ProgramsTable.tsx`
- `src/Demo/BaseDocuments/BaseDocumentsTable.tsx`
- `src/Demo/Program/SchoolConfigContent.tsx`

Shared types: `src/api/types.ts` (Application, AuthUserData, etc.). Optional: narrow `[key: string]: unknown` in api/types to explicit fields where possible.
