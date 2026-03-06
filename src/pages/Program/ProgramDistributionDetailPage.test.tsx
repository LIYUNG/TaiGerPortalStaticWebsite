import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramDistributionDetailPage from './ProgramDistributionDetailPage';

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
        useParams: () => ({ distributionType: 'country' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@hooks/useProgramsOverview', () => ({
    useProgramsOverview: () => ({
        data: {
            totalPrograms: 100,
            totalSchools: 50,
            byCountry: [{ country: 'Germany', count: 40 }, { country: 'USA', count: 30 }],
            byDegree: [{ degree: 'Master', count: 80 }],
            byLanguage: [{ language: 'English', count: 60 }],
            bySubject: [{ subject: 'CS', count: 30 }]
        },
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

describe('ProgramDistributionDetailPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramDistributionDetailPage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getAllByText('Programs by Country')[0]).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
        expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    });

    it('renders distribution items', () => {
        expect(screen.getByText('Germany')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('renders Back to Overview button', () => {
        expect(screen.getByRole('button', { name: /Back to Overview/i })).toBeInTheDocument();
    });
});
