import { lazy } from 'react';
import { appConfig } from './config';
import {
    getMyAcademicBackgroundLoader,
    getStudentsLoader,
    getAllComplaintTicketsLoader,
    getComplaintTicketLoader,
    getDistinctSchoolsLoader,
    getCourseKeywordSetsLoader,
    getProgramRequirementsLoader,
    getProgramsAndCourseKeywordSetsLoader,
    getProgramRequirementLoader,
    getProgramRequirementsV2Loader,
    getCourseLoader,
    getAllOpenInterviewsLoader
} from '@/api/dataLoader';
const Questionnaire = lazy(
    async () => await import('@pages/InterviewTraining/InterviewSurveyForm')
);
const AddInterview = lazy(
    async () => await import('@pages/InterviewTraining/AddInterview')
);
const CreateComplaintTicket = lazy(
    async () => await import('@pages/CustomerSupport/CreateTicket')
);
const CourseKeywordsOverviewNew = lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsNew'
        )
);

const DefaultErrorPage = lazy(
    async () => await import('@pages/Utils/DefaultErrorPage')
);

const StudentApplicationsAssignPage = lazy(
    async () => await import('@pages/StudentApplications/assignPage')
);
const ProgramRequirementsNewIndex = lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNewIndex'
        )
);
const ProgramRequirementsEditIndex = lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsEditIndex'
        )
);

const DashboardDefault = lazy(async () => await import('@pages/Dashboard'));

const CourseKeywordsEdit = lazy(
    async () => await import('@pages/CourseAnalysis/CourseKeywordsEdit')
);

const AllCourses = lazy(
    async () => await import('@pages/CourseAnalysis/AllCourses/AllCourses')
);

const CourseForm = lazy(
    async () => await import('@pages/CourseAnalysis/AllCourses/CourseForm')
);

const ProgramRequirements = lazy(
    async () => await import('@pages/CourseAnalysis/ProgramRequirements')
);

const ArchivStudent = lazy(
    async () => await import('@pages/ArchivStudent/index')
);

const CommunicationSinglePage = lazy(
    async () => await import('@pages/Communications/CommunicationSinglePage')
);

const CommunicationExpandPage = lazy(
    async () => await import('@pages/Communications/CommunicationExpandPage')
);

const DocumentCommunicatiomExpandPage = lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/DocumentCommunicatiomExpandPage'
        )
);

const UniAssist = lazy(async () => await import('@pages/UniAssist/index'));
const PortalCredentialPage = lazy(
    async () => await import('@pages/PortalCredentialPage/index')
);
const BaseDocuments = lazy(
    async () => await import('@pages/BaseDocuments/BaseDocuments')
);

const AllBaseDocuments = lazy(
    async () => await import('@pages/BaseDocuments/AllBaseDocuments')
);

const MyCourses = lazy(async () => await import('@pages/MyCourses/index'));

const MyCoursesAnalysisV2 = lazy(
    async () => await import('@pages/MyCourses/CourseAnalysisV2')
);

const CoursesAnalysisWidget = lazy(
    async () => await import('@pages/MyCourses/CourseWidget')
);

const AgentSupportDocuments = lazy(
    async () => await import('@pages/AgentSupportDocuments/index')
);
const CVMLRLOverview = lazy(
    async () => await import('@pages/CVMLRLCenter/index')
);
const CVMLRLDashboard = lazy(
    async () => await import('@pages/CVMLRLCenter/indexAll')
);
const EssayDashboard = lazy(
    async () => await import('@pages/EssayDashboard/index')
);
const AllApplicantsOverview = lazy(
    async () => await import('@pages/ApplicantsOverview/allStudentIndex')
);
const CustomerSupport = lazy(
    async () => await import('@pages/CustomerSupport')
);

const CustomerTicketDetailPage = lazy(
    async () => await import('@pages/CustomerSupport/CustomerTicketDetailPage')
);

const MyStudentOverviewPage = lazy(
    async () => await import('@pages/StudentOverview/MyStudentsOverview')
);

