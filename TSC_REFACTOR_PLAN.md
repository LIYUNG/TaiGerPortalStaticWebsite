# Plan: TypeScript Error Audit + taiger-model Interface Refactoring

## Context

`npx tsc --noEmit -p tsconfig.app.json` on TaiGerPortalStaticWebsite reports **4,270 errors** across ~120 source files. The root cause is a mismatch between how `@taiger-common/model` defines interfaces (raw Mongoose schema types with `T | Schema.Types.ObjectId | string` unions, no `_id`) and how the frontend consumes them (always populated, always has `_id`). This causes cascading TS2339/TS2345 errors everywhere.

**Goal:** Refactor `taiger-model` to cleanly separate "model layer" (Mongoose/backend) from "API layer" (populated, serialized, frontend-friendly) types, then migrate the frontend to use the correct types — eliminating the majority of the 4,270 errors at their source.

---

## Part 1: Save Artifacts to Frontend Package ✅ DONE

1. ✅ Save this plan as `TSC_REFACTOR_PLAN.md` in TaiGerPortalStaticWebsite root
2. ✅ Run `npx tsc --noEmit -p tsconfig.app.json` and save src/ errors to `tsc-errors.txt`
3. ✅ Create `TSC_FIX_TRACKER.md` with error breakdown summary (by code, by file, by category)

---

## Part 2: taiger-model Refactoring ✅ DONE (4,267 → 4,189 errors, -78)

### Phase 2A: Add Role-Specific Serialized Types ✅

**File:** `taiger-model/src/api/serialized.ts`

Add `IAgentWithId` and `IEditorWithId` that include role-specific fields:

```ts
/** Agent with string _id and agent-specific fields */
export interface IAgentWithId extends Omit<IAgent, 'agents' | 'editors' | 'profile'> {
  _id: string;
}

/** Editor with string _id and editor-specific fields */
export interface IEditorWithId extends Omit<IEditor, 'agents' | 'editors' | 'profile'> {
  _id: string;
}
```

This gives the frontend access to `timezone`, `officehours`, `attribute`, `agent_notification`/`editor_notification` on agents/editors — fields currently lost because `IUserWithId` omits them (it extends `IStudent`, not `IAgent`/`IEditor`).

### Phase 2B: Fix `IStudentResponse` — Add `_id` ✅

**File:** `taiger-model/src/api/serialized.ts`

```ts
export interface IStudentResponse extends IStudent {
  _id: string;  // <-- ADD: API always returns _id
  applying_program_count?: number;
  applications?: IApplicationPopulated[];
  agents?: IAgentWithId[];    // <-- CHANGE from IUserWithId[]
  editors?: IEditorWithId[];  // <-- CHANGE from IUserWithId[]
  generaldocs_threads?: IUserGeneraldocsThread[];
}
```

**Impact:** Fixes ~50+ TS2339 errors where `student._id` is accessed on `IStudentResponse`.

### Phase 2C: Create Populated Application Type ✅

**File:** `taiger-model/src/api/serialized.ts`

The raw `IApplication` has `programId?: IProgram | ObjectId | string` and `studentId?: IStudent | ObjectId | string`. The API always populates these. Create a populated variant:

```ts
/** Application as returned by API — refs are populated, _id is string */
export interface IApplicationPopulated extends Omit<
  IApplication,
  'programId' | 'studentId'
> {
  _id: string;
  programId?: IProgramWithId;
  studentId?: IStudentResponse;  // or a lighter type if needed
}
```

Then update `IStudentResponse`:
```ts
applications?: IApplicationPopulated[];  // instead of IApplicationWithId[]
```

**Impact:** Eliminates ~200+ TS2339 errors where `application.programId.school`, `application.programId._id`, `application.studentId._id`, etc. are accessed.

### Phase 2D: Create Populated DocumentThread Type ✅

**File:** `taiger-model/src/api/serialized.ts`

```ts
/** Document thread as returned by API — refs are populated */
export interface IDocumentthreadPopulated extends Omit<
  IDocumentthread,
  'student_id' | 'program_id' | 'application_id' | 'outsourced_user_id' | 'pin_by_user_id' | 'flag_by_user_id' | 'essayConsultantIds'
> {
  _id: string;
  student_id: IStudentResponse | string;
  program_id?: IProgramWithId | string;
  application_id?: IApplicationPopulated | string;
  outsourced_user_id?: IUserWithId[];
  pin_by_user_id?: IUserWithId[];
  flag_by_user_id?: IUserWithId[];
  essayConsultantIds?: IUserWithId[];
}
```

