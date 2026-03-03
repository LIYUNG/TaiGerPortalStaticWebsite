# TypeScript Fix Tracker — TaiGerPortalStaticWebsite

**Date:** 2026-03-03
**Initial:** 4,267 errors from `npx tsc --noEmit -p tsconfig.app.json`
**Current:** 2,926 errors (from latest `tsc-errors.txt` refresh)
**Full output:** `tsc-errors.txt`
**Refactoring plan:** `TSC_REFACTOR_PLAN.md`

---

## Error Breakdown by Code

| Code | Count | Prev | Δ | Description | Category |
|------|-------|------|---|-------------|----------|
| TS2345 | 757 | 926 | -169 | Argument type not assignable | Type mismatch |
| TS2339 | 679 | 739 | -60 | Property does not exist on type | Interface mismatch |
| TS2322 | 472 | 478 | -6 | Type not assignable | Type mismatch |
| TS18048 | 276 | 338 | -62 | Possibly undefined | Null safety |
| TS2769 | 155 | 166 | -11 | No overload matches | Overload mismatch |
| TS18047 | 148 | 152 | -4 | Possibly null | Null safety |
| TS7053 | 105 | 111 | -6 | Index signature issue | Index types |
| TS18046 | 68 | 73 | -5 | Type is unknown | Unknown narrowing |
| TS6133 | 52 | 56 | -4 | Declared but never read | Unused |
| TS2741 | 24 | 27 | -3 | Missing required property | Interface mismatch |
| TS2551 | 18 | 19 | -1 | Property name typo | Misc |
| TS2353 | 14 | 14 | 0 | Object literal excess props | Type mismatch |
| TS2559 | 14 | 14 | 0 | No common properties | Type mismatch |
| TS7016 | 14 | 14 | 0 | Missing type declarations | Missing @types |
| TS2722 | 13 | — | — | Object may be undefined | Null safety |
| TS7006 | **0** | 0 | 0 | Parameter implicitly has 'any' type | **DONE** |
| TS7031 | **0** | 0 | 0 | Binding element implicitly has 'any' type | **DONE** |
| TS7034 | 10 | 10 | 0 | Variable implicitly has type | Untyped vars |
| TS7005 | 10 | 10 | 0 | Variable implicitly has 'any' type | Untyped vars |
| Others | ~150 | ~121 | +29 | Various (TS2554, TS2538, TS2739, etc.) | Misc |

**Note:** Prev = counts from last tracker update (3,268 total). Current run has 2,926 errors (-342 overall).

---

## Error Categories Summary

| Category | Errors | % | Prev | Fix Strategy |
|----------|--------|---|------|-------------|
| Type mismatch (TS2345, TS2322, TS2769, TS2559, TS2353) | ~1,412 | 48% | ~1,598 | Fix at call sites, update function signatures |
| Interface mismatch (TS2339, TS2741, TS2739) | ~710 | 24% | ~773 | taiger-model populated types, frontend types cleanup |
| Null safety (TS18048, TS18047, TS18046, TS2722) | ~492 | 17% | ~563 | Optional chaining, null checks |
| Untyped params/props (TS7006, TS7031, TS7034, TS7005) | **20** | <1% | 20 | **Phase 3B COMPLETE** |
| Index types (TS7053, TS2538) | ~113 | 4% | ~122 | Add index signatures |
| Unused/misc (TS6133, TS2551, TS7016, etc.) | ~179 | 6% | ~192 | Remove unused, fix typos |

---

## Files by Error Count (Top 50)

*(From latest `tsc-errors.txt` — 2,926 errors total.)*