const StudentOverviewPage = lazy(
    async () => await import('@pages/StudentOverview/index')
);

const CRMDashboard = lazy(async () => await import('@pages/CRM/index'));
const CRMLeadDashboard = lazy(
    async () => await import('@pages/CRM/LeadDashboard')
);
const CRMLeadPage = lazy(async () => await import('@pages/CRM/LeadPage'));
const CRMMeetingDashboard = lazy(
    async () => await import('@pages/CRM/MeetingDashboard')
);
const CRMMeetingPage = lazy(async () => await import('@pages/CRM/MeetingPage'));
const CRMDealDashboard = lazy(
    async () => await import('@pages/CRM/DealDashboard')
);

const InternalDashboard = lazy(
    async () => await import('@pages/TaiGerOrg/InternalDashboard/index')
);
const Accounting = lazy(async () => await import('@pages/Accounting/index'));
const SingleBalanceSheetOverview = lazy(
    async () => await import('@pages/Accounting/SingleBalanceSheetOverview')
);
const ProgramConflict = lazy(
    async () => await import('@pages/TaiGerOrg/ProgramConflict/index')
);
const ProgramTaskDelta = lazy(
    async () => await import('@pages/TaiGerOrg/ProgramTaskDelta/index')
);
const TaiGerPermissions = lazy(
    async () => await import('@pages/TaiGerOrg/index')
);
const TaiGerOrg = lazy(
    async () => await import('@pages/TaiGerOrg/TaiGerMember/index')
);
const TaiGerOrgAgent = lazy(
    async () => await import('@pages/TaiGerOrg/AgentPage')
);
const TaiGerMemberProfile = lazy(
    async () => await import('@pages/TaiGerPublicProfile/AgentProfile')
);
const AllOfficeHours = lazy(
    async () => await import('@pages/OfficeHours/all_index')
);
const TaiGerOfficeHours = lazy(
    async () => await import('@pages/OfficeHours/taiger_index')
);
const OfficeHours = lazy(async () => await import('@pages/OfficeHours/index'));
const TaiGerOrgEditor = lazy(
    async () => await import('@pages/TaiGerOrg/EditorPage')
);
const TaiGerOrgAdmin = lazy(
    async () => await import('@pages/TaiGerOrg/AdminPage')
);
const ProgramList = lazy(
    async () => await import('@pages/Program/ProgramList')
);
const ProgramsOverviewPage = lazy(
    async () => await import('@pages/Program/ProgramsOverviewPage')
);
const ProgramDistributionDetailPage = lazy(
    async () => await import('@pages/Program/ProgramDistributionDetailPage')
);
const SchoolDistributionPage = lazy(
    async () => await import('@pages/Program/SchoolDistributionPage')
);
const ApplicationsOverview = lazy(
    async () => await import('@pages/ApplicantsOverview/index')
);
const LearningResources = lazy(
    async () => await import('@pages/LearningResources/index')
);
const ContactUs = lazy(async () => await import('@pages/Contact/index'));
const StudentApplications = lazy(
    async () =>
        await import('@pages/StudentApplications/StudentApplicationsIndividual')
);
const SingleProgram = lazy(
    async () => await import('@pages/Program/SingleProgram')
);
const ProgramEditPage = lazy(
    async () => await import('@pages/Program/ProgramEditPage')
);
const ProgramChangeRequestPage = lazy(
    async () => await import('@pages/Program/ProgramChangeRequestPage')
);
const ProgramCreatePage = lazy(
    async () => await import('@pages/Program/ProgramCreatePage')
);
const SchoolConfig = lazy(
    async () => await import('@pages/Program/SchoolConfig')
);
const UsersTable = lazy(async () => await import('@pages/Users/UsersTable'));
const Survey = lazy(async () => await import('@pages/Survey/index'));
const Settings = lazy(async () => await import('@pages/Settings/index'));
const Profile = lazy(async () => await import('@pages/Profile/index'));
const Admissions = lazy(
    async () => await import('@pages/Admissions/Admissions')
);
const StudentDatabase = lazy(
    async () => await import('@pages/StudentDatabase/index')
);
const StudentDatabaseOverview = lazy(
    async () => await import('@pages/StudentDatabase/StudentDatabaseOverview')
);
const CVMLRL_Modification_Thread = lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/SingleThreadPage'
        )
);

