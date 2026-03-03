# TypeScript Fix Tracker — TaiGerPortalStaticWebsite

**Date:** 2026-03-01
**Initial:** 4,267 errors from `npx tsc --noEmit -p tsconfig.app.json`
**Current:** 3,363 errors (after Phase 3B — typed ~40 files)
**Full output:** `tsc-errors.txt`
**Refactoring plan:** `TSC_REFACTOR_PLAN.md`

---

## Error Breakdown by Code

| Code | Count | Prev | Δ | Description | Category |
|------|-------|------|---|-------------|----------|
| TS2345 | 875 | 824 | +51 | Argument type not assignable | Type mismatch |
| TS2339 | 700 | 779 | -79 | Property does not exist on type | Interface mismatch |
| TS2322 | 418 | 370 | +48 | Type not assignable | Type mismatch |
| TS18048 | 294 | 246 | +48 | Possibly undefined | Null safety |
| TS7006 | 218 | 703 | **-485** | Parameter implicitly has 'any' type | Untyped params |
| TS2769 | 156 | 140 | +16 | No overload matches | Overload mismatch |
| TS18047 | 145 | 145 | 0 | Possibly null | Null safety |
| TS7053 | 128 | 139 | -11 | Index signature issue | Index types |
| TS18046 | 77 | 104 | -27 | Type is unknown | Unknown narrowing |
| TS7031 | 69 | 305 | **-236** | Binding element implicitly has 'any' type | Untyped props |
| TS6133 | 60 | 74 | -14 | Declared but never read | Unused |
| TS2741 | 26 | 31 | -5 | Missing required property | Interface mismatch |
| TS2551 | 19 | 19 | 0 | Property name typo | Misc |
| TS7016 | 14 | 14 | 0 | Missing type declarations | Missing @types |
| TS2559 | 14 | 14 | 0 | No common properties | Type mismatch |
| TS2353 | 14 | 14 | 0 | Object literal excess props | Type mismatch |
| Others | ~135 | ~142 | -7 | Various | Misc |

**Note:** TS2345/TS2322/TS18048 increases are expected — adding proper types surfaces previously-hidden mismatches that were masked by `any`.

---

## Error Categories Summary

| Category | Errors | % | Prev | Fix Strategy |
|----------|--------|---|------|-------------|
| Type mismatch (TS2345, TS2322, TS2769, TS2559, TS2353) | ~1,477 | 44% | 1,362 | Fix at call sites, update function signatures |
| Interface mismatch (TS2339, TS2741, TS2739) | ~733 | 22% | 820 | taiger-model populated types |
| Null safety (TS18048, TS18047, TS18046) | ~516 | 15% | 495 | Optional chaining, null checks |
| Untyped params/props (TS7006, TS7031, TS7034, TS7005) | **307** | 9% | **1,032** | Add type annotations (**70% done**) |
| Index types (TS7053, TS2538) | ~138 | 4% | 149 | Add index signatures |
| Unused/misc (TS6133, TS2551, TS7016, etc.) | ~192 | 6% | 205 | Remove unused, fix typos |

---

## Files by Error Count (Top 50)

