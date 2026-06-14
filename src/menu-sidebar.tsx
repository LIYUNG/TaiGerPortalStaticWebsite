import { ReactNode } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EuroIcon from '@mui/icons-material/Euro';
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { appConfig } from './config';

export interface MenuItem {
    id: string;
    title: string;
    type: 'item' | 'collapse';
    icon: ReactNode;
    url?: string;
    target?: boolean;
    breadcrumbs?: boolean;
    classes?: string;
    children?: MenuItem[];
    tenant?: string;
}

const application_overview: MenuItem[] = [
    {
        id: 'applications_overview_stidemt',
        title: 'My Applications',
        type: 'item',
        icon: <ListAltOutlinedIcon />,
        url: '/student-applications',
        target: false
    },
    {
        id: 'my-documents',
        title: 'My Documents',
        type: 'item',
        url: '/base-documents',
        classes: 'nav-item',
        icon: <DescriptionOutlinedIcon />,
        target: false,
        breadcrumbs: false
    },
    {
        id: 'cvmlrl-overview',
        title: 'CV/ML/RL Center',
        type: 'item',
        url: '/cv-ml-rl-center',
        classes: 'nav-item',
        icon: <HistoryEduOutlinedIcon />,
        target: false,
        breadcrumbs: false
    },
    {
        id: 'application_portal_management',
        title: 'Portals Management',
        type: 'item',
        url: '/portal-informations',
        classes: 'nav-item',
        icon: <KeyOutlinedIcon />,
        target: false,
        breadcrumbs: false
    }
];

if (appConfig.vpdEnable) {
    application_overview.push({
        id: 'uni_assist_tasks',
        title: 'Uni-Assist Tasks',
        type: 'item',
        url: '/uni-assist',
        icon: <PublicOutlinedIcon />,
        target: false,
        breadcrumbs: false
    });
}

if (appConfig.interviewEnable) {
    application_overview.push({
        id: 'interview',
        title: 'Interview Center',
        type: 'item',
        url: '/interview-training',
        icon: <RecordVoiceOverOutlinedIcon />,
        target: false,
        breadcrumbs: false
    });
}

let all_students_nestedList: MenuItem[] = [
    {
        id: 'all-application-overview',
        title: 'All Students Applications Overview',
        type: 'item',
        url: '/all-students-applications',
        icon: <AssignmentTurnedInOutlinedIcon />
    },
    {
        id: 'all-base-documents-overview',
        title: 'All Documents',
        type: 'item',
        url: '/all-base-documents',
        icon: <FolderCopyOutlinedIcon />
    },
    {
        id: 'tasks_dashboard',
        title: 'Tasks Dashboard',
        type: 'item',
        url: '/dashboard/cv-ml-rl',
        icon: <FactCheckOutlinedIcon />
    },
    {
        id: 'essays_dashboard',
        title: 'Essay Dashboard',
        type: 'item',
        url: '/dashboard/essay',
        icon: <EditNoteOutlinedIcon />
    },
    ...(appConfig.interviewEnable
        ? [
              {
                  id: 'interview-training',
                  title: 'Interview Center',
                  type: 'item' as const,
                  icon: <RecordVoiceOverOutlinedIcon />,
                  url: '/interview-training'
              }
          ]
        : []),
    {
        id: 'customer-center',
        title: 'Customer Center',
        type: 'item',
        url: '/customer-center',
        icon: <SupportAgentOutlinedIcon />
    },
    {
        id: 'all-students-overview',
        title: 'All Active Student Overview',
        type: 'item',
        url: '/students-overview/all',
        icon: <GroupOutlinedIcon />
    },
    {
        id: 'internal_program_conflict',
        title: 'Program Conflicts',
        type: 'item',
        icon: <AssignmentLateOutlinedIcon />,
        url: '/internal/program-conflict'
    },
    {
        id: 'internal_program-task-delta',
        title: 'Program Task Diff',
        type: 'item',
        icon: <DifferenceOutlinedIcon />,
        url: '/internal/program-task-delta'
    },
    {
        id: 'admissions_overview',
        title: 'tenant-admissions',
        tenant: appConfig.companyName,
        type: 'item',
        icon: <EmojiEventsOutlinedIcon />,
        url: '/admissions-overview'
    }
];

