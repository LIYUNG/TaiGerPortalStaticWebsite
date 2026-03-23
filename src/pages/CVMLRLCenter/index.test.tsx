import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CVMLRLCenter from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: { toString: () => 'a1' } } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        CV_ML_RL_DOCS_LINK: '/docs'
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('./CVMLRLOverview', () => ({
    default: () => <div data-testid="cvmlrl-overview" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/util_functions', () => ({
    open_tasks_v2: vi.fn(() => []),
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'Essay' },
    toogleItemInArray: vi.fn()
}));

vi.mock('@utils/contants', () => ({
    is_my_fav_message_status: vi.fn(() => false),
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    getMyStudentsThreads: vi.fn(() =>
        Promise.resolve({ data: { threads: [] }, success: true, status: 200 })
    ),
    getThreadsByStudent: vi.fn(() =>
        Promise.resolve({ data: { threads: [] }, success: true, status: 200 })
    ),
    putThreadFavorite: vi.fn(() =>
        Promise.resolve({ data: { success: true }, status: 200 })
    )
}));

describe('CVMLRLCenter (index)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CVMLRLCenter />
            </MemoryRouter>
        );
    });

    it('renders the loading state initially', () => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('shows the loading indicator before data is fetched', () => {
        const loading = screen.queryByTestId('loading');
        expect(loading).toBeInTheDocument();
    });

    it('does not render the CVMLRLOverview while loading', () => {
        expect(screen.queryByTestId('cvmlrl-overview')).not.toBeInTheDocument();
    });

    it('does not render error page while loading', () => {
        expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    });
});
