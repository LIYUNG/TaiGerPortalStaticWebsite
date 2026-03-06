import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Documentation from './index';

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

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ category: 'cv' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@taiger-common/core', () => ({
    Role: { Admin: 'Admin', Editor: 'Editor', Agent: 'Agent', Student: 'Student' }
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

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    valid_categories: [{ key: 'cv', value: 'CV Guide' }]
}));

vi.mock('@/api', () => ({
    getCategorizedDocumentationPage: vi.fn(() =>
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
    updateDocumentationPage: vi.fn()
}));

describe('Documentation (index)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Documentation />
            </MemoryRouter>
        );
    });

    it('renders loading state initially', () => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('does not render error page while loading', () => {
        expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    });

    it('does not show the doc page view while loading', () => {
        expect(screen.queryByTestId('doc-page-view')).not.toBeInTheDocument();
    });

    it('does not render modal initially', () => {
        expect(screen.queryByTestId('modal-main')).not.toBeInTheDocument();
    });
});