if (appConfig.meetingEnable) {
    all_students_nestedList.push({
        id: 'all-calendar-events',
        title: 'Calendar Events',
        type: 'item',
        icon: <CalendarTodayOutlinedIcon />,
        url: '/events/all'
    });
}

all_students_nestedList = [
    ...all_students_nestedList,
    {
        id: 'prev_students_database',
        title: 'Students Database',
        type: 'item',
        url: '/student-database',
        classes: 'nav-item',
        icon: <PersonSearchOutlinedIcon />
    }
];

let documentations_nestedList: MenuItem[] = [
    {
        id: 'howtostart',
        title: 'How to Start',
        type: 'item',
        url: '/docs/howtostart',
        icon: <RocketLaunchOutlinedIcon />,
        target: false,
        breadcrumbs: false
    },
    {
        id: 'base-documents',
        title: 'Documents',
        type: 'item',
        url: '/docs/base-documents',
        icon: <DescriptionOutlinedIcon />,
        target: false,
        breadcrumbs: false
    },
    {
        id: 'cv-ml-rl',
        title: 'CV/ML/RL',
        type: 'item',
        url: '/docs/cv-ml-rl',
        icon: <HistoryEduOutlinedIcon />,
        target: false,
        breadcrumbs: false
    }
];

if (appConfig.vpdEnable) {
    documentations_nestedList.push({
        id: 'doc-uniassist',
        title: 'Uni-Assist',
        type: 'item',
        url: '/docs/uniassist',
        icon: <PublicOutlinedIcon />,
        target: false,
        breadcrumbs: false
    });
}

documentations_nestedList = [
    ...documentations_nestedList,
    {
        id: 'visa',
        title: 'Visa',
        type: 'item',
        url: '/docs/visa',
        icon: <FlightTakeoffOutlinedIcon />,
        target: false,
        breadcrumbs: false
    },
    {
        id: 'internal-docs',
        title: 'Internal Docs',
        type: 'item',
        url: '/docs/taiger/internal',
        icon: <ArticleOutlinedIcon />,
        target: false,
        breadcrumbs: false
    }
];

let taiger_teams_items: MenuItem[] = [
    {
        id: 'teams_member_permission',
        title: 'Permissions Management',
        type: 'item',
        icon: <AdminPanelSettingsOutlinedIcon />,
        url: '/teams/permissions'
    },
    {
        id: 'teams_member',
        title: 'tenant-members',
        tenant: appConfig.companyName,
        type: 'item',
        icon: <BadgeOutlinedIcon />,
        url: '/teams/members'
    }
];

taiger_teams_items = [
    ...taiger_teams_items,
    {
        id: 'internal_dashboard',
        title: 'tenant-dashboard',
        tenant: `${appConfig.companyName}`,
        type: 'item',
        icon: <DashboardOutlinedIcon />,
        url: '/dashboard/internal'
    },
    {
        id: 'internal_accounting',
        title: 'tenant-accounting',
        tenant: `${appConfig.companyName}`,
        type: 'item',
        icon: <EuroIcon />,
        url: '/internal/accounting'
    }
];

