# TypeScript Fix Tracker — TaiGerPortalStaticWebsite

**Date:** 2026-03-01
**Initial:** 4,267 errors from `npx tsc --noEmit -p tsconfig.app.json`
**Current:** 4,189 errors (after taiger-model Phase 2A-2H refactoring)
**Full output:** `tsc-errors.txt`
**Refactoring plan:** `TSC_REFACTOR_PLAN.md`

---

## Error Breakdown by Code

| Code | Count | Description | Category |
|------|-------|-------------|----------|
| TS2339 | 956 | Property does not exist on type | Interface mismatch |
| TS2345 | 840 | Argument type not assignable | Type mismatch |
| TS7006 | 706 | Parameter implicitly has 'any' type | Untyped params |
| TS2322 | 368 | Type not assignable | Type mismatch |
| TS7031 | 305 | Binding element implicitly has 'any' type | Untyped props |
| TS18048 | 253 | Possibly undefined | Null safety |
| TS18047 | 145 | Possibly null | Null safety |
| TS2769 | 144 | No overload matches | Overload mismatch |
| TS7053 | 140 | Index signature issue | Index types |
| TS18046 | 104 | Type is unknown | Unknown narrowing |
| TS6133 | 74 | Declared but never read | Unused |
| TS2741 | 28 | Missing required property | Interface mismatch |
| TS2559 | 19 | No common properties | Type mismatch |
| TS2551 | 19 | Property name typo | Misc |
| TS7016 | 14 | Missing type declarations | Missing @types |
| TS2353 | 14 | Object literal excess props | Type mismatch |
| TS7034 | 12 | Variable implicitly has type | Untyped |
| TS7005 | 12 | Variable implicitly has 'any' type | Untyped |
| TS2739 | 10 | Missing properties in type | Interface mismatch |
| TS2554 | 10 | Wrong number of arguments | Misc |
| TS2538 | 10 | Type cannot be used as index | Index types |
| Others | ~88 | Various | Misc |

---

## Error Categories Summary

| Category | Errors | % | Fix Strategy |
|----------|--------|---|-------------|
| Interface mismatch (TS2339, TS2741, TS2739) | ~994 | 23% | taiger-model refactor (populated types) |
| Type mismatch (TS2345, TS2322, TS2769, TS2559, TS2353) | ~1,385 | 32% | Consistent type usage after model refactor |
| Untyped params/props (TS7006, TS7031, TS7034, TS7005) | ~1,035 | 24% | Add type annotations to function params and component props |
| Null safety (TS18048, TS18047, TS18046) | ~502 | 12% | Optional chaining, null checks, narrowing |
| Index types (TS7053, TS2538) | ~150 | 4% | Add index signatures, use Record<string, T> |
| Unused/misc (TS6133, TS2551, TS7016, etc.) | ~201 | 5% | Remove unused, fix typos, add @types |

---

## Files by Error Count

