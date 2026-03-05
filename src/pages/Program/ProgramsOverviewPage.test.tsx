import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramsOverviewPage from './ProgramsOverviewPage';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs',
        PROGRAMS_OVERVIEW: '/programs/overview',
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@hooks/useProgramsOverview', () => ({
    useProgramsOverview: () => ({
        data: {
            totalPrograms: 100,
            totalSchools: 50,
            generatedAt: new Date().toISOString(),
            byCountry: [{ country: 'Germany', count: 40 }],
            byDegree: [{ degree: 'Master', count: 80 }],
            byLanguage: [{ language: 'English', count: 60 }],
            bySubject: [{ subject: 'CS', count: 30 }],
            bySchoolType: [{ schoolType: 'University', count: 50 }],
            topSchools: [],
            topApplicationPrograms: [{ admissionRate: 50 }],
            topContributors: [],
            recentlyUpdated: [
                {
                    _id: 'p1',
                    school: 'TU Berlin',
                    program_name: 'CS',
                    degree: 'Master',
                    semester: 'WS',
                    whoupdated: 'Admin',
                    updatedAt: new Date().toISOString()
                }
            ]
        },
        isLoading: false,
        isError: false,
        error: null,
        queryKey: ['programs-overview']
    })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('./components/SummaryStatsGrid', () => ({
    default: () => <div data-testid="summary-stats-grid" />
}));

vi.mock('./components/DistributionAnalysisSection', () => ({
    default: () => <div data-testid="distribution-analysis-section" />
}));

vi.mock('./components/TopPerformersSection', () => ({
    default: () => <div data-testid="top-performers-section" />
}));

vi.mock('./components/AdditionalInsightsSection', () => ({
    default: () => <div data-testid="additional-insights-section" />
}));

describe('ProgramsOverviewPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramsOverviewPage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getAllByText('Programs Overview')[0]).toBeInTheDocument();
    });

    it('renders summary stats grid', () => {
        expect(screen.getByTestId('summary-stats-grid')).toBeInTheDocument();
    });

    it('renders recently updated programs section', () => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('renders View All Programs button', () => {
        expect(screen.getByRole('link', { name: 'View All Programs' })).toBeInTheDocument();
    });
});
