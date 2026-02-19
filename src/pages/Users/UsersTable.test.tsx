import { createElement } from 'react';
import { render, screen } from '@testing-library/react';

import UsersTable from './UsersTable';
import { useAuth } from '@components/AuthProvider';

const mockUsersCount = {
    studentCount: 0,
    agentCount: 0,
    editorCount: 0,
    externalCount: 0,
    adminCount: 0
};

// Render without router: stub Navigate and Link so no router context is needed
vi.mock('react-router-dom', () => ({
    Navigate: () => null,
    Link: ({ children, to, ...props }: { to: string; children?: React.ReactNode }) =>
        createElement('a', { href: to, ...props }, children)
}));

vi.mock('@components/AuthProvider');
vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

// Avoid loading material-react-table and heavy table logic
vi.mock('./UsersList', () => ({
    default: () => createElement('div', { 'data-testid': 'users-list' })
}));
vi.mock('./AddUserModal', () => ({
    default: () => null
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-query')>();
    return {
        ...actual,
        useQuery: vi.fn((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[0];
            return {
                data: key === 'users/count' ? mockUsersCount : [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn()
            };
        }),
        useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false
        }))
    };
});

function renderUsersTable() {
    render(<UsersTable />);
}

describe('UsersTable', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: 'test-admin-id' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders without crashing', () => {
        renderUsersTable();
        expect(screen.getByTestId('users_table_page')).toBeInTheDocument();
    });
});
