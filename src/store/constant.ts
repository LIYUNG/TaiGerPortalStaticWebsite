export interface DemoRoutes {
    AGENT_SUPPORT_DOCUMENTS: (tab: string) => string;
    ASSIGN_AGENT_LINK: string;
    ASSIGN_EDITOR_LINK: string;
    ASSIGN_ESSAY_WRITER_LINK: string;
    ASSIGN_INTERVIEW_TRAINER_LINK: string;
    ACCOUNTING_LINK: string;
    ACCOUNTING_USER_ID_LINK: (user_id: string) => string;
    BASE_DOCUMENTS_LINK: string;
    BLANK_LINK: string;
    COURSES_LINK: string;
    COURSES_INPUT_LINK: (student_id: string) => string;
    COURSES_ANALYSIS_RESULT_LINK: (student_id: string) => string;
    COURSES_ANALYSIS_EXPLANATION_LINK: string;
    COMMUNICATIONS_LINK: (student_id: string) => string;
    COMMUNICATIONS_TAIGER_MODE_LINK: (student_id: string) => string;
    CUSTOMER_CENTER_LINK: string;
    CUSTOMER_CENTER_ADD_TICKET_LINK: string;
    CUSTOMER_CENTER_TICKET_DETAIL_PAGE_LINK: (ticket_id: string) => string;
    CV_ML_RL_CENTER_LINK_TAB: (tab: string) => string;
    CV_ML_RL_DOCS_LINK: string;
    CV_ML_RL_DASHBOARD_LINK: string;
    DASHBOARD_LINK: string;
    DOCUMENT_MODIFICATION_LINK: (thread_id: string) => string;
    DOCS_ROOT_LINK: (category: string) => string;
    DOCUMENT_MODIFICATION_INPUT_LINK: (thread_id: string) => string;
    EVENT_STUDENT_LINK: string;
    EVENT_STUDENT_STUDENTID_LINK: (student_id: string) => string;
    EVENT_TAIGER_LINK: (user_id: string) => string;
    EVENT_TAIGER_USERID_LINK: string;
    FORGOT_PASSWORD_LINK: string;
    LANDING_PAGE_LINK: string;
    INTERVIEW_LINK: string;
    INTERVIEW_ADD_LINK: string;
    INTERVIEW_SINGLE_LINK: (interview_id: string) => string;
    INTERVIEW_SINGLE_SURVEY_LINK: (interview_id: string) => string;
    INTERNAL_WIDGET_COURSE_ANALYSER_LINK: string;
    INTERNAL_WIDGET_LINK: (user_id: string) => string;
    INTERNAL_WIDGET_V2_LINK: (user_id: string) => string;
    COURSES_ANALYSIS_RESULT_V2_LINK: (user_id: string) => string;
    INTERNAL_LOGS_LINK: string;
    INTERNAL_LOGS_USER_ID_LINK: (user_id: string) => string;
    LOGIN_LINK: string;
    MY_INTERVIEW_LINK: string;
    PROFILE: string;
    APPLICATION_HASH: string;
    PROFILE_HASH: string;
    CVMLRL_HASH: string;
    PORTAL_HASH: string;
    UNIASSIST_HASH: string;
    SURVEY_HASH: string;
    COURSES_HASH: string;
    NOTES_HASH: string;
    PROFILE_STUDENT_LINK: (user_id: string) => string;
    PROGRAMS: string;
    PROGRAMS_OVERVIEW: string;
    SCHOOL_CONFIG: string;
    NEW_PROGRAM: string;
    PROGRAM_EDIT: (program_id: string) => string;
    COURSE_DATABASE: string;
    COURSE_DATABASE_EDIT: (courseId: string) => string;
    COURSE_DATABASE_NEW: string;
    KEYWORDS_EDIT: string;
    KEYWORDS_NEW: string;
    CREATE_NEW_PROGRAM_ANALYSIS: string;
    EDIT_PROGRAM_ANALYSIS: (requirementId: string) => string;
    PROGRAM_ANALYSIS: string;
    SINGLE_PROGRAM_LINK: (program_id: string) => string;
    PORTALS_MANAGEMENT_LINK: string;
    PORTALS_MANAGEMENT_STUDENTID_LINK: (student_id: string) => string;
    SETTINGS: string;
    STUDENT_APPLICATIONS_LINK: string;
    STUDENT_APPLICATIONS_ID_LINK: (student_id: string) => string;
    STUDENT_DATABASE_STUDENTID_LINK: (
        student_id: string,
        path?: string
    ) => string;
    STUDENT_DATABASE_LINK: string;
    STUDENT_DATABASE_OVERVIEW: string;
    SURVEY_LINK: string;
    TEAM_ADMIN_LINK: (admin_id: string) => string;
    TEAM_AGENT_LINK: (agent_id: string) => string;
    TEAM_AGENT_ARCHIV_LINK: (agent_id: string) => string;
    TEAM_AGENT_PROFILE_LINK: (agent_id: string) => string;
    TEAM_EDITOR_LINK: (editor_id: string) => string;
    TEAM_EDITOR_ARCHIV_LINK: (editor_id: string) => string;
    TEAM_EDITOR_PROFILE_LINK: (editor_id: string) => string;
    TEAM_MANAGER_LINK: (manager_id: string) => string;
    CRM_LEAD_LINK: (leadId: string) => string;
    TEAM_MEMBERS_LINK: string;
    HOWTOSTART_DOCS_LINK: string;
    UNI_ASSIST_DOCS_LINK: string;
    VISA_DOCS_LINK: string;
    UNI_ASSIST_LINK: string;
}

