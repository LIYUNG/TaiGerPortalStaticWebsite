import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchoolDistributionPage from './SchoolDistributionPage';

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
        PROGRAMS_OVERVIEW: '/programs/overview'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useProgramsOverview', () => ({
    useProgramsOverview: () => ({
        data: {
            totalPrograms: 100,
            totalSchools: 50
        },
        isLoading: false,
        isError: false,
        error: null
    })
}));

vi.mock('@hooks/useSchoolsDistribution', () => ({
    useSchoolsDistribution: () => ({
        data: [
            { school: 'TU Berlin', country: 'Germany', city: 'Berlin', programCount: 20 },
            { school: 'LMU Munich', country: 'Germany', city: 'Munich', programCount: 15 }
        ],
        isLoading: false,
        isError: false,
        error: null
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

describe('SchoolDistributionPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SchoolDistributionPage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getAllByText('Schools Distribution')[0]).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
        expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    });

    it('renders school data in table', () => {
        expect(screen.getByText('TU Berlin')).toBeInTheDocument();
        expect(screen.getByText('LMU Munich')).toBeInTheDocument();
    });

    it('renders Back to Overview button', () => {
        expect(screen.getByRole('button', { name: /Back to Overview/i })).toBeInTheDocument();
    });
});
