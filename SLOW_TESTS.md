# Slow Test Cases - TaiGerPortalStaticWebsite

All 271 test cases listed with duration (ms), sorted slowest first. Optimize the slowest tests to improve CI/CD pipeline time.

**To regenerate:** `npm run test:ci -- --reporter=json --outputFile=test-results.json` then parse the JSON.

## Top slow tests (> 500 ms)

| Duration (ms) | Test | File |
|---------------|------|------|
| 543 | CustomDrawer Component renders the correct menu items For Student | src/components/NavBar/Drawer.test.tsx |

## All tests (sorted by duration)

| Duration (ms) | Test | File |
|---------------|------|------|
| 543 | CustomDrawer Component renders the correct menu items For Student | src/components/NavBar/Drawer.test.tsx |
| 264 | EventDateComponent renders without crashing | src/components/DateComponent/index.test.tsx |
| 263 | OffcanvasBaseDocument renders when open | src/components/Offcanvas/OffcanvasBaseDocument.test.tsx |
| 257 | SingleBarChart renders without crashing | src/components/Charts/SingleBarChart.test.tsx |
| 248 | OverlayButton toggles on click | src/components/Overlay/OverlayButton.test.tsx |
| 232 | ConfirmationModal renders when open | src/components/Modal/ConfirmationModal.test.tsx |
| 225 | OverlayButton renders without crashing | src/components/Overlay/OverlayButton.test.tsx |
| 208 | UsersTable renders without crashing | src/pages/Users/UsersTable.test.tsx |
| 201 | Admissions renders without crashing | src/pages/Admissions/Admissions.test.tsx |
| 170 | StarRating renders without crashing | src/components/SurveyProvider/StarRating.test.tsx |
| 154 | Footer renders without crashing | src/components/Footer/Footer.test.tsx |
| 153 | GoogleLoginButton (GoolgeSignInButton) renders without crashing | src/components/Buttons/GoolgeSignInButton.test.tsx |
| 139 | AuthWrapper renders children without crashing | src/components/AuthWrapper/index.test.tsx |
| 135 | ModalNew renders without crashing when open | src/components/Modal/index.test.tsx |
| 126 | Buttons DownloadIconButton renders and is clickable | src/components/Buttons/Button.test.tsx |
| 117 | Admissions renders tab list when data is loaded | src/pages/Admissions/Admissions.test.tsx |
| 112 | Dashboard agent dashboard not crash | src/pages/Dashboard/Dashboard.test.tsx |
| 111 | Single Program Page checking renders without crashing | src/pages/Program/SingleProgram.test.tsx |
| 109 | GaugeCard renders without crashing | src/components/GaugeCard/index.test.tsx |
| 94 | ApplicationLockControl renders chip when application and programId provided | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 94 | Survey renders without crashing | src/pages/Survey/index.test.tsx |
| 89 | StarRating calls onRatingChange when a star is clicked | src/components/SurveyProvider/StarRating.test.tsx |
| 89 | Admissions respects tab from URL search | src/pages/Admissions/Admissions.test.tsx |
| 87 | SurveyHeader renders without crashing | src/components/SurveyProvider/SurveyHeader.test.tsx |
| 86 | ApplicantsOverview renders without crashing | src/pages/ApplicantsOverview/index.test.tsx |
| 81 | StudentDatabase renders without crashing when user has TaiGer role | src/pages/StudentDatabase/index.test.tsx |
| 78 | ConfirmationModal calls onConfirm when confirm button clicked | src/components/Modal/ConfirmationModal.test.tsx |
| 77 | BreadcrumbsNavigation renders without crashing | src/components/BreadcrumbsNavigation/BreadcrumbsNavigation.test.tsx |
| 76 | StudentOverviewPage renders without crashing | src/pages/StudentOverview/index.test.tsx |
| 74 | ChildLoading renders without crashing | src/components/Loading/ChildLoading.test.tsx |
| 72 | AuthWrapper renders logo | src/components/AuthWrapper/index.test.tsx |
| 71 | ApplicantsOverview renders ApplicationOverviewTabs when not loading | src/pages/ApplicantsOverview/index.test.tsx |
| 70 | Loading renders without crashing | src/components/Loading/Loading.test.tsx |
| 69 | TopBar renders without crashing | src/components/TopBar/TopBar.test.tsx |
| 65 | Tabs CustomTabPanel renders without crashing | src/components/Tabs/index.test.tsx |
| 63 | StarRating shows current rating when rating prop is provided | src/components/SurveyProvider/StarRating.test.tsx |
| 52 | CustomThemeProvider renders children without crashing | src/components/ThemeProvider/index.test.tsx |
| 51 | Footer shows copyright and TaiGer link | src/components/Footer/Footer.test.tsx |
| 50 | BreadcrumbsNavigation renders last item as text only | src/components/BreadcrumbsNavigation/BreadcrumbsNavigation.test.tsx |
| 50 | Single Program Page checking renders SingleProgramView when loader data resolves | src/pages/Program/SingleProgram.test.tsx |
| 45 | Tier 1 – Core Application Pages smoke tests AgentSupportDocuments page renders | src/App.pageSmoke2.test.tsx |
| 45 | Tier 2 – Team / Admin Pages smoke tests InternalDashboard page renders | src/App.pageSmoke2.test.tsx |
| 41 | Tier 2 – Team / Admin Pages smoke tests TaiGerOrgEditor page renders | src/App.pageSmoke2.test.tsx |
| 38 | Tier 3 – CRM pages smoke tests CRMDashboard renders | src/App.pageSmoke3.test.tsx |
| 36 | Tier 1 – Core Application Pages smoke tests StudentApplications page renders | src/App.pageSmoke2.test.tsx |
| 35 | Page smoke tests – all pages render without crashing Dashboard (default) renders | src/App.pageSmoke.test.tsx |
| 35 | AssignEditors renders without crashing | src/pages/AssignmentAgentsEditors/AssignEditors/index.test.tsx |
| 32 | Admin AssignAgents renders without crashing | src/pages/AssignmentAgentsEditors/AssignAgents/index.test.tsx |
| 31 | Admissions shows loading state when isLoading is true | src/pages/Admissions/Admissions.test.tsx |
| 27 | Tier 1 – Core Application Pages smoke tests StudentOverviewPage renders | src/App.pageSmoke2.test.tsx |
| 27 | AuthProvider renders without crashing | src/components/AuthProvider/index.test.tsx |
| 24 | Buttons CommentsIconButton renders and calls openCommentWindow on click | src/components/Buttons/Button.test.tsx |
| 24 | GaugeCard renders score | src/components/GaugeCard/index.test.tsx |
| 22 | Tier 3 – Interview pages smoke tests Questionnaire (InterviewSurveyForm) renders | src/App.pageSmoke3.test.tsx |
| 22 | EnglishCertificateExpiredBeforeDeadlineBanner renders without crashing when condition is false | src/components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner.test.tsx |
| 22 | Buttons SetNeededIconButton renders | src/components/Buttons/Button.test.tsx |
| 21 | Buttons DeleteIconButton renders and is disabled when isLoading | src/components/Buttons/Button.test.tsx |
| 19 | ApplicationLockControl returns null when application is missing | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 18 | Survey renders survey component when student | src/pages/Survey/index.test.tsx |
| 17 | Tier 3 – Course Analysis pages smoke tests CourseNew renders | src/App.pageSmoke3.test.tsx |
| 17 | SurveyHeader renders subtitle when provided | src/components/SurveyProvider/SurveyHeader.test.tsx |
| 16 | Tier 2 – Team / Admin Pages smoke tests SingleBalanceSheetOverview page renders | src/App.pageSmoke2.test.tsx |
| 16 | Buttons SetNotNeededIconButton renders | src/components/Buttons/Button.test.tsx |
| 16 | Admissions shows error when isError is true | src/pages/Admissions/Admissions.test.tsx |
| 16 | StudentOverviewPage renders StudentOverviewTable | src/pages/StudentOverview/index.test.tsx |
| 14 | Tier 1 – Core Application Pages smoke tests SingleStudentPage renders | src/App.pageSmoke2.test.tsx |
| 14 | Tier 1 – Core Application Pages smoke tests SchoolConfig page renders | src/App.pageSmoke2.test.tsx |
| 14 | Tier 3 – Course Analysis pages smoke tests AllCourses renders | src/App.pageSmoke3.test.tsx |
| 14 | Tier 4 – Authentication / Public Pages smoke tests GoogleOAuthCallback page renders | src/App.pageSmoke3.test.tsx |
| 14 | ProgramLanguageNotMatchedBanner renders without crashing when condition is false | src/components/Banner/ProgramLanguageNotMatchedBanner.test.tsx |
| 14 | Loading shows loading text | src/components/Loading/Loading.test.tsx |
| 13 | Page smoke tests – all pages render without crashing Download page renders | src/App.pageSmoke.test.tsx |
| 13 | Tier 1 – Core Application Pages smoke tests ContactUs page renders | src/App.pageSmoke2.test.tsx |
| 13 | Tier 1 – Core Application Pages smoke tests ProgramCreatePage renders | src/App.pageSmoke2.test.tsx |
| 13 | Tier 2 – Team / Admin Pages smoke tests EssayWritersAssignment page renders | src/App.pageSmoke2.test.tsx |
| 13 | Tier 3 – CRM pages smoke tests CRMMeetingPage renders | src/App.pageSmoke3.test.tsx |
| 13 | Tier 3 – Interview pages smoke tests SingleInterview renders | src/App.pageSmoke3.test.tsx |
| 13 | ChildLoading shows loading text | src/components/Loading/ChildLoading.test.tsx |
| 13 | TopBar renders message when provided | src/components/TopBar/TopBar.test.tsx |
| 12 | Tier 3 – UniAssist smoke test UniAssist page renders | src/App.pageSmoke3.test.tsx |
| 12 | Tier 4 – Authentication / Public Pages smoke tests LandingPage renders | src/App.pageSmoke3.test.tsx |
| 11 | Tier 3 – Communications pages smoke tests CommunicationSinglePage renders | src/App.pageSmoke3.test.tsx |
| 11 | Tier 3 – Documentation pages smoke tests InternaldocsPage renders | src/App.pageSmoke3.test.tsx |
| 11 | ModalNew does not render children when closed | src/components/Modal/index.test.tsx |
| 10 | Tier 3 – CRM pages smoke tests CRMLeadPage renders | src/App.pageSmoke3.test.tsx |
| 10 | Tier 3 – Course Analysis pages smoke tests CourseKeywordsEdit renders | src/App.pageSmoke3.test.tsx |
| 9 | Tier 2 – Team / Admin Pages smoke tests Accounting page renders | src/App.pageSmoke2.test.tsx |
| 9 | Tier 3 – Office Hours pages smoke tests AllOfficeHours renders | src/App.pageSmoke3.test.tsx |
| 9 | Tier 3 – AI / Widget pages smoke tests CVMLRL_Modification_Thread renders | src/App.pageSmoke3.test.tsx |
| 8 | Page smoke tests – all pages render without crashing Student Database Overview renders | src/App.pageSmoke.test.tsx |
| 8 | Page smoke tests – all pages render without crashing CVMLRL Center / Overview renders | src/App.pageSmoke.test.tsx |
| 8 | Tier 1 – Core Application Pages smoke tests AllBaseDocuments page renders | src/App.pageSmoke2.test.tsx |
| 8 | Tier 1 – Core Application Pages smoke tests PortalCredentialPage renders | src/App.pageSmoke2.test.tsx |
| 8 | Tier 2 – Team / Admin Pages smoke tests ProgramTaskDelta page renders | src/App.pageSmoke2.test.tsx |
| 8 | Tier 3 – Documentation pages smoke tests DocsInternalPage renders | src/App.pageSmoke3.test.tsx |
| 7 | Page smoke tests – all pages render without crashing Admissions page renders | src/App.pageSmoke.test.tsx |
| 7 | Page smoke tests – all pages render without crashing Archiv Students page renders | src/App.pageSmoke.test.tsx |
| 7 | Tier 1 – Core Application Pages smoke tests StudentApplicationsAssignPage renders | src/App.pageSmoke2.test.tsx |
| 7 | Tier 2 – Team / Admin Pages smoke tests TaiGerOrg (Members) page renders | src/App.pageSmoke2.test.tsx |
| 7 | Tier 2 – Team / Admin Pages smoke tests TaiGerOrgAdmin page renders | src/App.pageSmoke2.test.tsx |
| 7 | Tier 3 – CRM pages smoke tests CRMLeadDashboard renders | src/App.pageSmoke3.test.tsx |
| 7 | Tabs CustomTabPanel hides content when value does not match index | src/components/Tabs/index.test.tsx |
| 6 | Page smoke tests – all pages render without crashing Student Database page renders | src/App.pageSmoke.test.tsx |
| 6 | Page smoke tests – all pages render without crashing Base Documents page renders | src/App.pageSmoke.test.tsx |
| 6 | Page smoke tests – all pages render without crashing Settings page renders | src/App.pageSmoke.test.tsx |
| 6 | Tier 1 – Core Application Pages smoke tests SingleProgram page renders | src/App.pageSmoke2.test.tsx |
| 6 | Tier 1 – Core Application Pages smoke tests ProgramChangeRequestPage renders | src/App.pageSmoke2.test.tsx |
| 6 | Tier 2 – Team / Admin Pages smoke tests ProgramDistributionDetailPage renders | src/App.pageSmoke2.test.tsx |
| 6 | Tier 2 – Team / Admin Pages smoke tests SchoolDistributionPage renders | src/App.pageSmoke2.test.tsx |
| 6 | Tier 3 – CRM pages smoke tests CRMMeetingDashboard renders | src/App.pageSmoke3.test.tsx |
| 6 | Tier 4 – Authentication / Public Pages smoke tests AccountActivation page renders | src/App.pageSmoke3.test.tsx |
| 5 | Tier 1 – Core Application Pages smoke tests ProgramsOverviewPage renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 1 – Core Application Pages smoke tests ProgramEditPage renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 1 – Core Application Pages smoke tests CreateComplaintTicket page renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 2 – Team / Admin Pages smoke tests TaiGerMemberProfile page renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 2 – Team / Admin Pages smoke tests InterviewTrainersAssignment page renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 2 – Team / Admin Pages smoke tests ProgramConflict page renders | src/App.pageSmoke2.test.tsx |
| 5 | Tier 3 – Communications pages smoke tests DocumentCommunicationExpandPage renders | src/App.pageSmoke3.test.tsx |
| 5 | Tier 3 – Office Hours pages smoke tests TaiGerOfficeHours renders | src/App.pageSmoke3.test.tsx |
| 5 | Tier 4 – Authentication / Public Pages smoke tests SignIn page renders | src/App.pageSmoke3.test.tsx |
| 5 | Tier 4 – Authentication / Public Pages smoke tests ResetPasswordRequest page renders | src/App.pageSmoke3.test.tsx |
| 5 | Tier 4 – Authentication / Public Pages smoke tests ResetPassword page renders | src/App.pageSmoke3.test.tsx |
| 5 | OffcanvasBaseDocument does not render content when closed | src/components/Offcanvas/OffcanvasBaseDocument.test.tsx |
| 5 | Admissions redirects non-TaiGer users | src/pages/Admissions/Admissions.test.tsx |
| 5 | StudentDatabase redirects to dashboard when user has no TaiGer role | src/pages/StudentDatabase/index.test.tsx |
| 5 | Admin AssignAgents renders AssignAgentsPage with mock students | src/pages/AssignmentAgentsEditors/AssignAgents/index.test.tsx |
| 5 | AssignEditors renders AssignEditorsPage with mock students | src/pages/AssignmentAgentsEditors/AssignEditors/index.test.tsx |
| 4 | Page smoke tests – all pages render without crashing Program List page renders | src/App.pageSmoke.test.tsx |
| 4 | Page smoke tests – all pages render without crashing Profile page renders | src/App.pageSmoke.test.tsx |
| 4 | Page smoke tests – all pages render without crashing Learning Resources page renders | src/App.pageSmoke.test.tsx |
| 4 | Page smoke tests – all pages render without crashing Assignment Agents page renders | src/App.pageSmoke.test.tsx |
| 4 | Tier 1 – Core Application Pages smoke tests MyStudentOverviewPage renders | src/App.pageSmoke2.test.tsx |
| 4 | Tier 2 – Team / Admin Pages smoke tests TaiGerOrgAgent page renders | src/App.pageSmoke2.test.tsx |
| 4 | Tier 3 – CRM pages smoke tests CRMDealDashboard renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – Interview pages smoke tests InterviewTraining renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – Interview pages smoke tests AddInterview renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – Documentation pages smoke tests DocsPage renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – Documentation pages smoke tests InternalDocCreatePage renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – Course Analysis pages smoke tests ProgramRequirements renders | src/App.pageSmoke3.test.tsx |
| 4 | Tier 3 – AI / Widget pages smoke tests CoursesAnalysisWidget renders | src/App.pageSmoke3.test.tsx |
| 4 | Course input pag checking My Course not crash | src/pages/MyCourses/index.test.ts |
| 4 | Role checking is_cv_assigned | src/pages/Utils/util_functions.test.ts |
| 3 | Page smoke tests – all pages render without crashing Users Table page renders | src/App.pageSmoke.test.tsx |
| 3 | Page smoke tests – all pages render without crashing My Courses page renders | src/App.pageSmoke.test.tsx |
| 3 | Page smoke tests – all pages render without crashing Applications Overview renders | src/App.pageSmoke.test.tsx |
| 3 | Page smoke tests – all pages render without crashing All Applicants Overview renders | src/App.pageSmoke.test.tsx |
| 3 | Page smoke tests – all pages render without crashing Survey page renders | src/App.pageSmoke.test.tsx |
| 3 | Page smoke tests – all pages render without crashing Customer Support page renders | src/App.pageSmoke.test.tsx |
| 3 | Tier 1 – Core Application Pages smoke tests CustomerTicketDetailPage renders | src/App.pageSmoke2.test.tsx |
| 3 | Tier 2 – Team / Admin Pages smoke tests TaiGerPermissions page renders | src/App.pageSmoke2.test.tsx |
| 3 | Tier 2 – Team / Admin Pages smoke tests CVMLRLDashboard page renders | src/App.pageSmoke2.test.tsx |
| 3 | Tier 2 – Team / Admin Pages smoke tests EssayDashboard page renders | src/App.pageSmoke2.test.tsx |
| 3 | Tier 3 – Communications pages smoke tests CommunicationExpandPage renders | src/App.pageSmoke3.test.tsx |
| 3 | Tier 3 – Documentation pages smoke tests DocsApplication renders | src/App.pageSmoke3.test.tsx |
| 3 | Tier 3 – Documentation pages smoke tests DocCreatePage renders | src/App.pageSmoke3.test.tsx |
| 3 | Tier 3 – Office Hours pages smoke tests OfficeHours renders | src/App.pageSmoke3.test.tsx |
| 3 | Tier 3 – Course Analysis pages smoke tests CourseEdit renders | src/App.pageSmoke3.test.tsx |
| 3 | Tier 3 – AI / Widget pages smoke tests MyCoursesAnalysisV2 renders | src/App.pageSmoke3.test.tsx |
| 3 | ApplicationLockControl returns null when application has no programId | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 2 | Page smoke tests – all pages render without crashing Assignment Editors page renders | src/App.pageSmoke.test.tsx |
| 2 | example test | src/App.test.ts |
| 2 | Tabs a11yProps returns id and aria-controls | src/components/Tabs/index.test.tsx |
| 2 | Communication page checking Communication page not crash | src/pages/Communications/CommunicationSinglePage.test.ts |
| 2 | check_languages_filled should return false if any language test date is expired | src/pages/Utils/util_functions.test.ts |
| 1 | CVMLRLCenter Agent: cvmlrl center not crash | src/pages/CVMLRLCenter/index.test.ts |
| 1 | Role checking calculateDisplayLength | src/pages/Utils/util_functions.test.ts |
| 1 | Role checking truncateText | src/pages/Utils/util_functions.test.ts |
| 1 | Role checking isCVFinished | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return false if thread is not provided | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return the correct ML requirement | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return the correct portfolio requirement | src/pages/Utils/util_functions.test.ts |
| 1 | isEnglishLanguageInfoComplete should return true if english_isPassed is a value other than "-" | src/pages/Utils/util_functions.test.ts |
| 1 | based_documents_init should initialize all document statuses to Missing | src/pages/Utils/util_functions.test.ts |
| 1 | based_documents_init should update document statuses based on student profile | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus returns empty arrays when no application is provided | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus flags missing program-specific documents | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus flags extra program-specific documents | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus returns structured RL info for missing recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | getGeneralDocumentStatus returns empty arrays when applications are not provided | src/pages/Utils/util_functions.test.ts |
| 1 | getGeneralDocumentStatus flags missing general recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | getGeneralDocumentStatus flags extra general recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | isUniAssistVPDNeeded returns false when uni_assist does not include VPD | src/pages/Utils/util_functions.test.ts |
| 1 | check_student_needs_uni_assist returns true when at least one application needs uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return false if fileType or program is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct essay requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if essay requirement is not specified | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct supplementary form requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct curriculum analysis requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct scholarship form requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct RL requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if RL requirement is not specified | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if file type does not match any condition | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if both english_isPassed and german_isPassed are "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if english_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if german_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if both english_isPassed and german_isPassed are not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if english_isPassed is "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return true if english_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return true if english_isPassed is an empty string | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if german_isPassed is "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is an empty string | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is a value other than "-" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return true if english_isPassed is "O" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return false if english_isPassed is not "O" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return true if english_isPassed is "--" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return false if english_isPassed is not "--" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return true if german_isPassed is "O" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return false if german_isPassed is not "O" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return true if german_isPassed is "--" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return false if german_isPassed is not "--" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should handle documents with status Missing | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should handle documents with status NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should not change the status of documents not in the student profile | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return true if any base document is uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if no base document is uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if students array is empty | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if students array is null or undefined | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if student applications is undefined | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should ignore applications without "VPD" in uni_assist | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if uni_assist is missing | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should continue if uni_assist status is NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if uni_assist status is not Uploaded or vpd_file_path is empty | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return true if all VPD documents are uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return false if any language test is missing or marked as "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return true if all language tests are filled and not expired | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should handle edge cases where test dates are empty strings | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return false if academic_background or university is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return false if any mandatory field is missing or marked as "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return true if all mandatory fields are filled | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should handle edge cases where fields are missing or optional fields are not required | src/pages/Utils/util_functions.test.ts |
| 0 | getProgramDocumentStatus returns structured RL info for extra recommendation letters | src/pages/Utils/util_functions.test.ts |
| 0 | getGeneralDocumentStatus ignores RL-specific programs when collecting application metadata | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no applications need uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no VPD documents are uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns the number of applications with uploaded VPD documents | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns 0 when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns 0 when no applications need uni assist VPD | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns the number of applications needing uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns true when no document modification threads are provided | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns false when some document modification threads are not finished | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns true when all document modification threads are finished | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when the program is not decided | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when programId does not have uni_assist | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns true when uni_assist includes VPD but no uni_assist property | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when uni_assist includes VPD and status is NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns true when uni_assist includes VPD, status is not Uploaded, and vpd_file_path is empty | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when uni_assist includes VPD, status is Uploaded, and vpd_file_path is not empty | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns false when uni assist is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns false when uni assist is not paid | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns true when uni assist is paid | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no applications need uni assist | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns true when at least one application needs uni assist for FULL | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no programs are decided | src/pages/Utils/util_functions.test.ts |
