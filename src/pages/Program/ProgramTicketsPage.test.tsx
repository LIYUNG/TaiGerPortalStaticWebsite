import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ProgramTicketsPage from './ProgramTicketsPage';
import { useProgramTickets } from '@hooks/useProgramTickets';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

vi.mock('../../config', () => ({ appConfig: { companyName: 'TaiGer' } }));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/table', () => ({
    getTableConfig: vi.fn(() => ({})),
    useTableStyles: vi.fn(() => ({ toolbarStyle: {} }))
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        DASHBOARD_LINK: '/dashboard',
        PROGRAMS: '/programs'
    }
}));

vi.mock('@hooks/useProgramTickets', () => ({
    useProgramTickets: vi.fn()
}));

const mockedHook = vi.mocked(useProgramTickets);

// Module-scoped constants keep referential identity across renders so the
// debounce effect doesn't churn.
const ticket = {
    _id: 't1',
    type: 'program',
    status: 'open',
    description: 'Deadline is wrong, please update',
    program_id: { _id: 'p1', school: 'MIT', program_name: 'CS MSc' },
    requester_id: { _id: 'u1', firstname: 'John', lastname: 'Doe' },
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-05T00:00:00.000Z'
};

const withData = {
    data: { tickets: [ticket], total: 1, page: 1, limit: 20 },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false
} as unknown as ReturnType<typeof useProgramTickets>;

const empty = {
    data: { tickets: [], total: 0, page: 1, limit: 20 },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false
} as unknown as ReturnType<typeof useProgramTickets>;

const errored = {
    data: undefined,
    isLoading: false,
    isError: true,
    error: new Error('boom'),
    isFetching: false
} as unknown as ReturnType<typeof useProgramTickets>;

const renderPage = () =>
    render(
        <MemoryRouter>
            <ProgramTicketsPage />
        </MemoryRouter>
    );

beforeEach(() => {
    mockedHook.mockReset();
    mockedHook.mockReturnValue(withData);
});

describe('ProgramTicketsPage', () => {
    it('renders the program link, requester and description in the table', () => {
        renderPage();
        expect(screen.getByText('MIT - CS MSc')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(
            screen.getByText('Deadline is wrong, please update')
        ).toBeInTheDocument();
    });

    it('renders a "Last update" (updatedAt) column header', () => {
        renderPage();
        expect(screen.getByText('Last update')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('queries page 1 / 20 sorted by createdAt desc on mount', () => {
        renderPage();
        const firstArgs = mockedHook.mock.calls[0][0];
        expect(firstArgs).toMatchObject({
            page: 1,
            limit: 20,
            status: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
    });

    it('shows the empty state when there are no tickets', () => {
        mockedHook.mockReturnValue(empty);
        renderPage();
        expect(screen.queryByText('MIT - CS MSc')).not.toBeInTheDocument();
    });

    it('renders the error page when the query errors', () => {
        mockedHook.mockReturnValue(errored);
        renderPage();
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });
});
