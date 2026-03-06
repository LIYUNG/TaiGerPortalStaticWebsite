import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: () => true,
    is_TaiGer_AdminAgent: () => true,
    is_TaiGer_Admin: () => true
}));

vi.mock('@/api', () => ({
    getAllDocumentations: vi.fn(() =>
        Promise.resolve({ data: { data: [], success: true }, status: 200 })
    ),
    createDocumentation: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: {} }, status: 200 })
    ),
    deleteDocumentation: vi.fn(() =>
        Promise.resolve({ data: { success: true }, status: 200 })
    )
}));

vi.mock('./DocumentsListItems', () => ({
    default: ({ document }: { document: { title: string } }) => (
        <div data-testid="doc-list-item">{document.title}</div>
    )
}));

vi.mock('./DocumentsListItemsEditor', () => ({
    default: () => <div data-testid="docs-list-editor" />
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
        DASHBOARD_LINK: '/dashboard'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    valid_categories: [{ key: 'general', value: 'General' }],
    documentation_categories: { general: 'General' }
}));

import DocCreatePage from './DocCreatePage';

describe('DocCreatePage', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <DocCreatePage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <DocCreatePage />
            </MemoryRouter>
        );
        // Component should render (either loading or content)
        expect(document.body).toBeTruthy();
    });
});
