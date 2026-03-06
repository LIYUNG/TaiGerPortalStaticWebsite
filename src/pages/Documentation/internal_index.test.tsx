import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InternaldocsPage from './internal_index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: { role: 'Admin', _id: 'a1' }
    })
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('./DocPageView', () => ({
    default: () => <div data-testid="doc-page-view" />
}));

vi.mock('./DocPageEdit', () => ({
    default: () => <div data-testid="doc-page-edit" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@/api', () => ({
    getInternalDocumentationPage: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: {
                    text: JSON.stringify({ time: 1234567890, blocks: [] }),
                    author: 'Admin'
                }
            },
            status: 200
        })
    ),
    updateInternalDocumentationPage: vi.fn()
}));

describe('InternaldocsPage (internal_index)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <InternaldocsPage item="internal" />
            </MemoryRouter>
        );
    });

    it('renders loading state initially', () => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('does not render error page while loading', () => {
        expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    });

    it('does not show doc page view while loading', () => {
        expect(screen.queryByTestId('doc-page-view')).not.toBeInTheDocument();
    });

    it('does not render modal initially', () => {
        expect(screen.queryByTestId('modal-main')).not.toBeInTheDocument();
    });
});