const CVMLRL_Modification_ThreadInput = lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadInput'
        )
);
const SingleStudentPage = lazy(
    async () => await import('@pages/StudentDatabase/SingleStudentPage')
);

const DocsApplication = lazy(
    async () => await import('@pages/Documentation/index')
);
const InternaldocsPage = lazy(
    async () => await import('@pages/Documentation/internal_index')
);
const DocsPage = lazy(
    async () => await import('@pages/Documentation/SingleDoc')
);
const DocsInternalPage = lazy(
    async () => await import('@pages/Documentation/SingleInternalDoc')
);
const DocCreatePage = lazy(
    async () => await import('@pages/Documentation/DocCreatePage')
);

const InternalDocCreatePage = lazy(
    async () => await import('@pages/Documentation/InternalDocCreatePage')
);

const InterviewTraining = lazy(
    async () => await import('@pages/InterviewTraining/index')
);

const SingleInterview = lazy(
    async () => await import('@pages/InterviewTraining/SingleInterview')
);

const Download = lazy(
    async () => await import('@pages/DownloadCenter/DownloadPage')
);

const AgentsAssignment = lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignAgents/index')
);

const EditorsAssignment = lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignEditors/index')
);

const EssayWritersAssignment = lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignEssayWriters/index')
);

const InterviewTrainersAssignment = lazy(
    async () =>
        await import(
            '@pages/AssignmentAgentsEditors/AssignInterviewTrainers/index'
        )
);

