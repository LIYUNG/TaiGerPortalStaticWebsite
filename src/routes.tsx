import React from 'react';
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
    getProgramLoader,
    getProgramRequirementsV2Loader,
    getAllCoursesLoader,
    getCourseLoader,
    getAllOpenInterviewsLoader
} from '@api/dataLoader';
const Questionnaire = React.lazy(
    async () => await import('@pages/InterviewTraining/InterviewSurveyForm')
);
const AddInterview = React.lazy(
    async () => await import('@pages/InterviewTraining/AddInterview')
);
const CreateComplaintTicket = React.lazy(
    async () => await import('@pages/CustomerSupport/CreateTicket')
);
const CourseKeywordsOverviewNew = React.lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/CourseKeywordsEdit/CourseKeywordsNew'
        )
);

const DefaultErrorPage = React.lazy(
    async () => await import('@pages/Utils/DefaultErrorPage')
);

const StudentApplicationsAssignPage = React.lazy(
    async () => await import('@pages/StudentApplications/assignPage')
);
const ProgramRequirementsNewIndex = React.lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsNewIndex'
        )
);
const ProgramRequirementsEditIndex = React.lazy(
    async () =>
        await import(
            '@pages/CourseAnalysis/ProgramRequirements/ProgramRequirementsEditIndex'
        )
);

const DashboardDefault = React.lazy(
    async () => await import('@pages/Dashboard')
);

const CourseKeywordsEdit = React.lazy(
    async () => await import('@pages/CourseAnalysis/CourseKeywordsEdit')
);

const AllCourses = React.lazy(
    async () => await import('@pages/CourseAnalysis/AllCourses/AllCourses')
);

const CourseNew = React.lazy(
    async () => await import('@pages/CourseAnalysis/AllCourses/CourseNew')
);

const CourseEdit = React.lazy(
    async () => await import('@pages/CourseAnalysis/AllCourses/CourseEdit')
);

const ProgramRequirements = React.lazy(
    async () => await import('@pages/CourseAnalysis/ProgramRequirements')
);

const ArchivStudent = React.lazy(
    async () => await import('@pages/ArchivStudent/index')
);

const CommunicationSinglePage = React.lazy(
    async () => await import('@pages/Communications/CommunicationSinglePage')
);

const CommunicationExpandPage = React.lazy(
    async () => await import('@pages/Communications/CommunicationExpandPage')
);

const DocumentCommunicatiomExpandPage = React.lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/DocumentCommunicatiomExpandPage'
        )
);

const UniAssist = React.lazy(
    async () => await import('@pages/UniAssist/index')
);
const PortalCredentialPage = React.lazy(
    async () => await import('@pages/PortalCredentialPage/index')
);
const BaseDocuments = React.lazy(
    async () => await import('@pages/BaseDocuments/BaseDocuments')
);

const AllBaseDocuments = React.lazy(
    async () => await import('@pages/BaseDocuments/AllBaseDocuments')
);

const MyCourses = React.lazy(
    async () => await import('@pages/MyCourses/index')
);

const MyCoursesAnalysisV2 = React.lazy(
    async () => await import('@pages/MyCourses/CourseAnalysisV2')
);

const CoursesAnalysisWidget = React.lazy(
    async () => await import('@pages/MyCourses/CourseWidget')
);
const CVMLRLGenerator = React.lazy(
    async () => await import('@pages/TaiGerAI/CVMLRLGenerator')
);
const AgentSupportDocuments = React.lazy(
    async () => await import('@pages/AgentSupportDocuments/index')
);
const CVMLRLOverview = React.lazy(
    async () => await import('@pages/CVMLRLCenter/index')
);
const CVMLRLDashboard = React.lazy(
    async () => await import('@pages/CVMLRLCenter/indexAll')
);
const EssayDashboard = React.lazy(
    async () => await import('@pages/EssayDashboard/index')
);
const AllApplicantsOverview = React.lazy(
    async () => await import('@pages/ApplicantsOverview/allStudentIndex')
);
const CustomerSupport = React.lazy(
    async () => await import('@pages/CustomerSupport')
);

const CustomerTicketDetailPage = React.lazy(
    async () => await import('@pages/CustomerSupport/CustomerTicketDetailPage')
);

const MyStudentOverviewPage = React.lazy(
    async () => await import('@pages/StudentOverview/MyStudentsOverview')
);

const StudentOverviewPage = React.lazy(
    async () => await import('@pages/StudentOverview/index')
);

const CRMDashboard = React.lazy(async () => await import('@pages/CRM/index'));
const CRMLeadDashboard = React.lazy(
    async () => await import('@pages/CRM/LeadDashboard')
);
const CRMLeadPage = React.lazy(async () => await import('@pages/CRM/LeadPage'));
const CRMMeetingDashboard = React.lazy(
    async () => await import('@pages/CRM/MeetingDashboard')
);
const CRMMeetingPage = React.lazy(
    async () => await import('@pages/CRM/MeetingPage')
);
const CRMDealDashboard = React.lazy(
    async () => await import('@pages/CRM/DealDashboard')
);