### Phase 2E: Add Missing Fields to `IApplication` ✅

**File:** `taiger-model/src/model/Application.ts`

Add fields that exist in the database but are missing from the interface:

```ts
export interface IApplication {
  // ... existing fields ...
  credential_a_filled?: boolean;   // ADD
  credential_b_filled?: boolean;   // ADD
}
```

**Impact:** Fixes ~10 TS2339 errors in `util_functions.ts`.

### Phase 2F: Add `timezone` to `IUser` base ✅

Added `timezone?: string` to `IUser` in `User.ts`. This makes it available on all user types (`IUserWithId`, `IAgentWithId`, `IEditorWithId`, `IStudentResponse`) without casts. The frontend auth context user (`IUserWithId`) can now access `user.timezone` directly.

### Phase 2G: Update API Response Types ✅

Update response types in `taiger-model/src/api/` files to use the new populated types:

| File | Change |
|------|--------|
| `students.ts` | Already uses `IStudentResponse` — no change needed (benefits from 2B) |
| `applications.ts` | Change `IApplicationWithId` to `IApplicationPopulated` in populated response types |
| `documentThreads.ts` | Change `IDocumentthreadWithId` to `IDocumentthreadPopulated` in GET responses |

**Keep `IApplicationWithId` and `IDocumentthreadWithId`** for endpoints that return unpopulated data (e.g., after a create/update that returns just the raw document).

### Phase 2H: Build and Publish ✅

1. `npm run build` passes (CJS, ESM, UMD, types all compile cleanly)
2. Version bump and publish — pending user action
3. Frontend picks up changes via local workspace link

---

## Part 3: Frontend Migration (TaiGerPortalStaticWebsite) ⬜ NEXT

### Phase 3A: Clean Up `src/api/types.ts`

With taiger-model providing proper populated types, many frontend-only types become redundant:

| Frontend Type | Replace With | Notes |
|---------------|-------------|-------|
| `Application` | `IApplicationPopulated` | Remove `Omit` workaround; keep any truly frontend-only fields (interview_id, interview_status) as extension |
| `StudentResponseFull` | `IStudentResponse` | Now has `_id`; remove `[key: string]: unknown` escape hatch |
| `DocumentThreadResponse` | `IDocumentthreadPopulated` + frontend fields | Fix `string & IStudentResponse` bug (should be `string \| IStudentResponse`) |
| `AgentResponse` | `IAgentWithId` | Already has all fields |
| `InterviewResponse` | Keep or align with `IInterviewWithId` populated variant |

### Phase 3B: Fix Untyped Parameters (TS7006/TS7031 — ~1,011 errors)

These are files with `noImplicitAny` violations — functions and component props without type annotations. Top files:

| File | Errors | Fix |
|------|--------|-----|
| `src/pages/Utils/util_functions.ts` | 255 | Type function params using new populated types |
| `src/pages/InterviewTraining/SingleInterview.tsx` | 112 | Define prop interfaces for sub-components |
| `src/pages/MyCourses/CourseAnalysisV2.tsx` | 102 | Define prop interfaces and callback types |
| `src/pages/Program/SingleProgramView.tsx` | 96 | Define prop interfaces |
| `src/pages/Survey/SurveyEditableComponent.tsx` | 89 | Define prop interfaces |
| `src/pages/CVMLRLCenter/.../DocModificationThreadPage.tsx` | 87 | Type params with populated thread types |
| `src/utils/contants.tsx` | 79 | Type function params |
| `src/pages/Program/NewProgramEdit.tsx` | 79 | Define prop interfaces |
| `src/pages/PortalCredentialPage/PortalCredentialsCard.tsx` | 75 | Define prop interfaces |
| `src/pages/CRM/components/DealModal.tsx` | 67 | Type CRM-related params |

**Approach:** For each file, define a `Props` interface using the new taiger-model types. Many of these are component files that just need `{ student: IStudentResponse }` or `{ application: IApplicationPopulated }` etc.

### Phase 3C: Fix Null Safety Errors (TS18047/TS18048 — ~398 errors)

These are "possibly null" / "possibly undefined" errors. Most resolve naturally once proper types are used (e.g., `IApplicationPopulated.programId` is `IProgramWithId | undefined` instead of `IProgram | ObjectId | string | undefined`). Remaining ones need optional chaining or null checks.

