import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramList from './ProgramList';

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

vi.mock('@hooks/usePrograms', () => ({
    usePrograms: () => ({
        data: [
            { _id: 'p1', school: 'TU Berlin', program_name: 'CS', degree: 'Master' }
        ],
        isLoading: false,
        isError: false,
        error: null
    })
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('./ProgramsTable', () => ({
    ProgramsTable: () => <div data-testid="programs-table" />
}));

describe('ProgramList', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramList />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('Program List')).toBeInTheDocument();
    });

    it('renders ProgramsTable component', () => {
        expect(screen.getByTestId('programs-table')).toBeInTheDocument();
    });

    it('renders View Overview button', () => {
        expect(screen.getByRole('link', { name: /View Overview/i })).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
        expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    });
});
