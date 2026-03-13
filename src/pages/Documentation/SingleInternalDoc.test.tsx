import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: vi.fn(() => ({ documentation_id: 'idoc1' }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: () => true
}));

vi.mock('@/api', () => ({
    getInternalDocumentation: vi.fn(() =>
        Promise.resolve({
            data: {
                data: {
                    _id: 'idoc1',
                    title: 'Internal Doc',
                    category: 'internal',
                    text: JSON.stringify({ blocks: [], time: 0, version: '2' }),
                    author: 'Agent',
                    internal: true
                },
                success: true
            },
            status: 200
        })
    ),
    updateInternalDocumentation: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: {} }, status: 200 })
    )
}));

vi.mock('./SingleDocEdit', () => ({
    default: () => <div data-testid="single-doc-edit" />
}));

vi.mock('./DocPageView', () => ({
    default: () => <div data-testid="doc-page-view" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard'
    }
}));

import SingleInternalDoc from './SingleInternalDoc';

describe('SingleInternalDoc', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <SingleInternalDoc />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <SingleInternalDoc />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });
});