### Phase 3D: Fix Remaining Type Mismatches

- TS2339 (property doesn't exist): Most resolved by using populated types
- TS2345 (argument type mismatch): Most resolved by consistent type usage
- TS2322 (type not assignable): Fix at assignment sites
- TS7053 (index signature): Add proper index types or use `Record<string, T>`
- TS6133 (unused): Remove unused imports/variables

---

## Execution Order (Recommended)

```
1. Save tsc-errors.txt + TSC_FIX_TRACKER.md          (Part 1)
2. taiger-model: Add IAgentWithId, IEditorWithId      (Phase 2A)
3. taiger-model: Fix IStudentResponse (add _id)       (Phase 2B)
4. taiger-model: Add IApplicationPopulated             (Phase 2C)
5. taiger-model: Add IDocumentthreadPopulated          (Phase 2D)
6. taiger-model: Add missing IApplication fields       (Phase 2E)
7. taiger-model: Decide on IUserWithId timezone        (Phase 2F)
8. taiger-model: Update API response types             (Phase 2G)
9. taiger-model: Publish new version                   (Phase 2H)
10. Frontend: Clean up src/api/types.ts                (Phase 3A)
11. Frontend: Type untyped params (biggest files first)(Phase 3B)
12. Frontend: Fix null safety                          (Phase 3C)
13. Frontend: Fix remaining mismatches                 (Phase 3D)
```

---

## Key Files to Modify

### taiger-model
- `src/api/serialized.ts` — Main file: add IAgentWithId, IEditorWithId, IApplicationPopulated, IDocumentthreadPopulated; fix IStudentResponse
- `src/model/Application.ts` — Add credential_a_filled, credential_b_filled
- `src/model/User.ts` — Possibly add timezone to IUser (if needed generically)
- `src/api/applications.ts` — Update response types to use IApplicationPopulated
- `src/api/documentThreads.ts` — Update response types to use IDocumentthreadPopulated
- `package.json` — Version bump

### TaiGerPortalStaticWebsite
- `src/api/types.ts` — Simplify using new taiger-model types
- `src/pages/Utils/util_functions.ts` (255 errors) — Type all function params
- `src/pages/InterviewTraining/SingleInterview.tsx` (112 errors) — Add prop types
- `src/pages/MyCourses/CourseAnalysisV2.tsx` (102 errors) — Add prop types
- ~115 more files with decreasing error counts

---

## Verification

1. After taiger-model changes: `cd taiger-model && npm run build` — should compile cleanly
2. After frontend migration: `cd TaiGerPortalStaticWebsite && npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep "): error" | wc -l` — track error count reduction
3. Run `npm run test` on both packages
4. Run `npm run build` on frontend to verify Vite build still works

---

## Error Reduction Estimate

| Phase | Estimated Errors Fixed |
|-------|----------------------|
| 2B (IStudentResponse._id) | ~50-80 |
| 2C (IApplicationPopulated) | ~200-300 |
| 2D (IDocumentthreadPopulated) | ~50-100 |
| 2E (credential_a/b_filled) | ~10-20 |
| 3A (frontend types cleanup) | ~50-100 |
| 3B (type untyped params) | ~1,000+ |
| 3C+3D (null safety + remaining) | ~500+ |
| **Total estimated** | **~2,000-3,000 of 4,270** |

Remaining errors after all phases would primarily be in complex component interactions, third-party library typing issues, and edge cases requiring manual review.

---

## Appendix: Current Error Breakdown

### By Error Code (Top 15)

| Code | Count | Description |
|------|-------|-------------|
| TS2339 | 956 | Property does not exist on type |
| TS2345 | 840 | Argument type not assignable |
| TS7006 | 706 | Parameter implicitly has 'any' type |
| TS2322 | 368 | Type not assignable |
| TS7031 | 305 | Binding element implicitly has 'any' type |
| TS18048 | 253 | Possibly undefined |
| TS18047 | 145 | Possibly null |
| TS2769 | 144 | No overload matches |
| TS7053 | 140 | Index signature issue |
| TS18046 | 104 | Type is unknown |
| TS6133 | 74 | Declared but never read |
| TS2741 | 28 | Missing required property |
| TS2559 | 19 | No common properties |
| TS2551 | 19 | Property name typo |
| TS7016 | 14 | Missing type declarations |

### By File (Top 40)

| File | Errors |
|------|--------|
| src/pages/Utils/util_functions.ts | 255 |
| src/pages/InterviewTraining/SingleInterview.tsx | 112 |
| src/pages/MyCourses/CourseAnalysisV2.tsx | 102 |
| src/pages/Program/SingleProgramView.tsx | 96 |
| src/pages/Survey/SurveyEditableComponent.tsx | 89 |
| src/pages/CVMLRLCenter/.../DocModificationThreadPage.tsx | 87 |
| src/utils/contants.tsx | 79 |
| src/pages/Program/NewProgramEdit.tsx | 79 |
| src/pages/PortalCredentialPage/PortalCredentialsCard.tsx | 75 |
| src/pages/CRM/components/DealModal.tsx | 67 |
| src/pages/TaiGerOrg/InternalDashboard/ResponseTimeDashboardTab.tsx | 62 |
| src/pages/StudentApplications/StudentApplicationsTableTemplate.tsx | 60 |
| src/pages/OfficeHours/taiger_index.tsx | 57 |
| src/pages/MyCourses/index.tsx | 56 |
| src/pages/CRM/LeadPage.tsx | 56 |
| src/pages/Program/ProgramsOverviewPage.tsx | 55 |
| src/pages/Utils/util_functions.test.ts | 53 |
| src/pages/BaseDocuments/MyDocumentCard.tsx | 50 |
| src/pages/Dashboard/ManagerDashboard/ManagerMainView.tsx | 49 |
| src/pages/StudentDatabase/SingleStudentPage.tsx | 46 |
| src/pages/OfficeHours/index.tsx | 46 |
| src/pages/CVMLRLCenter/.../DocModificationThreadInput.tsx | 46 |
| src/pages/Communications/CommunicationExpandPage.tsx | 45 |
| src/pages/CVMLRLCenter/CVMLRLOverview.tsx | 41 |
| src/components/StudentOverviewTable/index.tsx | 41 |
| src/pages/InterviewTraining/AddInterview.tsx | 40 |
| src/pages/Dashboard/AgentDashboard/AgentMainView.tsx | 40 |
| src/pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNew.tsx | 40 |
| src/pages/InterviewTraining/InterviewSurveyForm.tsx | 39 |
| src/pages/EssayDashboard/EssayOverview.tsx | 39 |
| src/pages/CVMLRLCenter/.../DocumentCommunicatiomExpandPage.tsx | 39 |
| src/pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsOverview.tsx | 38 |
| src/pages/CVMLRLCenter/index.tsx | 35 |
| src/pages/UniAssist/UniAssistProgramBlock.tsx | 34 |
| src/pages/TaiGerOrg/InternalDashboard/index.tsx | 34 |
| src/pages/Communications/Message.tsx | 33 |
| src/pages/Communications/CommunicationThreadEditor.tsx | 33 |
| src/pages/CRM/MeetingDashboard.tsx | 33 |
| src/pages/CRM/DealDashboard.tsx | 33 |
| src/pages/Users/UsersList.tsx | 32 |

### Root Cause Cascade

```
IStudentResponse (missing _id)
  └─> util_functions.ts: student._id.toString()           [TS2339 x~30]
  └─> useStudents.ts: findIndex({ _id })                  [TS2339 x~10]
  └─> StudentsAgentEditor.tsx: student._id                 [TS2339]

IApplication.programId typed as union (IProgram | ObjectId | string)
  └─> util_functions.ts: programId._id, programId.school  [TS2339 x~20]
  └─> ApplicationProgressCardBody.tsx: programId.school    [TS2339]

IApplication.studentId typed as union (IStudent | ObjectId | string)
  └─> util_functions.ts: studentId._id, studentId.firstname [TS2339 x~10]

IApplication missing credential_a_filled / credential_b_filled
  └─> util_functions.ts: application.credential_a_filled   [TS2339 x2]

IUserWithId missing applications field (omits agents/editors but not inherited)
  └─> util_functions.ts: student.applications              [TS2339 x~5]

Untyped component parameters (noImplicitAny)
  └─> SingleInterview.tsx: ~100 parameters                 [TS7006/TS7031]
  └─> CourseAnalysisV2.tsx: ~100 parameters                [TS7006/TS7031]
  └─> SurveyEditableComponent.tsx: ~89 parameters          [TS7006/TS7031]
```