const DEMO: DemoRoutes = {
    AGENT_SUPPORT_DOCUMENTS: (tab) => `/agent-support-documents#${tab}`,
    ASSIGN_AGENT_LINK: '/assignment/agents',
    ASSIGN_EDITOR_LINK: '/assignment/editors',
    ASSIGN_ESSAY_WRITER_LINK: '/assignment/essay-writers',
    ASSIGN_INTERVIEW_TRAINER_LINK: '/assignment/interview-trainers',
    ACCOUNTING_LINK: '/internal/accounting',
    ACCOUNTING_USER_ID_LINK: (user_id) =>
        `/internal/accounting/users/${user_id}`,
    BASE_DOCUMENTS_LINK: '/base-documents',
    BLANK_LINK: '#',
    COURSES_LINK: '/my-courses',
    COURSES_INPUT_LINK: (student_id) => `/my-courses/${student_id}`,
    COURSES_ANALYSIS_RESULT_LINK: (student_id) =>
        `/my-courses/analysis/${student_id}`,
    COURSES_ANALYSIS_EXPLANATION_LINK: '/docs/search/64c3817811e606a89a10ea47',
    COMMUNICATIONS_LINK: (student_id) => `/communications/std/${student_id}`,
    COMMUNICATIONS_TAIGER_MODE_LINK: (student_id) =>
        `/communications/t/${student_id}`,
    CUSTOMER_CENTER_LINK: '/customer-center',
    CUSTOMER_CENTER_ADD_TICKET_LINK: '/customer-center/add-ticket',
    CUSTOMER_CENTER_TICKET_DETAIL_PAGE_LINK: (ticket_id) =>
        `/customer-center/tickets/${ticket_id}`,
    CV_ML_RL_CENTER_LINK_TAB: (tab) => `/cv-ml-rl-center#${tab}`,
    CV_ML_RL_DOCS_LINK: '/docs/cv-ml-rl',
    CV_ML_RL_DASHBOARD_LINK: '/dashboard/cv-ml-rl',
    DASHBOARD_LINK: '/dashboard/default',
    DOCUMENT_MODIFICATION_LINK: (thread_id) =>
        `/document-modification/${thread_id}`,
    DOCS_ROOT_LINK: (category) => `/docs/${category}`,
    DOCUMENT_MODIFICATION_INPUT_LINK: (thread_id) =>
        `/document-modification/${thread_id}/survey`,
    EVENT_STUDENT_LINK: '/events/students',
    EVENT_STUDENT_STUDENTID_LINK: (student_id) =>
        `/events/students/${student_id}`,
    EVENT_TAIGER_LINK: (user_id) => `/events/taiger/${user_id}`,
    EVENT_TAIGER_USERID_LINK: '/events/taiger',
    FORGOT_PASSWORD_LINK: '/account/forgot-password',
    LANDING_PAGE_LINK: '/account/home',
    INTERVIEW_LINK: '/interview-training',
    INTERVIEW_ADD_LINK: '/interview-training/add',
    INTERVIEW_SINGLE_LINK: (interview_id) =>
        `/interview-training/${interview_id}`,
    INTERVIEW_SINGLE_SURVEY_LINK: (interview_id) =>
        `/interview-training/${interview_id}/survey`,
    INTERNAL_WIDGET_COURSE_ANALYSER_LINK: '/internal/widgets/course-analyser',
    INTERNAL_WIDGET_LINK: (user_id) => `/internal/widgets/${user_id}`,
    INTERNAL_WIDGET_V2_LINK: (user_id) =>
        `/internal/widgets/course-analyser/v2/${user_id}`,
    COURSES_ANALYSIS_RESULT_V2_LINK: (user_id) =>
        `/my-courses/analysis/v2/${user_id}`,
    INTERNAL_LOGS_LINK: '/internal/logs',
    INTERNAL_LOGS_USER_ID_LINK: (user_id) => `/internal/logs/${user_id}`,
    LOGIN_LINK: '/account/login',
    MY_INTERVIEW_LINK: '/interview-training/my-interviews',
    PROFILE: '/profile',
    APPLICATION_HASH: '#applications',
    PROFILE_HASH: '#profile',
    CVMLRL_HASH: '#cvmlrl',
    PORTAL_HASH: '#portal',
    UNIASSIST_HASH: '#uniassist',
    SURVEY_HASH: '#survey',
    COURSES_HASH: '#courses',
    NOTES_HASH: '#notes',
    PROFILE_STUDENT_LINK: (user_id) => `/profile/${user_id}`,
    PROGRAMS: '/programs',
    PROGRAMS_OVERVIEW: '/programs/overview',
    SCHOOL_CONFIG: '/programs/config',
    NEW_PROGRAM: '/programs/create',
    PROGRAM_EDIT: (program_id) => `/programs/${program_id}/edit`,
    COURSE_DATABASE: '/courses/analysis/courses/all',
    COURSE_DATABASE_EDIT: (courseId) =>
        `/courses/analysis/courses/edit/${courseId}`,
    COURSE_DATABASE_NEW: '/courses/analysis/courses/new',
    KEYWORDS_EDIT: '/courses/analysis/keywords',
    KEYWORDS_NEW: '/courses/analysis/keywords/new',
    CREATE_NEW_PROGRAM_ANALYSIS: '/courses/analysis/programs/requirements/new',
    EDIT_PROGRAM_ANALYSIS: (requirementId) =>
        `/courses/analysis/programs/requirements/${requirementId}`,
    PROGRAM_ANALYSIS: '/courses/analysis/programs',
    SINGLE_PROGRAM_LINK: (program_id) => `/programs/${program_id}`,
    PORTALS_MANAGEMENT_LINK: '/portal-informations',
    PORTALS_MANAGEMENT_STUDENTID_LINK: (student_id) =>
        `/portal-informations/${student_id}`,
    SETTINGS: '/settings',
    STUDENT_APPLICATIONS_LINK: '/student-applications',
    STUDENT_APPLICATIONS_ID_LINK: (student_id) =>
        `/student-applications/${student_id}`,
    STUDENT_DATABASE_STUDENTID_LINK: (student_id, path = '') =>
        `/student-database/${student_id}${path}`,
    STUDENT_DATABASE_LINK: '/student-database',
    STUDENT_DATABASE_OVERVIEW: '/student-database/overview',
    SURVEY_LINK: '/survey',
    TEAM_ADMIN_LINK: (admin_id) => `/teams/admins/${admin_id}`,
    TEAM_AGENT_LINK: (agent_id) => `/teams/agents/${agent_id}`,
    TEAM_AGENT_ARCHIV_LINK: (agent_id) => `/teams/agents/archiv/${agent_id}`,
    TEAM_AGENT_PROFILE_LINK: (agent_id) => `/teams/agents/profile/${agent_id}`,
    TEAM_EDITOR_LINK: (editor_id) => `/teams/editors/${editor_id}`,
    TEAM_EDITOR_ARCHIV_LINK: (editor_id) =>
        `/teams/editors/archiv/${editor_id}`,
    TEAM_EDITOR_PROFILE_LINK: (editor_id) =>
        `/teams/editors/profile/${editor_id}`,
    TEAM_MANAGER_LINK: (manager_id) => `/teams/managers/${manager_id}`,
    CRM_LEAD_LINK: (leadId) => `/crm/leads/${leadId}`,
    TEAM_MEMBERS_LINK: '/teams/members',
    HOWTOSTART_DOCS_LINK: '/docs/howtostart',
    UNI_ASSIST_DOCS_LINK: '/docs/uniassist',
    VISA_DOCS_LINK: '/docs/visa',
    UNI_ASSIST_LINK: '/uni-assist'
};

export default DEMO;