const InternalDashboard = React.lazy(
    async () => await import('@pages/TaiGerOrg/InternalDashboard/index')
);
const Accounting = React.lazy(
    async () => await import('@pages/Accounting/index')
);
const SingleBalanceSheetOverview = React.lazy(
    async () => await import('@pages/Accounting/SingleBalanceSheetOverview')
);
const ProgramConflict = React.lazy(
    async () => await import('@pages/TaiGerOrg/ProgramConflict/index')
);
const ProgramTaskDelta = React.lazy(
    async () => await import('@pages/TaiGerOrg/ProgramTaskDelta/index')
);
const TaiGerPermissions = React.lazy(
    async () => await import('@pages/TaiGerOrg/index')
);
const TaiGerOrg = React.lazy(
    async () => await import('@pages/TaiGerOrg/TaiGerMember/index')
);
const TaiGerOrgAgent = React.lazy(
    async () => await import('@pages/TaiGerOrg/AgentPage')
);
const TaiGerMemberProfile = React.lazy(
    async () => await import('@pages/TaiGerPublicProfile/AgentProfile')
);
const AllOfficeHours = React.lazy(
    async () => await import('@pages/OfficeHours/all_index')
);
const TaiGerOfficeHours = React.lazy(
    async () => await import('@pages/OfficeHours/taiger_index')
);
const OfficeHours = React.lazy(
    async () => await import('@pages/OfficeHours/index')
);
const TaiGerOrgEditor = React.lazy(
    async () => await import('@pages/TaiGerOrg/EditorPage')
);
const TaiGerOrgAdmin = React.lazy(
    async () => await import('@pages/TaiGerOrg/AdminPage')
);
const ProgramList = React.lazy(
    async () => await import('@pages/Program/ProgramList')
);
const ProgramsOverviewPage = React.lazy(
    async () => await import('@pages/Program/ProgramsOverviewPage')
);
const ProgramDistributionDetailPage = React.lazy(
    async () => await import('@pages/Program/ProgramDistributionDetailPage')
);
const SchoolDistributionPage = React.lazy(
    async () => await import('@pages/Program/SchoolDistributionPage')
);
const ApplicationsOverview = React.lazy(
    async () => await import('@pages/ApplicantsOverview/index')
);
const LearningResources = React.lazy(
    async () => await import('@pages/LearningResources/index')
);
const ContactUs = React.lazy(async () => await import('@pages/Contact/index'));
const StudentApplications = React.lazy(
    async () =>
        await import('@pages/StudentApplications/StudentApplicationsIndividual')
);
const SingleProgram = React.lazy(
    async () => await import('@pages/Program/SingleProgram')
);
const ProgramEditPage = React.lazy(
    async () => await import('@pages/Program/ProgramEditPage')
);
const ProgramChangeRequestPage = React.lazy(
    async () => await import('@pages/Program/ProgramChangeRequestPage')
);
const ProgramCreatePage = React.lazy(
    async () => await import('@pages/Program/ProgramCreatePage')
);
const SchoolConfig = React.lazy(
    async () => await import('@pages/Program/SchoolConfig')
);
const UsersTable = React.lazy(
    async () => await import('@pages/Users/UsersTable')
);
const Survey = React.lazy(async () => await import('@pages/Survey/index'));
const Settings = React.lazy(async () => await import('@pages/Settings/index'));
const Profile = React.lazy(async () => await import('@pages/Profile/index'));
const Admissions = React.lazy(
    async () => await import('@pages/Admissions/Admissions')
);
const StudentDatabase = React.lazy(
    async () => await import('@pages/StudentDatabase/index')
);
const StudentDatabaseOverview = React.lazy(
    async () => await import('@pages/StudentDatabase/StudentDatabaseOverview')
);
const CVMLRL_Modification_Thread = React.lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocumentThreadsPage/SingleThreadPage'
        )
);

const CVMLRL_Modification_ThreadInput = React.lazy(
    async () =>
        await import(
            '@pages/CVMLRLCenter/DocModificationThreadPage/DocModificationThreadInput'
        )
);
const SingleStudentPage = React.lazy(
    async () => await import('@pages/StudentDatabase/SingleStudentPage')
);

const DocsApplication = React.lazy(
    async () => await import('@pages/Documentation/index')
);
const InternaldocsPage = React.lazy(
    async () => await import('@pages/Documentation/internal_index')
);
const DocsPage = React.lazy(
    async () => await import('@pages/Documentation/SingleDoc')
);
const DocsInternalPage = React.lazy(
    async () => await import('@pages/Documentation/SingleInternalDoc')
);
const DocCreatePage = React.lazy(
    async () => await import('@pages/Documentation/DocCreatePage')
);

const InternalDocCreatePage = React.lazy(
    async () => await import('@pages/Documentation/InternalDocCreatePage')
);

const InterviewTraining = React.lazy(
    async () => await import('@pages/InterviewTraining/index')
);

const SingleInterview = React.lazy(
    async () => await import('@pages/InterviewTraining/SingleInterview')
);

const Download = React.lazy(
    async () => await import('@pages/DownloadCenter/DownloadPage')
);

const AgentsAssignment = React.lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignAgents/index')
);

const EditorsAssignment = React.lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignEditors/index')
);

const EssayWritersAssignment = React.lazy(
    async () =>
        await import('@pages/AssignmentAgentsEditors/AssignEssayWriters/index')
);

const InterviewTrainersAssignment = React.lazy(
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
            { path: 'analysis/courses/new', element: <CourseNew /> },
            {
                path: 'analysis/courses/edit/:courseId',
                errorElement: <DefaultErrorPage />,
                loader: getCourseLoader,
                element: <CourseEdit />
            },
            {
                path: 'analysis/courses/all',
                errorElement: <DefaultErrorPage />,
                loader: getAllCoursesLoader,
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
                loader: getProgramLoader,
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
    routes.push({
        path: '/cvmlrl/generator',
        exact: true,
        name: 'CVMLRL Generator',
        Component: CVMLRLGenerator
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