| # | File | Errors | Status |
|---|------|--------|--------|
| 1 | src/pages/Utils/util_functions.ts | 159 | 🔧 Phase 3B done (was 255) |
| 2 | src/pages/CVMLRLCenter/.../DocModificationThreadPage.tsx | 101 | ⬜ Pending |
| 3 | src/pages/Survey/SurveyEditableComponent.tsx | 89 | ⬜ Pending |
| 4 | src/pages/Program/SingleProgramView.tsx | 85 | 🔧 Phase 3B done (was 96) |
| 5 | src/utils/contants.tsx | 79 | ⬜ Pending |
| 6 | src/pages/Program/NewProgramEdit.tsx | 79 | ⬜ Pending |
| 7 | src/pages/InterviewTraining/SingleInterview.tsx | 76 | 🔧 Phase 3B done (was 112) |
| 8 | src/pages/PortalCredentialPage/PortalCredentialsCard.tsx | 75 | ⬜ Pending |
| 9 | src/pages/Utils/util_functions.test.ts | 64 | ⬜ Pending |
| 10 | src/pages/StudentApplications/StudentApplicationsTableTemplate.tsx | 60 | ⬜ Pending |
| 11 | src/pages/MyCourses/index.tsx | 56 | ⬜ Pending |
| 12 | src/pages/Dashboard/ManagerDashboard/ManagerMainView.tsx | 49 | ⬜ Pending |
| 13 | src/pages/Program/ProgramsOverviewPage.tsx | 46 | 🔧 Phase 3B done (was 55) |
| 14 | src/pages/CRM/LeadPage.tsx | 42 | 🔧 Phase 3B done (was 56) |
| 15 | src/pages/InterviewTraining/AddInterview.tsx | 40 | ⬜ Pending |
| 16 | src/pages/CourseAnalysis/.../ProgramRequirementsNew.tsx | 40 | ⬜ Pending |
| 17 | src/pages/InterviewTraining/InterviewSurveyForm.tsx | 38 | ⬜ Pending |
| 18 | src/pages/OfficeHours/taiger_index.tsx | 37 | 🔧 Phase 3B done (was 47) |
| 19 | src/pages/CVMLRLCenter/.../DocModificationThreadInput.tsx | 37 | 🔧 Phase 3B done (was 46) |
| 20 | src/components/StudentOverviewTable/index.tsx | 37 | ⬜ Pending |
| 21 | src/pages/Dashboard/AgentDashboard/AgentMainView.tsx | 36 | ⬜ Pending |
| 22 | src/pages/MyCourses/CourseAnalysisV2.tsx | 34 | 🔧 Phase 3B done (was 102) |
| 23 | src/pages/Communications/Message.tsx | 33 | ⬜ Pending |
| 24 | src/pages/Communications/CommunicationThreadEditor.tsx | 33 | ⬜ Pending |
| 25 | src/pages/BaseDocuments/BaseDocumentStudentView.tsx | 33 | ⬜ Pending |
| 26 | src/pages/OfficeHours/all_index.tsx | 31 | 🔧 Phase 3B done (was 31) |
| 27 | src/pages/CustomerSupport/CustomerTicketDetailPageBody.tsx | 31 | ⬜ Pending |
| 28 | src/pages/BaseDocuments/MyDocumentCard.tsx | 31 | 🔧 Phase 3B done (was 50) |
| 29 | src/pages/StudentDatabase/SingleStudentPage.tsx | 30 | 🔧 Phase 3A done (was 46) |
| 30 | src/pages/OfficeHours/index.tsx | 30 | 🔧 Phase 3B done (was 46) |
| 31 | src/pages/MyCourses/CourseWidgetBody.tsx | 29 | ⬜ Pending |
| 32 | src/pages/Program/ProgramReport.tsx | 28 | ⬜ Pending |
| 33 | src/pages/CVMLRLCenter/index.tsx | 27 | 🔧 Phase 3B done (was 35) |
| 34 | src/pages/Program/SchoolDistributionPage.tsx | 26 | ⬜ Pending |
| 35 | src/pages/InterviewTraining/index.tsx | 26 | 🔧 Phase 3A done (was 32) |
| 36 | src/pages/EssayDashboard/EssayOverview.tsx | 25 | 🔧 Phase 3B done (was 39) |
| 37 | src/pages/Dashboard/StudentDashboard/StudentDashboard.tsx | 25 | ⬜ Pending |
| 38 | src/pages/Audit/index.tsx | 25 | ⬜ Pending |
| 39 | src/pages/Documentation/SingleInternalDoc.tsx | 24 | ⬜ Pending |
| 40 | src/pages/Documentation/SingleDoc.tsx | 24 | ⬜ Pending |
| 41 | src/pages/CVMLRLCenter/ManualFiles.tsx | 24 | ⬜ Pending |
| 42 | src/pages/CVMLRLCenter/CVMLRLOverview.tsx | 22 | 🔧 Phase 3B done (was 41) |
| 43 | src/pages/StudentDatabase/MeetingTab.tsx | 21 | ⬜ Pending |
| 44 | src/pages/Documentation/index.tsx | 21 | ⬜ Pending |
| 45 | src/pages/CourseAnalysis/.../CourseKeywordsOverview.tsx | 21 | 🔧 Phase 3B done (was 38) |
| 46 | src/pages/CRM/DealDashboard.tsx | 21 | 🔧 Phase 3B done (was 33) |
| 47 | src/pages/Users/UsersList.tsx | 20 | 🔧 Phase 3B done (was 32) |
| 48 | src/pages/UniAssist/UniAssistProgramBlock.tsx | 20 | ⬜ Pending |
| 49 | src/pages/Documentation/InternalDocCreatePage.tsx | 20 | ⬜ Pending |
| 50 | src/pages/Documentation/DocCreatePage.tsx | 20 | ⬜ Pending |

