import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: { toString: () => 'u1' }, role: 'Agent' } })
}));

vi.mock('@/api', () => ({
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
    StyledInputBase: (props: any) => (
        <input
            data-testid="search-input"
            onChange={props.onChange}
            {...props}
        />
    ),
    EmbeddedChatListWidth: 300
}));

vi.mock('./Friends', () => ({
    default: () => <div data-testid="embedded-friends" />
}));

import EmbeddedChatList from './index';

describe('EmbeddedChatList', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EmbeddedChatList />
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
        expect(screen.getByTestId('embedded-friends')).toBeDefined();
    });
});

describe('EmbeddedChatList with student_id', () => {
    it('renders with student_id prop', () => {
        render(
            <MemoryRouter>
                <EmbeddedChatList student_id="student123" />
            </MemoryRouter>
        );
        expect(screen.getByTestId('search')).toBeDefined();
    });
});