| # | File | Errors | Status |
|---|------|--------|--------|
| 1 | src/pages/Program/SingleProgramView.tsx | 85 | ⬜ Pending |
| 2 | src/utils/contants.tsx | 79 | ⬜ Pending |
| 3 | src/pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadPage.tsx | 77 | ⬜ Pending |
| 4 | src/pages/PortalCredentialPage/PortalCredentialsCard.tsx | 71 | ⬜ Pending |
| 5 | src/pages/InterviewTraining/SingleInterview.tsx | 71 | ⬜ Pending |
| 6 | src/pages/StudentApplications/StudentApplicationsTableTemplate.tsx | 58 | ⬜ Pending |
| 7 | src/pages/MyCourses/index.tsx | 54 | ⬜ Pending |
| 8 | src/pages/Utils/util_functions.test.ts | 51 | ⬜ Pending |
| 9 | src/pages/CVMLRLCenter/ManualFiles.tsx | 50 | ⬜ Pending |
| 10 | src/pages/Program/ProgramsOverviewPage.tsx | 46 | ⬜ Pending |
| 11 | src/pages/Dashboard/ManagerDashboard/ManagerMainView.tsx | 44 | ⬜ Pending |
| 12 | src/pages/CRM/LeadPage.tsx | 44 | ⬜ Pending |
| 13 | src/pages/InterviewTraining/AddInterview.tsx | 44 | ⬜ Pending |
| 14 | src/pages/InterviewTraining/index.tsx | 43 | ⬜ Pending |
| 15 | src/components/StudentOverviewTable/index.tsx | 40 | ⬜ Pending |
| 16 | src/pages/InterviewTraining/InterviewSurveyForm.tsx | 38 | ⬜ Pending |
| 17 | src/pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadInput.tsx | 37 | ⬜ Pending |
| 18 | src/pages/OfficeHours/taiger_index.tsx | 37 | ⬜ Pending |
| 19 | src/pages/CustomerSupport/CustomerTicketDetailPageBody.tsx | 35 | ⬜ Pending |
| 20 | src/pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNew.tsx | 35 | ⬜ Pending |
| 21 | src/pages/Dashboard/AgentDashboard/AgentMainView.tsx | 34 | ⬜ Pending |
| 22 | src/pages/MyCourses/CourseAnalysisV2.tsx | 34 | ⬜ Pending |
| 23 | src/pages/OfficeHours/all_index.tsx | 32 | ⬜ Pending |
| 24 | src/pages/Communications/CommunicationThreadEditor.tsx | 32 | ⬜ Pending |
| 25 | src/pages/BaseDocuments/MyDocumentCard.tsx | 31 | ⬜ Pending |
| 26 | src/pages/BaseDocuments/BaseDocumentStudentView.tsx | 30 | ⬜ Pending |
| 27 | src/pages/OfficeHours/index.tsx | 28 | ⬜ Pending |
| 28 | src/pages/CVMLRLCenter/index.tsx | 27 | ⬜ Pending |
| 29 | src/pages/Audit/MiniAudit.tsx | 27 | ⬜ Pending |
| 30 | src/pages/MyCourses/CourseWidgetBody.tsx | 26 | ⬜ Pending |
| 31 | src/pages/EssayDashboard/EssayOverview.tsx | 25 | ⬜ Pending |
| 32 | src/pages/Dashboard/StudentDashboard/StudentDashboard.tsx | 25 | ⬜ Pending |
| 33 | src/pages/Documentation/SingleInternalDoc.tsx | 24 | ⬜ Pending |
| 34 | src/pages/Communications/Message.tsx | 24 | ⬜ Pending |
| 35 | src/pages/StudentDatabase/SingleStudentPage.tsx | 24 | ⬜ Pending |
| 36 | src/pages/Audit/index.tsx | 23 | ⬜ Pending |
| 37 | src/pages/Program/SchoolDistributionPage.tsx | 23 | ⬜ Pending |
| 38 | src/pages/Documentation/SingleDoc.tsx | 23 | ⬜ Pending |
| 39 | src/pages/DownloadCenter/DownloadPage.tsx | 22 | ⬜ Pending |
| 40 | src/pages/CVMLRLCenter/CVMLRLOverview.tsx | 22 | ⬜ Pending |
| 41 | src/pages/Program/ProgramReport.tsx | 22 | ⬜ Pending |
| 42 | src/pages/StudentDatabase/MeetingTab.tsx | 21 | ⬜ Pending |
| 43 | src/pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsOverview.tsx | 21 | ⬜ Pending |
| 44 | src/pages/Communications/MessageContainer.tsx | 20 | ⬜ Pending |
| 45 | src/pages/CRM/DealDashboard.tsx | 20 | ⬜ Pending |
| 46 | src/pages/Users/UsersList.tsx | 20 | ⬜ Pending |
| 47 | src/pages/Dashboard/MainViewTab/StudentBriefOverview/StudentBriefOverview.tsx | 20 | ⬜ Pending |
| 48 | src/pages/Documentation/index.tsx | 20 | ⬜ Pending |
| 49 | src/pages/CRM/components/DealModal.tsx | 20 | ⬜ Pending |
| 50 | src/pages/UniAssist/UniAssistProgramBlock.tsx | 19 | ⬜ Pending |

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

## Phase 3B Session 2 — Remaining ~85 files (TS7006/TS7031 → 0)

