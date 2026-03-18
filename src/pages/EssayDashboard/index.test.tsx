import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EssayDashboard from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('./EssayOverview', () => ({
    default: () => <div data-testid="essay-overview">EssayOverview</div>
}));

vi.mock('@hooks/useActiveThreads', () => ({
    useActiveThreads: () => ({
        data: [],
        isLoading: false,
        queryKey: ['threads']
    })
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: () => ({ mutate: vi.fn() })
}));

vi.mock('@/api', () => ({
    putThreadFavorite: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('../Utils/util_functions', () => ({
    file_category_const: { essay_required: 'essay_required' },
    open_tasks_v2: vi.fn(() => [])
}));

vi.mock('@utils/contants', () => ({
    is_my_fav_message_status: vi.fn(() => false),
    is_new_message_status: vi.fn(() => false),
    is_pending_status: vi.fn(() => false)
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('EssayDashboard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EssayDashboard />
            </MemoryRouter>
        );
    });

    it('renders breadcrumbs', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders Essay Dashboard breadcrumb label', () => {
        expect(screen.getByText(/essay dashboard/i)).toBeInTheDocument();
    });

    it('renders EssayOverview component', () => {
        expect(screen.getByTestId('essay-overview')).toBeInTheDocument();
    });
});
