import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import UsersList from './UsersList';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', () => ({
    Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
        createElement('a', { href: to }, children)
}));

vi.mock('@/api', () => ({
    deleteUser: vi.fn(),
    changeUserRole: vi.fn(),
    updateArchivUser: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getUsersQuery: vi.fn(() => ({ queryKey: ['users'], queryFn: vi.fn() }))
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-query')>();
    return {
        ...actual,
        useQuery: vi.fn(() => ({ data: [], isLoading: false })),
        useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
    };
});

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: () => ({})
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

// Mock heavy table deps
vi.mock('material-react-table', () => ({
    MaterialReactTable: () =>
        createElement('div', { 'data-testid': 'mrt-table' }),
    useMaterialReactTable: vi.fn(() => ({})),
    MRT_GlobalFilterTextField: () => null
}));

vi.mock('@components/table', async (orig) => ({
    ...(await orig<typeof import('@components/table')>()),
    useTableStyles: () => ({ toolbarStyle: {} })
}));

vi.mock('@components/table/users-table/table-config', () => ({
    getTableConfig: vi.fn(() => ({ initialState: {} }))
}));

vi.mock('@components/table/users-table/TopToolbar', () => ({
    TopToolbar: () => null
}));

vi.mock('./UsersListSubpage', () => ({
    default: () => createElement('div', { 'data-testid': 'subpage-modal' })
}));

vi.mock('./UserDeleteWarning', () => ({
    default: () => createElement('div', { 'data-testid': 'delete-warning' })
}));

vi.mock('./UserArchivWarning', () => ({
    default: () => createElement('div', { 'data-testid': 'archiv-warning' })
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string) => `/student/${id}`,
        TEAM_AGENT_LINK: (id: string) => `/agent/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editor/${id}`
    }
}));

const defaultProps = {
    queryString: { role: 'Student' } as never,
    openAddUserModal: vi.fn()
};

describe('UsersList', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the table component', () => {
        render(<UsersList {...defaultProps} />);
        expect(screen.getByTestId('mrt-table')).toBeInTheDocument();
    });

    it('renders the modal stubs', () => {
        render(<UsersList {...defaultProps} />);
        expect(screen.getByTestId('subpage-modal')).toBeInTheDocument();
        expect(screen.getByTestId('delete-warning')).toBeInTheDocument();
        expect(screen.getByTestId('archiv-warning')).toBeInTheDocument();
    });
});