| # | File | Errors | Status |
|---|------|--------|--------|
| 1 | src/pages/Utils/util_functions.ts | 255 | ⬜ Pending |
| 2 | src/pages/InterviewTraining/SingleInterview.tsx | 112 | ⬜ Pending |
| 3 | src/pages/MyCourses/CourseAnalysisV2.tsx | 102 | ⬜ Pending |
| 4 | src/pages/Program/SingleProgramView.tsx | 96 | ⬜ Pending |
| 5 | src/pages/Survey/SurveyEditableComponent.tsx | 89 | ⬜ Pending |
| 6 | src/pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadPage.tsx | 87 | ⬜ Pending |
| 7 | src/utils/contants.tsx | 79 | ⬜ Pending |
| 8 | src/pages/Program/NewProgramEdit.tsx | 79 | ⬜ Pending |
| 9 | src/pages/PortalCredentialPage/PortalCredentialsCard.tsx | 75 | ⬜ Pending |
| 10 | src/pages/CRM/components/DealModal.tsx | 67 | ⬜ Pending |
| 11 | src/pages/TaiGerOrg/InternalDashboard/ResponseTimeDashboardTab.tsx | 62 | ⬜ Pending |
| 12 | src/pages/StudentApplications/StudentApplicationsTableTemplate.tsx | 60 | ⬜ Pending |
| 13 | src/pages/OfficeHours/taiger_index.tsx | 57 | ⬜ Pending |
| 14 | src/pages/MyCourses/index.tsx | 56 | ⬜ Pending |
| 15 | src/pages/CRM/LeadPage.tsx | 56 | ⬜ Pending |
| 16 | src/pages/Program/ProgramsOverviewPage.tsx | 55 | ⬜ Pending |
| 17 | src/pages/Utils/util_functions.test.ts | 53 | ⬜ Pending |
| 18 | src/pages/BaseDocuments/MyDocumentCard.tsx | 50 | ⬜ Pending |
| 19 | src/pages/Dashboard/ManagerDashboard/ManagerMainView.tsx | 49 | ⬜ Pending |
| 20 | src/pages/StudentDatabase/SingleStudentPage.tsx | 46 | ⬜ Pending |
| 21 | src/pages/OfficeHours/index.tsx | 46 | ⬜ Pending |
| 22 | src/pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadInput.tsx | 46 | ⬜ Pending |
| 23 | src/pages/Communications/CommunicationExpandPage.tsx | 45 | ⬜ Pending |
| 24 | src/pages/CVMLRLCenter/CVMLRLOverview.tsx | 41 | ⬜ Pending |
| 25 | src/components/StudentOverviewTable/index.tsx | 41 | ⬜ Pending |
| 26 | src/pages/InterviewTraining/AddInterview.tsx | 40 | ⬜ Pending |
| 27 | src/pages/Dashboard/AgentDashboard/AgentMainView.tsx | 40 | ⬜ Pending |
| 28 | src/pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNew.tsx | 40 | ⬜ Pending |
| 29 | src/pages/InterviewTraining/InterviewSurveyForm.tsx | 39 | ⬜ Pending |
| 30 | src/pages/EssayDashboard/EssayOverview.tsx | 39 | ⬜ Pending |
| 31 | src/pages/CVMLRLCenter/.../DocumentCommunicatiomExpandPage.tsx | 39 | ⬜ Pending |
| 32 | src/pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsOverview.tsx | 38 | ⬜ Pending |
| 33 | src/pages/CVMLRLCenter/index.tsx | 35 | ⬜ Pending |
| 34 | src/pages/UniAssist/UniAssistProgramBlock.tsx | 34 | ⬜ Pending |
| 35 | src/pages/TaiGerOrg/InternalDashboard/index.tsx | 34 | ⬜ Pending |
| 36 | src/pages/Communications/Message.tsx | 33 | ⬜ Pending |
| 37 | src/pages/Communications/CommunicationThreadEditor.tsx | 33 | ⬜ Pending |
| 38 | src/pages/CRM/MeetingDashboard.tsx | 33 | ⬜ Pending |
| 39 | src/pages/CRM/DealDashboard.tsx | 33 | ⬜ Pending |
| 40 | src/pages/Users/UsersList.tsx | 32 | ⬜ Pending |
| 41 | src/pages/InterviewTraining/index.tsx | 32 | ⬜ Pending |
| 42 | src/pages/BaseDocuments/BaseDocumentStudentView.tsx | 32 | ⬜ Pending |
| 43 | src/pages/OfficeHours/all_index.tsx | 31 | ⬜ Pending |
| 44 | src/pages/CustomerSupport/CustomerTicketDetailPageBody.tsx | 31 | ⬜ Pending |
| 45 | src/pages/CRM/LeadDashboard.tsx | 31 | ⬜ Pending |
| 46 | src/pages/MyCourses/CourseWidgetBody.tsx | 29 | ⬜ Pending |
| 47 | src/pages/Program/ProgramReport.tsx | 28 | ⬜ Pending |
| 48 | src/pages/CRM/components/GenericCard.tsx | 28 | ⬜ Pending |
| 49 | src/pages/Program/ProgramCompare.tsx | 27 | ⬜ Pending |
| 50 | src/pages/Admissions/Overview.tsx | 27 | ⬜ Pending |
| 51-200 | (remaining ~160 files with 1-26 errors each) | ~950 | ⬜ Pending |

---

## Progress Log

| Date | Action | Errors Before | Errors After |
|------|--------|---------------|--------------|
| 2026-03-01 | Initial audit | — | 4,267 |
| 2026-03-03 | taiger-model Phase 2A-2H: IAgentWithId, IEditorWithId, IStudentResponse._id, IApplicationPopulated, IDocumentthreadPopulated, credential_a/b_filled, timezone on IUser, updated API response types | 4,267 | 4,189 |
