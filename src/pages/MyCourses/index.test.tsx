import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyCourses from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Student',
            _id: { toString: () => 's1' },
            archiv: false
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false),
    is_TaiGer_Guest: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student',
        PROFILE_HASH: '#profile',
        COMMUNICATIONS_TAIGER_MODE_LINK: () => '/comms',
        COURSES_ANALYSIS_RESULT_V2_LINK: () => '/analysis'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ student_id: 's1' }) };
});

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div>TopBar</div>
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('./ProgramRequirementsTableWrapper', () => ({
    ProgramRequirementsTableWrapper: () => (
        <div>ProgramRequirementsTableWrapper</div>
    )
}));

vi.mock('@/api', () => ({
    getMycourses: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: {
                    table_data_string: null,
                    table_data_string_taiger_guided: null,
                    table_data_string_locked: false,
                    analysis: { isAnalysedV2: false },
                    student_id: {
                        _id: { toString: () => 's1' },
                        firstname: 'Alice',
                        lastname: 'Wang',
                        archiv: false
                    },
                    updatedAt: '2025-01-01'
                }
            },
            status: 200
        })
    ),
    putMycourses: vi.fn(),
    transcriptanalyser_testV2: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getMycoursesQuery: () => ({ queryKey: ['my-courses'] })
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: React.ReactNode;
        index: number;
        value: number;
    }) => (index === value ? <div>{children}</div> : null),
    a11yProps: () => ({})
}));

vi.mock('react-datasheet-grid', () => ({
    DataSheetGrid: () => <div>DataSheetGrid</div>,
    textColumn: {},
    keyColumn: (_k: string, c: unknown) => c
}));

vi.mock('./react-datasheet-customize.css', () => ({}));

vi.mock('@utils/contants', () => ({
    convertDate: (d: string) => d
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('MyCourses', () => {
    it('renders loading initially', () => {
        render(
            <MemoryRouter>
                <MyCourses />
            </MemoryRouter>
        );
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('renders course data after loading', async () => {
        render(
            <MemoryRouter>
                <MyCourses />
            </MemoryRouter>
        );
        expect(await screen.findByText(/my courses/i)).toBeInTheDocument();
    });

    it('renders breadcrumb after loading', async () => {
        render(
            <MemoryRouter>
                <MyCourses />
            </MemoryRouter>
        );
        expect(await screen.findByText('TaiGer')).toBeInTheDocument();
    });
});