### 7-9 error files
- **OfficeHours/all_index.tsx**: Typed IEventWithId/IUserWithId across 9 callback params.
- **CourseAnalysisConfirmDialog.tsx**: Added `CourseAnalysisConfirmDialogProps`. Typed 5 binding elements.
- **AddInterview.tsx**: Typed 11 params (AxiosResponse generics, IStudentResponse, IApplicationPopulated, IInterviewWithId).
- **ReadyToSubmitTasksCard.tsx**: Typed IApplicationPopulated/IStudentResponse props and callbacks.
- **NoProgramStudentTable.tsx**: Added `NoProgramStudentTableProps`. Typed filter/some/map callbacks.
- **ManualFiles.tsx**: Added `ManualFilesProps` with 11 typed fields. Typed event handlers.
- **EditableCard.tsx**: Added `EditableCardProps` with 12 typed fields.
- **AssignInterviewTrainersPage.tsx**: Added `AssignInterviewTrainersPageProps`. Typed 7 params.
- **AssignEssayWritersPage.tsx**: Added `AssignEssayWritersPageProps`. Typed 7 params with IDocumentthreadPopulated.

### 5-6 error files
- **ProgramReport.tsx**: Typed ITicketWithId handlers, submitProgramReport/Update params.
- **InterviewFeedback.tsx**: Added `InterviewFeedbackProps`. Typed 6 interview callbacks.
- **SingleDocEdit.tsx**: Added `SingleDocEditProps` with OutputData/handler types.
- **CustomerTicketDetailPageBody.tsx**: Added `CustomerTicketDetailPageBodyProps` with IComplaintWithId.
- **ProgramRequirementsNew.tsx**: Typed handleChangeByField, handleAddProgram, handleDeleteCategory.
- **DocModificationThreadPage.tsx**: Added useState generics, typed 6 handlers and maps.
- **DealItem.tsx**: Added `DealItemProps` with CRMDealItem. Typed onKeyDown.
- **ProgramUpdateStatusTable.tsx**: Added `ProgramUpdateStatusRow`, `ProgramUpdateStatusTableProps`. Typed MRT cells.
- **SingleStudentPage.tsx**: Typed handleChange (SyntheticEvent), updateStudentArchivStatus.
- **SingleInterview.tsx**: Typed 5 remaining params (IUserWithId maps, File forEach).
- **InternalDocCreatePage.tsx**: Typed props, IInternaldocWithId callbacks.
- **DocCreatePage.tsx**: Typed props, IDocumentationWithId callbacks.
- **CommunicationSinglePageBody.tsx**: Added `InformationBlockChatProps`, `CommunicationSinglePageBodyProps`.

### 3-4 error files
- **AgentDashboard.tsx**: Added `AgentDistribution`, `AgentBarChartsProps`, `AgentDashboardProps`.
- **PortalCredentialsCard.tsx**: Added `PortalCredentialsCardProps`. Typed credential handler.
- **MyCourses/index.tsx**: Typed Tabs onChange, DataSheetGrid onChange callbacks.
- **EditInterviewTrainersSubpage.tsx**: Added Props, typed reduce/findIndex/map callbacks.
- **EditEditorsSubpage.tsx**: Added Props, typed reduce/findIndex/map callbacks.
- **EditAgentsSubpage.tsx**: Added Props, typed reduce/findIndex/map callbacks.
- **EditAttributesSubpage.tsx**: Added `AttributeInputSelectionProps`, typed IUserAttribute.
- **NoWritersEssaysCard.tsx**: Typed IUser map callbacks for editors/agents.
- **Message.tsx**: Extended MessageProps with student_id/readBy. Typed handleClick.
- **OriginAuthorStatementBar.tsx**: Added `OriginAuthorStatementBarProps` with Theme/IDocumentthreadPopulated.
- **StatusMenu.tsx**: Added `StatusMenuProps`.
- **BaseDocumentStudentView.tsx**: Typed IBasedocumentationslinkWithId/IUserProfileItem forEach callbacks.
- **MiniAudit.tsx**: Added `MiniAuditProps` with IAudit[].
- **checking-functions.tsx**: Typed 3 fieldMappings check callbacks.
- **KPIDashboardTab.tsx**: Added `KPIDashboardTabProps`.
- **MyStudentsOverview.tsx**: Typed IStudentResponse/IEditorWithId/IAgentWithId filter/some callbacks.
- **SchoolDistributionPage.tsx**: Typed MUI TablePagination handlers.
- **ProgramDistributionDetailPage.tsx**: Added `DistributionItem`. Typed Record access.
- **CourseWidgetBody.tsx**: Typed handleChangeValue (SyntheticEvent), onChange callback.
- **InterviewsTable.tsx**: Typed trainer_id map, modifyTrainer params.
- **ManagerMainView.tsx**: Typed IAgentNotificationItem findIndex/map callbacks.
- **AgentMainView.tsx**: Typed IAgentNotificationItem findIndex, handleCollapse, outsourcedUser.
- **RespondedThreads.tsx**: Typed renderThreadLink (ReactNode, string, boolean).
- **TabProgramTaskDelta.tsx**: Added `TabProgramTaskDeltaProps`, imported ProgramTaskDeltaProps.
- **MessageList.tsx**: Added `MessageListProps` with 10 typed fields.
- **ManualFilesList.tsx**: Added `ManualFilesListProps`.
- **DescriptionBlock.tsx**: Added `DescriptionBlockProps` with IDocumentthreadPopulated.
- **CardConfigurations.tsx**: Typed TFunction params, render callback.

