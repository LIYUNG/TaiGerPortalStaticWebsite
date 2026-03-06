import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: vi.fn(() => ({ documentation_id: 'doc1' }))
}));

vi.mock('@/api', () => ({
    getDocumentation: vi.fn(() =>
        Promise.resolve({
            data: {
                data: {
                    _id: 'doc1',
                    title: 'Test Doc',
                    category: 'general',
                    text: JSON.stringify({ blocks: [], time: 0, version: '2' }),
                    author: 'Admin'
                },
                success: true
            },
            status: 200
        })
    ),
    updateDocumentation: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: {} }, status: 200 })
    )
}));

vi.mock('./SingleDocEdit', () => ({
    default: () => <div data-testid="single-doc-edit" />
}));

vi.mock('./DocPageView', () => ({
    default: () => <div data-testid="doc-page-view" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: () => undefined
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        DOCS_ROOT_LINK: (cat: string) => `/docs/${cat}`
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    documentation_categories: { general: 'General' }
}));

import SingleDoc from './SingleDoc';

describe('SingleDoc', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <SingleDoc />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <SingleDoc />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });
});