---

## Phase 3B Files Fixed This Session (~40 files)

### Batch 1 (high-error files)
- **CourseAnalysisV2.tsx**: 102→34 (-68). Added `CategorySummaryRow`, `ScoreEntry`, `ProgramSheet`, `ProgramSheetEntry` interfaces. Typed all component props, helpers, DataGrid callbacks.
- **ResponseTimeDashboardTab.tsx**: 62→0 (-62). Added 11 interfaces for interval/chart data. Typed all utility functions, component props, bar chart callbacks.
- **CommunicationExpandPage.tsx**: 45→10 (-35). Added `StudentDetailModalProps`, `AgentsEditorsModalProps`, `DateProps`, `TopBarProps`. Typed event handlers and state.
- **DocumentCommunicatiomExpandPage.tsx**: 39→14 (-25). Added `StudentMetricItem`, `StudentsListProps`, `ThreadsListProps`. Typed all filter/sort/map callbacks.
- **GenericCard.tsx**: 28→0 (-28). Added `SelectOption`, `FieldConfig`, `SectionConfig`, `CardConfig`, `ViewFieldProps`, `EditFieldProps`, `GenericCardContentProps`.
- **LeadDashboard.tsx**: 24→0 (-24). Added MRT column defs. Typed all color functions and callbacks.
- **MeetingDashboard.tsx**: 19→0 (-19). Typed mutation handlers, lead selection, and MRT columns.
- **DealDashboard.tsx**: 17→21 (+4, surfaced hidden issues). Typed currency formatter, status menu, MRT columns.

### Batch 2
- **SingleInterview.tsx**: 112→76 (-36). Typed mutation destructured params, event handlers, file input.
- **InformationBlock.tsx**: 23→3 (-20). Added `InformationBlockProps`. Typed all binding elements.
- **MyDocumentCard.tsx**: 50→31 (-19). Added `SingleDocumentCardProps`, `MyDocumentCardProps`.
- **ProgramCompare.tsx**: 27→7 (-20). Added `DiffRowProps`, `DiffTableContentProps`, `ProgramCompareProps`.
- **ProgramsOverviewPage.tsx**: 55→46 (-9). Cast API data with `ProgramsOverviewData`.

### Batch 3
- **util_functions.ts**: 171→159 (-12). Typed `prepGeneralTaskV2`, `prepApplicationTaskV2`, `open_tasks_with_editors`, `extractTextFromDocx`, `readDOCX`, `readXLSX`, etc.
- **LeadPage.tsx**: 56→42 (-14). Typed edit/save/cancel handlers, deal callbacks.
- **OfficeHours/index.tsx**: 46→30 (-16). Added `OfficeHoursAgent`, `OfficeHoursEvent`, `BookedEvent` interfaces.
- **DealModal.tsx**: 67→52 (-15). Added `DealRecord`, `DealFormValues`, `DealModalProps`.
- **DocModificationThreadInput.tsx**: 46→37 (-9). Added `ProgressButtonProps`, `SurveyFormProps`, `InputGeneratorProps`.
- **CVMLRLOverview.tsx**: 41→22 (-19). Added `TaskAttribute`, `FilterRow`. Typed DataGrid callbacks.

