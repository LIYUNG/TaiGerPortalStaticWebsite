import { ChangeEvent, ReactNode, Ref } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthProvider', () => {
    // Stable reference: the component's search effect depends on `user`, so a
    // fresh object each call would re-fire the effect every render.
    const user = { _id: 'u1', role: 'Agent' };
    return { useAuth: () => ({ user }) };
});

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

vi.mock('@utils/contants', async () => {
    // `forwardRef` is imported inside the factory because vi.mock is hoisted
    // above the file's imports. The real `Search` is a styled('div') that
    // forwards refs, and the component anchors a Popper to it via ref — so the
    // mock must forward the ref too, otherwise React warns.
    const { forwardRef } = await import('react');
    return {
        Search: forwardRef(
            (
                { children }: { children?: ReactNode },
                ref: Ref<HTMLDivElement>
            ) => (
                <div data-testid="search-wrapper" ref={ref}>
                    {children}
                </div>
            )
        ),
        SearchIconWrapper: ({ children }: { children?: ReactNode }) => (
            <div>{children}</div>
        ),
        StyledInputBase: ({
            inputProps,
            onChange
        }: {
            inputProps?: Record<string, unknown>;
            onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
        }) => (
            <input
                data-testid="nav-search-input"
                onChange={onChange}
                {...(inputProps ?? {})}
            />
        )
    };
});

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