const MenuSidebar: MenuItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard/default',
        icon: <HomeOutlinedIcon />
    },
    {
        id: 'ai-assist',
        title: 'TaiGer AI',
        type: 'item',
        url: '/ai-assist',
        icon: <SmartToyOutlinedIcon />
    },
    {
        id: 'my-students',
        title: 'My Students',
        type: 'collapse',
        icon: <SupervisorAccountOutlinedIcon />,
        children: [
            {
                id: 'my-students-application-overview',
                title: 'Application Overview',
                type: 'item',
                url: '/student-applications',
                icon: <ListAltOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'base-documents',
                title: 'Documents',
                type: 'item',
                url: '/base-documents',
                classes: 'nav-item',
                icon: <DescriptionOutlinedIcon />
            },
            {
                id: 'my-students-overview',
                title: 'My Active Student Overview',
                type: 'item',
                url: '/students-overview',
                classes: 'nav-item',
                icon: <GroupOutlinedIcon />
            },
            {
                id: 'agent-support-documents',
                title: 'Agent Support Documents',
                type: 'item',
                url: '/agent-support-documents',
                icon: <LibraryBooksOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'editor_center',
                title: 'CV/ML/RL Center',
                type: 'item',
                url: '/cv-ml-rl-center',
                classes: 'nav-item',
                icon: <HistoryEduOutlinedIcon />
            },
            {
                id: 'archiv-student',
                title: 'My Archived Students',
                type: 'item',
                icon: <ArchiveOutlinedIcon />,
                url: '/archiv/students'
            }
        ]
    },
    {
        id: 'academicsurvey',
        title: 'My Profile',
        type: 'item',
        url: '/survey',
        icon: <AssignmentIndOutlinedIcon />
    },
    {
        id: 'my-courses',
        title: 'My Courses',
        type: 'item',
        url: '/my-courses',
        icon: <MenuBookOutlinedIcon />
    },
    {
        id: 'application_overivew',
        title: 'My Applications',
        type: 'collapse',
        classes: 'nav-item',
        icon: <FolderOpenOutlinedIcon />,
        children: application_overview
    },
    {
        id: 'user-list',
        title: 'User List',
        type: 'item',
        icon: <PeopleAltOutlinedIcon />,
        url: '/users'
    },
    {
        id: 'program-table',
        title: 'Program List',
        type: 'item',
        icon: <SchoolOutlinedIcon />,
        url: '/programs'
    },
    {
        id: 'all-students',
        title: 'All Students',
        type: 'collapse',
        icon: <GroupsOutlinedIcon />,
        children: all_students_nestedList
    },
    {
        id: 'tools-widgets',
        title: 'Tools',
        type: 'collapse',
        classes: 'nav-item',
        icon: <BuildOutlinedIcon />,
        children: [
            {
                id: 'course-analyser',
                title: 'Course Analyser',
                type: 'item',
                url: '/internal/widgets/course-analyser',
                icon: <BarChartIcon />,
                target: false,
                breadcrumbs: false
            }
        ]
    },
    {
        id: 'teams_overview',
        title: 'tenant-team',
        tenant: `${appConfig.companyName}`,
        type: 'collapse',
        classes: 'nav-item',
        icon: <Diversity3Icon />,
        children: taiger_teams_items
    },
    {
        id: 'contact_us',
        title: 'Contact Us',
        type: 'item',
        url: '/contact',
        classes: 'nav-item',
        icon: <LocalPostOfficeOutlinedIcon />
    },
    {
        id: 'internal-document-database',
        title: 'Docs Database',
        type: 'collapse',
        classes: 'nav-item',
        icon: <StorageOutlinedIcon />,
        children: [
            {
                id: 'documents-creation',
                title: 'Public Docs Database',
                type: 'item',
                url: '/internal/database/public-docs',
                icon: <FolderSharedOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'internal-documents-creation',
                title: 'Internal Docs Database',
                type: 'item',
                url: '/internal/database/internal-docs',
                icon: <FolderOutlinedIcon />,
                target: false,
                breadcrumbs: false
            }
        ]
    },
    {
        id: 'docs',
        title: 'Documentation',
        type: 'collapse',
        classes: 'nav-item',
        icon: <HelpOutlineIcon />,
        children: documentations_nestedList
    },
    {
        id: 'download',
        title: 'Download Center',
        type: 'item',
        url: '/download',
        classes: 'nav-item',
        icon: <DownloadOutlinedIcon />
    },
    {
        id: 'customer-center-student',
        title: 'Customer Center',
        type: 'item',
        url: '/customer-center',
        icon: <SupportAgentOutlinedIcon />
    }
];

if (appConfig.CRMEnable) {
    MenuSidebar.push({
        id: 'CRM',
        title: 'CRM',
        type: 'item',
        url: '/crm',
        icon: <BusinessCenterOutlinedIcon />,
        children: [
            {
                id: 'crm_overview',
                title: 'CRM Overview',
                type: 'item',
                url: '/crm',
                icon: <DashboardOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'crm_leads',
                title: 'Leads',
                type: 'item',
                url: '/crm/leads',
                icon: <ContactsOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'crm_deals',
                title: 'Deals',
                type: 'item',
                url: '/crm/deals',
                icon: <HandshakeOutlinedIcon />,
                target: false,
                breadcrumbs: false
            },
            {
                id: 'crm_meetings',
                title: 'Meetings',
                type: 'item',
                url: '/crm/meetings',
                icon: <EventOutlinedIcon />,
                target: false,
                breadcrumbs: false
            }
        ]
    });
}

export { MenuSidebar };
