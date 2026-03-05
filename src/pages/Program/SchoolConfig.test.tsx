import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchoolConfig from './SchoolConfig';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLoaderData: () => ({
            distinctSchools: Promise.resolve([
                { school: 'TU Berlin', count: 10, country: 'Germany' }
            ])
        })
    };
});

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('./SchoolConfigContent', () => ({
    default: () => <div data-testid="school-config-content" />
}));

describe('SchoolConfig', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SchoolConfig />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('school_config')).toBeInTheDocument();
    });

    it('renders SchoolConfigContent after data resolves', async () => {
        expect(await screen.findByTestId('school-config-content')).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', async () => {
        expect(await screen.findByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    });

    it('renders School Configuration breadcrumb text', async () => {
        expect(await screen.findByText('School Configuration')).toBeInTheDocument();
    });
});
