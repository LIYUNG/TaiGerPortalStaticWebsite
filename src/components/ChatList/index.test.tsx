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
    )
}));

vi.mock('@utils/contants', () => ({
    Search: ({ children }: { children?: ReactNode }) => (
        <div data-testid="search">{children}</div>
    ),
    SearchIconWrapper: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    StyledInputBase: ({ onChange, ...rest }: any) => (
        <input data-testid="search-input" onChange={onChange} {...rest} />
    ),
    menuWidth: 300
}));

vi.mock('./Friends', () => ({
    default: () => <div data-testid="friends-list" />
}));

import ChatList from './index';

describe('ChatList', () => {
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

describe('ChatList with handleCloseChat prop', () => {
    it('renders when handleCloseChat is provided', () => {
        render(
            <MemoryRouter>
                <ChatList handleCloseChat={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('search')).toBeDefined();
    });
});
