# Slow Test Cases - TaiGerPortalStaticWebsite

All 196 test cases listed with duration (ms), sorted slowest first. Optimize the slowest tests to improve CI/CD pipeline time.

**To regenerate:** `npm run test:ci -- --reporter=json --outputFile=test-results.json` then parse the JSON.

## Top slow tests (> 500 ms)

| Duration (ms) | Test | File |
|---------------|------|------|
| 25255 | Page smoke tests – Survey page renders | src/App.pageSmoke.test.tsx |
| 4202 | StudentOverviewPage page not crash | src/pages/StudentOverview/index.test.tsx |
| 2559 | Admissions – Deep-link to Student tab | src/pages/Admissions/Admissions.test.tsx |
| 1394 | ArchivStudents – Agent archiv student page | src/pages/ArchivStudent/index.test.tsx |
| 1030 | Survey – student survey page not crash | src/pages/Survey/index.test.tsx |
| 911 | Users Table page not crash | src/pages/Users/UsersTable.test.tsx |

## All tests (sorted by duration)

| Duration (ms) | Test | File |
|---------------|------|------|
| 25255 | Page smoke tests – all pages render without crashing Survey page renders | src/App.pageSmoke.test.tsx |
| 4202 | StudentOverviewPage StudentOverview page not crash | src/pages/StudentOverview/index.test.tsx |
| 2559 | Admissions page checking Deep-link to Student tab via ?tab=student selects the tab | src/pages/Admissions/Admissions.test.tsx |
| 1394 | ArchivStudents Agent: archiv student page not crash | src/pages/ArchivStudent/index.test.tsx |
| 1030 | Survey student survey page not crash | src/pages/Survey/index.test.tsx |
| 911 | Users Table page checking Users Table page not crash | src/pages/Users/UsersTable.test.tsx |
| 483 | Single Program Page checking page not crash | src/pages/Program/SingleProgram.test.tsx |
| 355 | CustomDrawer Component renders the correct menu items For Student | src/components/NavBar/Drawer.test.tsx |
| 306 | ConfirmationModal calls onConfirm when confirm button clicked | src/components/Modal/ConfirmationModal.test.tsx |
| 253 | ConfirmationModal renders when open | src/components/Modal/ConfirmationModal.test.tsx |
| 214 | Page smoke tests – all pages render without crashing Settings page renders | src/App.pageSmoke.test.tsx |
| 208 | Admin AssignEditors admin assign editor not crash | src/pages/AssignmentAgentsEditors/AssignEditors/index.test.tsx |
| 199 | SingleBarChart renders without crashing | src/components/Charts/SingleBarChart.test.tsx |
| 193 | Admissions page checking Admissions page renders without crashing | src/pages/Admissions/Admissions.test.tsx |
| 180 | Footer renders without crashing | src/components/Footer/Footer.test.tsx |
| 155 | StarRating renders without crashing | src/components/SurveyProvider/StarRating.test.tsx |
| 153 | OffcanvasBaseDocument renders when open | src/components/Offcanvas/OffcanvasBaseDocument.test.tsx |
| 147 | Buttons DownloadIconButton renders and is clickable | src/components/Buttons/Button.test.tsx |
| 133 | ModalNew renders without crashing when open | src/components/Modal/index.test.tsx |
| 121 | Footer shows copyright and TaiGer link | src/components/Footer/Footer.test.tsx |
| 121 | BreadcrumbsNavigation renders without crashing | src/components/BreadcrumbsNavigation/BreadcrumbsNavigation.test.tsx |
| 119 | AuthWrapper renders children without crashing | src/components/AuthWrapper/index.test.tsx |
| 118 | OverlayButton toggles on click | src/components/Overlay/OverlayButton.test.tsx |
| 114 | EventDateComponent renders without crashing | src/components/DateComponent/index.test.tsx |
| 111 | ChildLoading renders without crashing | src/components/Loading/ChildLoading.test.tsx |
| 104 | GoogleLoginButton (GoolgeSignInButton) renders without crashing | src/components/Buttons/GoolgeSignInButton.test.tsx |
| 100 | OverlayButton renders without crashing | src/components/Overlay/OverlayButton.test.tsx |
| 100 | Admin AssignAgents admin assign agent not crash | src/pages/AssignmentAgentsEditors/AssignAgents/index.test.tsx |
| 84 | GaugeCard renders without crashing | src/components/GaugeCard/index.test.tsx |
| 81 | Tabs CustomTabPanel renders without crashing | src/components/Tabs/index.test.tsx |
| 72 | ApplicantsOverview ApplicationsOverview not crash | src/pages/ApplicantsOverview/index.test.tsx |
| 66 | ArchivStudents Shows loading state initially | src/pages/ArchivStudent/index.test.tsx |
| 61 | Loading renders without crashing | src/components/Loading/Loading.test.tsx |
| 60 | AuthWrapper renders logo | src/components/AuthWrapper/index.test.tsx |
| 60 | AuthProvider renders without crashing | src/components/AuthProvider/index.test.tsx |
| 59 | ApplicationLockControl renders chip when application and programId provided | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 58 | SurveyHeader renders without crashing | src/components/SurveyProvider/SurveyHeader.test.tsx |
| 58 | Page smoke tests – all pages render without crashing Dashboard (default) renders | src/App.pageSmoke.test.tsx |
| 54 | BreadcrumbsNavigation renders last item as text only | src/components/BreadcrumbsNavigation/BreadcrumbsNavigation.test.tsx |
| 52 | StarRating calls onRatingChange when a star is clicked | src/components/SurveyProvider/StarRating.test.tsx |
| 52 | Banner renders without crashing | src/components/Banner/Banner.test.tsx |
| 51 | TopBar renders without crashing | src/components/TopBar/TopBar.test.tsx |
| 50 | Buttons CommentsIconButton renders and calls openCommentWindow on click | src/components/Buttons/Button.test.tsx |
| 47 | Admin AssignEditors students rendered correctly | src/pages/AssignmentAgentsEditors/AssignEditors/index.test.tsx |
| 44 | StudentDatabase Student dashboard not crash | src/pages/StudentDatabase/index.test.tsx |
| 43 | Buttons DeleteIconButton renders and is disabled when isLoading | src/components/Buttons/Button.test.tsx |
| 42 | CustomThemeProvider renders children without crashing | src/components/ThemeProvider/index.test.tsx |
| 41 | Buttons SetNotNeededIconButton renders | src/components/Buttons/Button.test.tsx |
| 39 | Banner renders link when link_name and path provided | src/components/Banner/Banner.test.tsx |
| 37 | Page smoke tests – all pages render without crashing Student Database Overview renders | src/App.pageSmoke.test.tsx |
| 35 | StarRating shows current rating when rating prop is provided | src/components/SurveyProvider/StarRating.test.tsx |
| 30 | Buttons SetNeededIconButton renders | src/components/Buttons/Button.test.tsx |
| 25 | Admissions page checking Admissions page handles API error | src/pages/Admissions/Admissions.test.tsx |
| 24 | Admissions page checking Admissions page shows loading state | src/pages/Admissions/Admissions.test.tsx |
| 24 | Page smoke tests – all pages render without crashing Customer Support page renders | src/App.pageSmoke.test.tsx |
| 22 | Dashboard agent dashboard not crash | src/pages/Dashboard/Dashboard.test.tsx |
| 21 | Page smoke tests – all pages render without crashing Applications Overview renders | src/App.pageSmoke.test.tsx |
| 20 | Page smoke tests – all pages render without crashing All Applicants Overview renders | src/App.pageSmoke.test.tsx |
| 19 | Admin AssignAgents students rendered correctly | src/pages/AssignmentAgentsEditors/AssignAgents/index.test.tsx |
| 19 | Page smoke tests – all pages render without crashing Learning Resources page renders | src/App.pageSmoke.test.tsx |
| 19 | Course input pag checking My Course not crash | src/pages/MyCourses/index.test.ts |
| 17 | Page smoke tests – all pages render without crashing Base Documents page renders | src/App.pageSmoke.test.tsx |
| 17 | ApplicationLockControl returns null when application is missing | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 16 | GaugeCard renders score | src/components/GaugeCard/index.test.tsx |
| 16 | ProgramLanguageNotMatchedBanner renders without crashing when condition is false | src/components/Banner/ProgramLanguageNotMatchedBanner.test.tsx |
| 15 | EnglishCertificateExpiredBeforeDeadlineBanner renders without crashing when condition is false | src/components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner.test.tsx |
| 13 | Page smoke tests – all pages render without crashing Program List page renders | src/App.pageSmoke.test.tsx |
| 13 | Loading shows loading text | src/components/Loading/Loading.test.tsx |
| 13 | Page smoke tests – all pages render without crashing Assignment Agents page renders | src/App.pageSmoke.test.tsx |
| 13 | Admissions page checking Admissions page redirects non-TaiGer users | src/pages/Admissions/Admissions.test.tsx |
| 12 | Page smoke tests – all pages render without crashing Profile page renders | src/App.pageSmoke.test.tsx |
| 12 | ArchivStudents Redirects non-TaiGer users | src/pages/ArchivStudent/index.test.tsx |
| 11 | ChildLoading shows loading text | src/components/Loading/ChildLoading.test.tsx |
| 11 | Page smoke tests – all pages render without crashing Student Database page renders | src/App.pageSmoke.test.tsx |
| 11 | Page smoke tests – all pages render without crashing CVMLRL Center / Overview renders | src/App.pageSmoke.test.tsx |
| 10 | Page smoke tests – all pages render without crashing Admissions page renders | src/App.pageSmoke.test.tsx |
| 10 | Banner renders title when provided | src/components/Banner/Banner.test.tsx |
| 10 | SurveyHeader renders subtitle when provided | src/components/SurveyProvider/SurveyHeader.test.tsx |
| 10 | Page smoke tests – all pages render without crashing Archiv Students page renders | src/App.pageSmoke.test.tsx |
| 9 | Page smoke tests – all pages render without crashing Users Table page renders | src/App.pageSmoke.test.tsx |
| 9 | Page smoke tests – all pages render without crashing My Courses page renders | src/App.pageSmoke.test.tsx |
| 9 | TopBar renders message when provided | src/components/TopBar/TopBar.test.tsx |
| 7 | Page smoke tests – all pages render without crashing Download page renders | src/App.pageSmoke.test.tsx |
| 6 | Page smoke tests – all pages render without crashing Assignment Editors page renders | src/App.pageSmoke.test.tsx |
| 5 | OffcanvasBaseDocument does not render content when closed | src/components/Offcanvas/OffcanvasBaseDocument.test.tsx |
| 4 | Tabs CustomTabPanel hides content when value does not match index | src/components/Tabs/index.test.tsx |
| 4 | ModalNew does not render children when closed | src/components/Modal/index.test.tsx |
| 3 | Role checking is_cv_assigned | src/pages/Utils/util_functions.test.ts |
| 3 | ApplicationLockControl returns null when application has no programId | src/components/ApplicationLockControl/ApplicationLockControl.test.tsx |
| 3 | example test | src/App.test.ts |
| 2 | Communication page checking Communication page not crash | src/pages/Communications/CommunicationSinglePage.test.ts |
| 1 | CVMLRLCenter Agent: cvmlrl center not crash | src/pages/CVMLRLCenter/index.test.ts |
| 1 | Tabs a11yProps returns id and aria-controls | src/components/Tabs/index.test.tsx |
| 1 | getGeneralDocumentStatus flags missing general recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus flags missing program-specific documents | src/pages/Utils/util_functions.test.ts |
| 1 | Role checking calculateDisplayLength | src/pages/Utils/util_functions.test.ts |
| 1 | based_documents_init should initialize all document statuses to Missing | src/pages/Utils/util_functions.test.ts |
| 1 | check_languages_filled should return false if any language test date is expired | src/pages/Utils/util_functions.test.ts |
| 1 | Role checking isCVFinished | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return false if thread is not provided | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus returns empty arrays when no application is provided | src/pages/Utils/util_functions.test.ts |
| 1 | Role checking truncateText | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return the correct ML requirement | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return false if fileType or program is not provided | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus returns structured RL info for missing recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | getGeneralDocumentStatus flags extra general recommendation letters | src/pages/Utils/util_functions.test.ts |
| 1 | getProgramDocumentStatus flags extra program-specific documents | src/pages/Utils/util_functions.test.ts |
| 1 | getRequirement should return the correct portfolio requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getProgramDocumentStatus returns structured RL info for extra recommendation letters | src/pages/Utils/util_functions.test.ts |
| 0 | getGeneralDocumentStatus returns empty arrays when applications are not provided | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if essay requirement is not specified | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return false if academic_background or university is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return true if english_isPassed is "O" | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return true if any base document is uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct supplementary form requirement | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct essay requirement | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should update document statuses based on student profile | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should handle edge cases where test dates are empty strings | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if student applications is undefined | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no VPD documents are uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | getGeneralDocumentStatus ignores RL-specific programs when collecting application metadata | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should ignore applications without "VPD" in uni_assist | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns 0 when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return true if all VPD documents are uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct curriculum analysis requirement | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if no base document is uploaded | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns the number of applications with uploaded VPD documents | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns true when uni_assist includes VPD but no uni_assist property | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when the program is not decided | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if english_isPassed is "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return true if all language tests are filled and not expired | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if german_isPassed is "-" | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should not change the status of documents not in the student profile | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if both english_isPassed and german_isPassed are "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if academic_background is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns 0 when no applications need uni assist VPD | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns false when uni assist is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return true if english_isPassed is "--" | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns true when no document modification threads are provided | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct scholarship form requirement | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return true if german_isPassed is "--" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if english_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_passed should return false if english_isPassed is not "O" | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if file type does not match any condition | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_needed returns the number of applications needing uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return true if english_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return false if any mandatory field is missing or marked as "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_languages_filled should return false if any language test is missing or marked as "-" | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should continue if uni_assist status is NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if uni_assist status is not Uploaded or vpd_file_path is empty | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return the correct RL requirement | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if students array is null or undefined | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return true if german_isPassed is "O" | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no applications are provided | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should handle documents with status Missing | src/pages/Utils/util_functions.test.ts |
| 0 | is_all_uni_assist_vpd_uploaded should return false if uni_assist is missing | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return false if academic_background or language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | num_uni_assist_vpd_uploaded returns 0 when no applications need uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is an empty string | src/pages/Utils/util_functions.test.ts |
| 0 | based_documents_init should handle documents with status NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | getRequirement should return "No" if RL requirement is not specified | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when uni_assist includes VPD and status is NotNeeded | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no applications need uni assist | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return false if academic_background.language is not provided | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns false when some document modification threads are not finished | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return true if english_isPassed is an empty string | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should handle edge cases where fields are missing or optional fields are not required | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns false when uni assist is not paid | src/pages/Utils/util_functions.test.ts |
| 0 | is_any_base_documents_uploaded should return false if students array is empty | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when programId does not have uni_assist | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns true when uni_assist includes VPD, status is not Uploaded, and vpd_file_path is empty | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if german_isPassed is not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_if_there_is_german_language_info should return true if german_isPassed is a value other than "-" | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_Notneeded should return false if german_isPassed is not "--" | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns true when at least one application needs uni assist for FULL | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns false when no programs are decided | src/pages/Utils/util_functions.test.ts |
| 0 | check_student_needs_uni_assist returns true when at least one application needs uni assist for VPD | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_english_language_Notneeded should return false if english_isPassed is not "--" | src/pages/Utils/util_functions.test.ts |
| 0 | isEnglishLanguageInfoComplete should return true if english_isPassed is a value other than "-" | src/pages/Utils/util_functions.test.ts |
| 0 | check_academic_background_filled should return true if all mandatory fields are filled | src/pages/Utils/util_functions.test.ts |
| 0 | isLanguageInfoComplete should return true if both english_isPassed and german_isPassed are not "-" | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when uni_assist includes VPD, status is Uploaded, and vpd_file_path is not empty | src/pages/Utils/util_functions.test.ts |
| 0 | isUniAssistVPDNeeded returns false when uni_assist does not include VPD | src/pages/Utils/util_functions.test.ts |
| 0 | is_uni_assist_paid_and_docs_uploaded returns true when uni assist is paid | src/pages/Utils/util_functions.test.ts |
| 0 | is_program_ml_rl_essay_finished returns true when all document modification threads are finished | src/pages/Utils/util_functions.test.ts |
| 0 | Language Check Functions check_german_language_passed should return false if german_isPassed is not "O" | src/pages/Utils/util_functions.test.ts |