const routes = [
    {
        path: '/assignment',
        children: [
            {
                path: 'agents',
                errorElement: <DefaultErrorPage />,
                element: <AgentsAssignment />
            },
            {
                path: 'editors',
                errorElement: <DefaultErrorPage />,
                element: <EditorsAssignment />
            },
            {
                path: 'essay-writers',
                errorElement: <DefaultErrorPage />,
                element: <EssayWritersAssignment />
            },
            {
                path: 'interview-trainers',
                errorElement: <DefaultErrorPage />,
                loader: getAllOpenInterviewsLoader,
                element: <InterviewTrainersAssignment />
            }
        ]
    },
    {
        path: '/dashboard/default',
        errorElement: <DefaultErrorPage />,
        element: <DashboardDefault />
    },
    {
        path: '/courses',
        children: [
            {
                path: 'analysis/courses/new',
                element: <CourseForm mode="create" />
            },
            {
                path: 'analysis/courses/edit/:courseId',
                errorElement: <DefaultErrorPage />,
                loader: getCourseLoader,
                element: <CourseForm mode="edit" />
            },
            {
                path: 'analysis/courses/all',
                errorElement: <DefaultErrorPage />,
                element: <AllCourses />
            },
            {
                path: 'analysis/keywords',
                errorElement: <DefaultErrorPage />,
                loader: getCourseKeywordSetsLoader,
                element: <CourseKeywordsEdit />
            },
            {
                path: 'analysis/keywords/new',
                errorElement: <DefaultErrorPage />,
                element: <CourseKeywordsOverviewNew />
            },
            {
                path: 'analysis/programs',
                errorElement: <DefaultErrorPage />,
                loader: getProgramRequirementsLoader,
                element: <ProgramRequirements />
            },
            {
                path: 'analysis/programs/requirements/new',
                errorElement: <DefaultErrorPage />,
                loader: getProgramsAndCourseKeywordSetsLoader,
                element: <ProgramRequirementsNewIndex />
            },
            {
                path: 'analysis/programs/requirements/:requirementId',
                errorElement: <DefaultErrorPage />,
                loader: getProgramRequirementLoader,
                element: <ProgramRequirementsEditIndex />
            }
        ]
    },

    {
        path: '/admissions-overview',
        exact: true,
        name: 'Admissions',
        Component: Admissions
    },
    {
        path: '/archiv',
        children: [
            {
                path: 'students',
                exact: true,
                name: 'My Archived Students',
                Component: ArchivStudent
            }
        ]
    },
    {
        path: '/programs',
        children: [
            {
                path: '',
                exact: true,
                name: 'Program Table',
                Component: ProgramList
            },
            {
                path: 'overview',
                exact: true,
                name: 'Programs Overview',
                errorElement: <DefaultErrorPage />,
                Component: ProgramsOverviewPage
            },
            {
                path: 'distribution/:distributionType',
                exact: true,
                name: 'Program Distribution Detail',
                errorElement: <DefaultErrorPage />,
                Component: ProgramDistributionDetailPage
            },
            {
                path: 'schools',
                exact: true,
                name: 'Schools Distribution',
                errorElement: <DefaultErrorPage />,
                Component: SchoolDistributionPage
            },
            {
                path: ':programId/change-requests',
                exact: true,
                name: 'ProgramChangeRequestPage',
                Component: ProgramChangeRequestPage
            },
            {
                path: 'create',
                errorElement: <DefaultErrorPage />,
                loader: getDistinctSchoolsLoader,
                Component: ProgramCreatePage
            },
            {
                path: 'config',
                errorElement: <DefaultErrorPage />,
                loader: getDistinctSchoolsLoader,
                Component: SchoolConfig
            },
            {
                path: ':programId',
                errorElement: <DefaultErrorPage />,
                Component: SingleProgram
            },
            {
                path: ':programId/edit',
                errorElement: <DefaultErrorPage />,
                loader: getDistinctSchoolsLoader,
                Component: ProgramEditPage
            }
        ]
    },
    {
        path: '/document-modification/:documentsthreadId',
        exact: true,
        name: 'CVMLRL Modification Thread',
        Component: CVMLRL_Modification_Thread
    },

    {
        path: '/resources',
        exact: true,
        name: 'Learning Resources',
        Component: LearningResources
    },
    {
        path: '/contact',
        errorElement: <DefaultErrorPage />,
        loader: getStudentsLoader,
        element: <ContactUs />
    },
    {
        path: '/student-applications',
        children: [
            {
                path: '',
                errorElement: <DefaultErrorPage />,
                element: <ApplicationsOverview />
            },
            {
                path: ':student_id',
                errorElement: <DefaultErrorPage />,
                element: <StudentApplications />
            },
            {
                path: 'edit/:student_id',
                errorElement: <DefaultErrorPage />,
                element: <StudentApplicationsAssignPage />
            }
        ]
    },

    {
        path: '/users',
        exact: true,
        name: 'Users Table',
        Component: UsersTable
    },
    {
        path: '/student-database',
        children: [
            {
                path: '',
                errorElement: <DefaultErrorPage />,
                element: <StudentDatabase />
            },
            {
                path: 'overview',
                errorElement: <DefaultErrorPage />,
                element: <StudentDatabaseOverview />
            },
            {
                path: ':studentId',
                errorElement: <DefaultErrorPage />,
                element: <SingleStudentPage />
            }
        ]
    },
    {
        path: '/docs',
        children: [
            {
                path: 'taiger/internal',
                exact: true,
                name: 'Documentation',
                Component: InternaldocsPage
            },
            {
                path: ':category',
                exact: true,
                name: 'Documentation',
                Component: DocsApplication
            },
            {
                path: 'internal/search/:documentation_id',
                exact: true,
                name: 'DocumentationPage',
                Component: DocsInternalPage
            },
            {
                path: 'search/:documentation_id',
                exact: true,
                name: 'DocumentationPage',
                Component: DocsPage
            }
        ]
    },
    {
        path: '/download',
        exact: true,
        name: 'Download',
        Component: Download
    },
    {
        path: '/my-courses',
        children: [
            {
                path: '',
                exact: true,
                name: 'My Courses 1',
                Component: MyCourses
            },
            {
                path: 'analysis/v2/:user_id',
                exact: true,
                name: 'My Courses Analysis',
                Component: MyCoursesAnalysisV2
            },
            {
                path: ':student_id',
                exact: true,
                name: 'My Courses 2',
                Component: MyCourses
            }
        ]
    },
    {
        path: '/base-documents',
        exact: true,
        name: 'Documents',
        Component: BaseDocuments
    },
    {
        path: '/agent-support-documents',
        exact: true,
        name: 'AgentSupportDocuments',
        Component: AgentSupportDocuments
    },
    {
        path: '/all-base-documents',
        errorElement: <DefaultErrorPage />,
        element: <AllBaseDocuments />
    },
    {
        path: '/portal-informations',
        exact: true,
        name: 'Portal Information',
        Component: PortalCredentialPage
    },
    {
        path: '/portal-informations/:student_id',
        exact: true,
        name: 'Portal Information',
        Component: PortalCredentialPage
    },
    {
        path: '/dashboard',
        children: [
            {
                path: 'cv-ml-rl',
                exact: true,
                name: 'CV/ML/RL Dashboard',
                Component: CVMLRLDashboard
            },
            {
                path: 'essay',
                exact: true,
                name: 'CV/ML/RL Dashboard',
                Component: EssayDashboard
            },
            {
                path: 'internal',
                exact: true,
                name: '',
                Component: InternalDashboard
            }
        ]
    },
    {
        path: '/cv-ml-rl-center',
        exact: true,
        name: 'CV/ML/RL Center',
        Component: CVMLRLOverview
    },
    {
        path: '/settings',
        exact: true,
        name: 'Settings',
        Component: Settings
    },
    {
        path: '/profile',
        exact: true,
        name: 'Profile',
        Component: Profile
    },
    {
        path: '/profile/:user_id',
        exact: true,
        name: 'Profile',
        Component: Profile
    },
    {
        path: '/survey',
        errorElement: <DefaultErrorPage />,
        loader: getMyAcademicBackgroundLoader,
        element: <Survey />
    },
    {
        path: '/all-students-applications',
        errorElement: <DefaultErrorPage />,
        element: <AllApplicantsOverview />
    },
    {
        path: '/students-overview',
        errorElement: <DefaultErrorPage />,
        element: <MyStudentOverviewPage />
    },
    {
        path: '/customer-center',
        errorElement: <DefaultErrorPage />,
        loader: getAllComplaintTicketsLoader,
        element: <CustomerSupport />
    },
    {
        path: '/customer-center/add-ticket',
        errorElement: <DefaultErrorPage />,
        element: <CreateComplaintTicket />
    },
    {
        path: '/customer-center/tickets/:complaintTicketId',
        errorElement: <DefaultErrorPage />,
        loader: getComplaintTicketLoader,
        element: <CustomerTicketDetailPage />
    },
    {
        path: '/students-overview/all',
        errorElement: <DefaultErrorPage />,
        element: <StudentOverviewPage />
    },
    {
        path: '/internal',
        children: [
            {
                path: 'program-conflict',
                exact: true,
                name: '',
                Component: ProgramConflict
            },
            {
                path: 'program-task-delta',
                exact: true,
                name: '',
                Component: ProgramTaskDelta
            },
            {
                path: 'accounting',
                exact: true,
                name: '',
                Component: Accounting
            },
            {
                path: 'accounting/users/:taiger_user_id',
                exact: true,
                name: '',
                Component: SingleBalanceSheetOverview
            },
            {
                path: 'widgets/course-analyser',
                errorElement: <DefaultErrorPage />,
                name: 'Course Analyser',
                loader: getProgramRequirementsV2Loader,
                Component: CoursesAnalysisWidget
            },
            {
                path: 'widgets/course-analyser/v2/:user_id',
                exact: true,
                name: 'MyCourses Analysis',
                Component: MyCoursesAnalysisV2
            },
            {
                path: 'database/public-docs',
                exact: true,
                name: 'DocCreatePage',
                Component: DocCreatePage
            },
            {
                path: 'database/internal-docs',
                exact: true,
                name: 'InternalDocCreatePage',
                Component: InternalDocCreatePage
            }
        ]
    },
    {
        path: '/teams',
        children: [
            {
                path: 'agents/profile/:user_id',
                exact: true,
                name: '',
                Component: TaiGerMemberProfile
            },
            {
                path: 'agents/:user_id',
                exact: true,
                name: '',
                Component: TaiGerOrgAgent
            },
            {
                path: 'agents/archiv/:user_id',
                exact: true,
                name: 'Archived Students',
                Component: ArchivStudent
            },
            {
                path: 'editors/:user_id',
                exact: true,
                name: '',
                Component: TaiGerOrgEditor
            },
            {
                path: 'editors/archiv/:user_id',
                exact: true,
                name: 'Archived Students',
                Component: ArchivStudent
            },
            {
                path: 'admins/:user_id',
                exact: true,
                name: '',
                Component: TaiGerOrgAdmin
            },
            {
                path: 'permissions',
                exact: true,
                name: '',
                Component: TaiGerPermissions
            },
            {
                path: 'members',
                exact: true,
                name: '',
                Component: TaiGerOrg
            }
        ]
    },
    {
        path: '/',
        errorElement: <DefaultErrorPage />,
        element: <DashboardDefault />
    }
];