### 1-2 error files (~45 files)
- **StudentApplicationsTableTemplate.tsx**, **ProgramReportCard.tsx**, **NewProgramEdit.tsx**, **ProgramRequirementsTableWrapper.tsx**: Typed component props and callbacks.
- **InterviewTraining/index.tsx**: Typed transform function (IInterviewWithId[]).
- **EditEssayWritersSubpage.tsx**: Typed editor/i map callback (IUserWithId).
- **ProgramTaskDelta.tsx**: Typed missing/extra map callbacks.
- **NoTrainersInterviewsCard.tsx**: Added `NoTrainersInterviewsCardProps`.
- **NoEditorsStudentsCard.tsx**: Typed IAgentWithId map callback.
- **CustomerSupportBody.tsx**: Added `CustomerSupportBodyProps` with IComplaintWithId.
- **CommunicationExpandPageMessagesComponent.tsx**: Added props interface.
- **EditableFileThread.tsx**: Added `EditableFileThreadProps` with 11 typed fields.
- **RequirementsBlock.tsx**: Added `RequirementsBlockProps`.
- **CVMLRLDashboard.tsx**: Typed handleChange (SyntheticEvent, number).
- **SimilarStudents.tsx**: Typed SimilarStudentApplication filter callbacks.
- **BaseDocuments.tsx**: Typed IStudentResponse map callback.
- **Audit/index.tsx**: Typed user map callbacks in audit records.
- **AssignAgentsPage.tsx**: Reused NoAgentsTableProps for component.
- **util_functions.test.ts**: Typed buildGeneralDoc param.
- **UniAssistProgramBlock.tsx**: Typed handleMutationError.
- **SingleProgram.tsx**: Typed mutationFn/RemoveProgramHandlerV2.
- **ProgramEditPage.tsx**, **ProgramCreatePage.tsx**: Typed handleSubmitProgram (IProgramWithId).
- **AssignProgramsToStudentDialog.tsx**: Typed handleFilterToggle (ChangeEvent).
- **PortalCredentialPage/index.tsx**: Added `PortalCredentialPageProps`.
- **EditDownloadFiles.tsx**: Added `EditDownloadFilesProps`.
- **Documentation/index.tsx**, **SingleDoc.tsx**, **DocumentsListItems.tsx**: Added Props interfaces.
- **EditorMainView.tsx**: Typed outsourcedUser in .some().
- **CommunicationThreadEditor.tsx**: Typed handleEditorChange.
- **ToggleableUploadFileForm.tsx**: Added `ToggleableUploadFileFormProps`.
- **statusUtils.ts**: Typed getDealId param.
- **CreateUserFromLeadModal.tsx**: Typed parseGPA param.
- **DealDashboard.tsx**: Typed onClick handler.

---

## Pending Actions (Next Session)

1. ~~**Phase 3B**~~: **COMPLETE** — TS7006 0, TS7031 0.
2. **Phase 3C**: Fix null safety errors (TS18048/TS18047/TS18046 — ~492 errors).
3. **Phase 3D**: Fix remaining type mismatches (TS2345/TS2322 — ~1,229 errors).
4. **Phase 3E**: Fix interface mismatches (TS2339 — 679 errors).
5. **Phase 3A follow-up**: Export/re-export `IStudentResponse`, `StudentId`, `UserId` in `src/api/types.ts` to fix query.ts (TS2724/TS2305).

---

## Progress Log

| Date | Action | Errors Before | Errors After |
|------|--------|---------------|--------------|
| 2026-03-01 | Initial audit | — | 4,267 |
| 2026-03-03 | taiger-model Phase 2A-2H | 4,267 | 4,189 |
| 2026-03-03 | Frontend Phase 3A: IApplicationWithId→IApplicationPopulated, Application type, DocumentThread types | 4,189 | 4,063 |
| 2026-03-03 | Phase 3B session 1: Typed ~40 files — TS7006 703→218 (-485), TS7031 305→69 (-236) | 4,063 | 3,363 |
| 2026-03-03 | Phase 3B session 2: Typed ~85 remaining files — **TS7006 218→0, TS7031 69→0** | 3,363 | 3,268 |
| 2026-03-03 | Refreshed `tsc-errors.txt`; updated TSC_FIX_TRACKER.md and TSC_REFACTOR_PLAN.md to current code | 3,268 | 2,926 |