### Batch 4
- **TaiGerOrg/InternalDashboard/index.tsx**: 34→19 (-15). Added `FinishedDoc` interface. Typed filter/map/reduce callbacks.
- **StudentsTable.tsx**: 15→0 (-15). Added `StudentsTableProps`. Typed export and archive handlers.
- **SingleProgramView.tsx**: 96→85 (-11). Typed tab handlers, `convertToText`, student casts.
- **UsersList.tsx**: 32→20 (-12). Typed modal/delete/archiv/assign handlers.
- **OverviewDashboardTab.tsx**: 13→0 (-13). Added `EditorDataItem`, `OverviewDashboardTabProps`. Typed chart helpers.
- **StudentDatabaseOverview.tsx**: 13→0 (-13). Added `OverviewMetricItem`, `StudentDatabaseOverviewData`.

### Batch 5
- **CourseKeywordsOverview.tsx**: 38→21 (-17). Typed keyword add/delete handlers, category click, save.
- **CVMLRLCenter/index.tsx**: 35→27 (-8). Typed favorite toggle, task filters, API callbacks.
- **GeneralRLRequirementsTab.tsx**: 12→0 (-12). Added `RLRow`. Typed style factories, sort/normalize helpers.
- **MeetingPage.tsx**: 12→0 (-12). Typed update handler, assign click, lead select, format functions.
- **OfficeHours/taiger_index.tsx**: 47→37 (-10). Added `CalendarEvent`. Typed event filters.
- **DocumentCheckingResultModal.tsx**: 10→0 (-10). Added `DocumentCheckingResultModalProps`.
- **AdmissionTable.tsx**: 10→0 (-10). Added `AdmissionTableProps`. Typed DataGrid renderCell callbacks.

### Batch 6
- **EssayDashboard/EssayOverview.tsx**: 39→25 (-14). Typed tab handler, filter function, cell casts.
- **ProgramRequirementsOverview.tsx**: 9→0 (-9). Added `ProgramRequirementItem`, `ProgramRequirementsOverviewProps`.
- **AgentSupportDocuments/index.tsx**: 25→16 (-9). Added `AgentSupportDocumentsState`. Typed API callbacks.
- **ConfirmationModal.tsx**: 9→0 (-9). Added `children` to existing props interface.
- **StudentBriefOverview.tsx**: 8→0 (-8). Added `TaiGerUsersAvartarProps`, `StudentBriefOverviewProps`.
- **CourseKeywordsNew.tsx**: 8→0 (-8). Typed keyword state generics and handlers.
- **DeleteCourseDialog.tsx**: 8→0 (-8). Added `CourseItem`, `DeleteCourseDialogProps`.
- **CRM/index.tsx**: 8→0 (-8). Typed chart data functions, formatDays, percentileLine.
- **AcceptedFilePreviewModal.tsx**: 8→0 (-8). Added `AcceptProfileFileModelProps`.
- **Admissions/Overview.tsx**: 8→0 (-8). Added `ResultsBreakdownProps`. Typed view change handlers.

---

## Pending Actions (Next Session)

1. **Phase 3B remaining**: ~287 TS7006/TS7031 errors remain across ~60 smaller files (7 or fewer errors each).
2. **Phase 3C**: Fix null safety errors (TS18048/TS18047/TS18046 — ~516 errors).
3. **Phase 3D**: Fix remaining type mismatches (TS2345/TS2322 — ~1,293 errors).
4. **Phase 3E**: Fix interface mismatches (TS2339 — 700 errors).

---

## Progress Log

| Date | Action | Errors Before | Errors After |
|------|--------|---------------|--------------|
| 2026-03-01 | Initial audit | — | 4,267 |
| 2026-03-03 | taiger-model Phase 2A-2H | 4,267 | 4,189 |
| 2026-03-03 | Frontend Phase 3A: IApplicationWithId→IApplicationPopulated, Application type, DocumentThread types | 4,189 | 4,063 |
| 2026-03-03 | Phase 3B: Typed ~40 files — TS7006 703→218 (-485), TS7031 305→69 (-236) | 4,063 | 3,363 |
