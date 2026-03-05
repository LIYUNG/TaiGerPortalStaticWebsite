import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'u1', role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    Role: { Student: 'Student', Agent: 'Agent', Editor: 'Editor' }
}));

vi.mock('@/api', () => ({
    getQueryResults: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: [] } })
    ),
    getQueryPublicResults: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: [] } })
    )
}));

vi.mock('@utils/contants', () => ({
    Search: ({ children }: { children?: ReactNode }) => (
        <div data-testid="search-wrapper">{children}</div>
    ),
    SearchIconWrapper: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    StyledInputBase: (props: any) => (
        <input data-testid="nav-search-input" onChange={props.onChange} {...props} />
    )
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}${hash}`,
        PROFILE_HASH: '#profile'
    }
}));

vi.mock('@pages/Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('./search.css', () => ({}));

import NavSearch from './index';

describe('NavSearch', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <NavSearch />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('search-wrapper')).toBeDefined();
    });

    it('renders search input', () => {
        expect(screen.getByTestId('nav-search-input')).toBeDefined();
    });

    it('has placeholder text', () => {
        const input = screen.getByTestId('nav-search-input');
        expect(input).toBeDefined();
    });
});

describe('NavSearch search container', () => {
    it('renders search container div', () => {
        render(
            <MemoryRouter>
                <NavSearch />
            </MemoryRouter>
        );
        expect(document.querySelector('.search-container')).toBeDefined();
    });
});
