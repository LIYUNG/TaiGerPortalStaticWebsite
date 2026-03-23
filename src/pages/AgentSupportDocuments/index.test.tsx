import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'u1',
            firstname: 'Test',
            lastname: 'Agent'
        }
    })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        CV_ML_RL_DOCS_LINK: '/docs'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@hooks/useMyStudentsThreads', () => ({
    useMyStudentsThreads: vi.fn()
}));

vi.mock('@/api', () => ({
    putThreadFavorite: vi.fn()
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'essay_required' },
    open_tasks_v2: vi.fn(() => []),
    toogleItemInArray: vi.fn((arr: string[], _id: string) => arr)
}));

vi.mock('@utils/contants', () => ({
    is_my_fav_message_status: vi.fn(() => false),
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('../CVMLRLCenter/CVMLRLOverview', () => ({
    default: () => <div data-testid="cvmlrl-overview" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('query-string', () => ({
    default: { stringify: vi.fn(() => '') }
}));

import { useMyStudentsThreads } from '@hooks/useMyStudentsThreads';
import AgentSupportDocuments from './index';

describe('AgentSupportDocuments', () => {
    it('renders loading state initially', () => {
        vi.mocked(useMyStudentsThreads).mockReturnValue({
            data: { threads: [], success: false, status: 0 },
            isLoading: true,
            isError: false,
            error: null
        } as unknown as ReturnType<typeof useMyStudentsThreads>);
        render(
            <MemoryRouter>
                <AgentSupportDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeTruthy();
    });

    it('renders overview when loaded', () => {
        vi.mocked(useMyStudentsThreads).mockReturnValue({
            data: { threads: [], success: true, status: 200 },
            isLoading: false,
            isError: false,
            error: null
        } as unknown as ReturnType<typeof useMyStudentsThreads>);
        render(
            <MemoryRouter>
                <AgentSupportDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('cvmlrl-overview')).toBeInTheDocument();
    });
});
