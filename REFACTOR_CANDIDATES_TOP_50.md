# Top 50 Large Components & Pages – Refactor Candidates

Components and pages ranked by line count (excluding test files). Splitting these into smaller components will improve **unit testability** and **maintainability**.

**Criteria:** Source `.tsx`/`.jsx` in `src/`; test files (`.test.tsx`, `App.pageSmoke*.test.tsx`) and `src/utils/contants.tsx` excluded.

---

## Progress summary

| Done | Files refactored | Tests before | Tests after |
|------|-----------------|-------------|-------------|
| ✅ #1–#7 | 7 of 50 | 404 (60 files) | 465 (69 files) |

---

## Top 50 by line count (descending)

Legend: ✅ Done · 🔲 Pending

| # | Orig lines | Now | Path (relative to `src/`) | Status |
|---|-----------|-----|----------------------------|--------|
| 1 | 2385 | 104 | pages/Survey/SurveyEditableComponent.tsx | ✅ Extracted: `SurveyMissingFieldsAlerts`, `SurveyApplicationPreferenceCard`, `SurveyAcademicBackgroundCard`, `SurveyLanguagesCard`, `SurveyDocLinkEditDialog` |
| 2 | 2005 | 757 | pages/InterviewTraining/SingleInterview.tsx | ✅ Extracted: `InterviewMetadataSidebar` |
| 3 | 1900 | 250 | pages/MyCourses/CourseAnalysisV2.tsx | ✅ Extracted: `CourseTable`, `EstimationCard`, `GPACard`, `ProgramMatchingScores`, `CourseAnalysisComponent`, `GeneralCourseAnalysisComponent`, `utils.ts` |
| 4 | 1354 | 382 | pages/CVMLRLCenter/DocModificationThreadPage/components/InformationBlock.tsx | ✅ Extracted: `DeadlineCard`, `RequirementsSection`, `InstructionsSection`, `TeamInformationCard`, `ProgramDetailsCard` |
| 5 | 1334 | 399 | pages/Program/ProgramsOverviewPage.tsx | ✅ Extracted: `SummaryStatsGrid`, `DistributionAnalysisSection`, `TopPerformersSection`, `AdditionalInsightsSection` |
| 6 | 1266 | 512 | pages/CRM/LeadPage.tsx | ✅ Extracted: `LeadProfileHeader`, `MeetingsList` |
| 7 | 1256 | 979 | pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadPage.tsx | ✅ Extracted: `SimilarThreadsTab`, `DiscussionEditorCard` |
| 8 | 1252 | — | pages/Program/SingleProgramView.tsx | 🔲 |
| 9 | 1135 | — | pages/CVMLRLCenter/EditorDocsProgress.tsx | 🔲 |
| 10 | 1135 | — | pages/StudentApplications/StudentApplicationsTableTemplate.tsx | 🔲 |
| 11 | 1124 | — | pages/CRM/components/SimilarStudents.tsx | 🔲 |
| 12 | 1113 | — | pages/OfficeHours/taiger_index.tsx | 🔲 |
| 13 | 1001 | — | pages/OfficeHours/index.tsx | 🔲 |
| 14 | 936 | — | routes.tsx | 🔲 |
| 15 | 901 | — | components/Calendar/components/EventConfirmationCard.tsx | 🔲 |
| 16 | 900 | — | pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadInput.tsx | 🔲 |
| 17 | 862 | — | pages/BaseDocuments/MyDocumentCard.tsx | 🔲 |
| 18 | 856 | — | pages/BaseDocuments/BaseDocumentsTable.tsx | 🔲 |
| 19 | 849 | — | components/StudentOverviewTable/index.tsx | 🔲 |
| 20 | 775 | — | pages/CRM/MeetingDashboard.tsx | 🔲 |
| 21 | 777 | — | pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsOverview.tsx | 🔲 |
| 22 | 765 | — | pages/StudentDatabase/SingleStudentPage.tsx | 🔲 |
| 23 | 727 | — | pages/Admissions/Overview.tsx | 🔲 |
| 24 | 722 | — | pages/CustomerSupport/CustomerTicketDetailPageBody.tsx | 🔲 |
| 25 | 688 | — | pages/CRM/components/DealModal.tsx | 🔲 |
| 26 | 673 | — | pages/TaiGerOrg/index.tsx | 🔲 |
| 27 | 670 | — | pages/CRM/MeetingPage.tsx | 🔲 |
| 28 | 663 | — | pages/MyCourses/index.tsx | 🔲 |
| 29 | 652 | — | pages/CVMLRLCenter/CVMLRLOverview.tsx | 🔲 |
| 30 | 649 | — | pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/DocumentCommunicatiomExpandPage.tsx | 🔲 |
| 31 | 626 | — | pages/Dashboard/StudentDashboard/StudentDashboard.tsx | 🔲 |
| 32 | 619 | — | components/ApplicationProgressCard/ApplicationProgressCard.tsx | 🔲 |
| 33 | 617 | — | pages/EssayDashboard/EssayOverview.tsx | 🔲 |
| 34 | 613 | — | pages/UniAssist/UniAssistProgramBlock.tsx | 🔲 |
| 35 | 611 | — | components/NavBar/index.tsx | 🔲 |
| 36 | 604 | — | pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNew.tsx | 🔲 |
| 37 | 598 | — | pages/StudentDatabase/StudentDatabaseOverview.tsx | 🔲 |
| 38 | 591 | — | pages/StudentDatabase/MeetingTab.tsx | 🔲 |
| 39 | 560 | — | components/ExtendableTable/ExtendableTable.tsx | 🔲 |
| 40 | 556 | — | pages/Communications/CommunicationExpandPage.tsx | 🔲 |
| 41 | 550 | — | pages/PortalCredentialPage/PortalCredentialsCard.tsx | 🔲 |
| 42 | 538 | — | pages/CRM/index.tsx | 🔲 |
| 43 | 507 | — | pages/Communications/Message.tsx | 🔲 |
| 44 | 505 | — | pages/CRM/DealDashboard.tsx | 🔲 |
| 45 | 496 | — | pages/InterviewTraining/AddInterview.tsx | 🔲 |
| 46 | 494 | — | pages/OfficeHours/all_index.tsx | 🔲 |
| 47 | 488 | — | pages/Dashboard/MainViewTab/StudentsAgentEditor/StudentsAgentEditor.tsx | 🔲 |
| 48 | 474 | — | pages/Program/SchoolDistributionPage.tsx | 🔲 |
| 49 | 469 | — | pages/CRM/components/CardConfigurations.tsx | 🔲 |
| 50 | 463 | — | pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsNew.tsx | 🔲 |

