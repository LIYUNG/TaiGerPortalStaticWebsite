import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: { toString: () => 'u1' }, role: 'Agent' } })
}));

vi.mock('@/api', () => ({
    getMyCommunicationThread: vi.fn(() =>
        Promise.resolve({
            data: { success: true, data: { students: [] } },
            status: 200
        })
    ),
    getQueryStudentResults: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: { students: [] } } })
    ),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getMyCommunicationQuery: vi.fn(() => ({
        queryKey: ['communications', 'my']
    }))
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(() => ({
        data: { data: { students: [] } },
        isLoading: false
    }))
}));

vi.mock('@utils/contants', () => ({
    Search: ({ children }: { children?: ReactNode }) => (
        <div data-testid="search">{children}</div>
    ),
    SearchIconWrapper: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    StyledInputBase: ({ onChange, inputProps }: any) => (
        <input
            data-testid="search-input"
            onChange={onChange}
            {...(inputProps ?? {})}
        />
    ),
    menuWidth: 300,
    EmbeddedChatListWidth: 300
}));

vi.mock('./Friends', () => ({
    default: () => <div data-testid="friends-list" />
}));

import ChatList from './index';

// Non-embedded (dropdown) mode — original ChatList behaviour
describe('ChatList (dropdown mode)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ChatList />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('search')).toBeDefined();
    });

    it('renders search input', () => {
        expect(screen.getByTestId('search-input')).toBeDefined();
    });

    it('renders Chat label', () => {
        expect(screen.getByText('Chat')).toBeDefined();
    });
});

describe('ChatList (dropdown) with handleCloseChat prop', () => {
    it('renders when handleCloseChat is provided', () => {
        render(
            <MemoryRouter>
                <ChatList handleCloseChat={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('search')).toBeDefined();
    });
});

// Embedded (sidebar) mode — original EmbeddedChatList behaviour
describe('ChatList (embedded mode)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ChatList embedded />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('search')).toBeDefined();
    });

    it('renders search input', () => {
        expect(screen.getByTestId('search-input')).toBeDefined();
    });

    it('renders friends list when not loading', () => {
        expect(screen.getByTestId('friends-list')).toBeDefined();
    });
});

describe('ChatList (embedded) with student_id prop', () => {
    it('renders with student_id prop', () => {
        render(
            <MemoryRouter>
                <ChatList embedded student_id="student123" />
            </MemoryRouter>
        );
        expect(screen.getByTestId('search')).toBeDefined();
    });
});