if (appConfig.vpdEnable) {
    routes.push({
        path: '/uni-assist',
        exact: true,
        name: 'Uni Assist Tasks',
        Component: UniAssist
    });
}
if (appConfig.interviewEnable) {
    routes.push({
        path: '/interview-training',
        exact: true,
        name: 'InterviewTraining',
        Component: InterviewTraining
    });
    routes.push({
        path: '/interview-training/add',
        exact: true,
        name: 'AddInterview',
        Component: AddInterview
    });
    routes.push({
        path: '/interview-training/:interview_id/survey',
        exact: true,
        name: 'InterviewSurvey',
        Component: Questionnaire
    });
    routes.push({
        path: '/interview-training/:interview_id',
        exact: true,
        name: 'SingleInterview',
        Component: SingleInterview
    });
}

if (appConfig.CRMEnable) {
    routes.push({
        path: '/crm',
        exact: true,
        name: 'CRM Dashboard',
        Component: CRMDashboard
    });
    routes.push({
        path: '/crm/leads',
        exact: true,
        name: 'CRM Leads',
        Component: CRMLeadDashboard
    });
    routes.push({
        path: '/crm/leads/:leadId',
        exact: true,
        name: 'CRM Leads',
        Component: CRMLeadPage
    });
    routes.push({
        path: '/crm/meetings',
        exact: true,
        name: 'CRM Meetings',
        Component: CRMMeetingDashboard
    });
    routes.push({
        path: '/crm/meetings/:meetingId',
        exact: true,
        name: 'CRM Meetings',
        Component: CRMMeetingPage
    });
    routes.push({
        path: '/crm/deals',
        exact: true,
        name: 'CRM Deals',
        Component: CRMDealDashboard
    });
}

if (appConfig.AIEnable) {
    routes.push({
        path: '/document-modification/:documentsthreadId/survey',
        exact: true,
        name: 'CVMLRL Modification Thread',
        Component: CVMLRL_Modification_ThreadInput
    });
}

if (appConfig.meetingEnable) {
    routes.push({
        path: '/events/all',
        exact: true,
        name: '',
        Component: AllOfficeHours
    });
    routes.push({
        path: '/events/taiger/:user_id',
        exact: true,
        name: '',
        Component: TaiGerOfficeHours
    });
    routes.push({
        path: '/events/students/:user_id',
        exact: true,
        name: '',
        Component: OfficeHours
    });
}

if (appConfig.messengerEnable) {
    routes.push({
        path: '/communications/std/:studentId',
        errorElement: <DefaultErrorPage />,
        element: <CommunicationSinglePage />
    });
    routes.push({
        path: '/communications/t/:studentId',
        exact: true,
        name: 'All Chat',
        Component: CommunicationExpandPage
    });
    routes.push({
        path: '/doc-communications/:documentsthreadId?',
        name: 'All Chat',
        Component: DocumentCommunicatiomExpandPage
    });
}

export default routes;