---

## Suggested refactor focus (high impact)

| Priority | File | Why | Status |
|----------|------|-----|--------|
| **P0** | SurveyEditableComponent.tsx (2385) | Single huge form/survey UI; split into step/section components and shared form fields. | ✅ Done |
| **P0** | SingleInterview.tsx (2005) | Interview flow; extract sections (header, form, calendar, feedback) and hooks. | ✅ Done |
| **P0** | CourseAnalysisV2.tsx (1900) | Course analysis; split by feature (tabs, tables, modals) and move logic to hooks. | ✅ Done |
| **P0** | InformationBlock.tsx (1354) | CV/ML/RL info block; split by subsection and reuse small presentational components. | ✅ Done |
| **P0** | ProgramsOverviewPage.tsx (1334) | Program overview; extract table, filters, and detail panels. | ✅ Done |
| **P1** | LeadPage.tsx (1266) | CRM lead; split lead header, timeline, and forms into subcomponents. | ✅ Done |
| **P1** | DocModificationThreadPage.tsx (1256) | Doc thread; extract thread list, message view, and input area. | ✅ Done |
| **P1** | SingleProgramView.tsx (1252) | Program view; extract requirement sections, lock UI, and actions. | 🔲 Next |
| **P1** | EditorDocsProgress.tsx (1135) | Editor progress; split by document type or stage. | 🔲 |
| **P1** | StudentApplicationsTableTemplate.tsx (1135) | Table template; extract toolbar, row, and cell components. | 🔲 |
| **P1** | taiger_index.tsx (1113) & OfficeHours index (1001) | Office hours; share layout and extract schedule, slots, and settings. | 🔲 |
| **P1** | routes.tsx (936) | Route config; split by domain (auth, dashboard, CRM, etc.) and lazy-loaded bundles. | 🔲 |

---

## Refactor patterns to apply

1. **Extract presentational components** – Move JSX blocks that only depend on props into small components (e.g. `*Card`, `*Row`, `*Section`).
2. **Custom hooks** – Move data fetching, form state, and side effects into hooks so pages/components stay thin.
3. **Split by feature/tab** – One component per tab or section, with a parent that composes them.
4. **Table components** – Extract toolbar, row/cell renderers, and filters from large table files (e.g. BaseDocumentsTable, StudentOverviewTable).
5. **Modals/dialogs** – Move modal content into dedicated components and keep page-level code to open/close and pass props.

---

*Generated from `src` .tsx/.jsx line counts; test files excluded.*
