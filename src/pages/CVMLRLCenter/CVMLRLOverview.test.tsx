import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CVMLRLOverview from './CVMLRLOverview';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student/123',
        DOCUMENT_MODIFICATION_LINK: () => '/doc/123',
        PROFILE_HASH: '#profile'
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@utils/contants', () => ({
    ATTRIBUTES: Array.from({ length: 12 }, (_, i) => ({ definition: `def${i}` })),
    COLORS: {},
    THREADS_TABLE_TABS: {},
    THREADS_TABLE_REVERSED_TABS: {}
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Banner/Banner', () => ({
    default: ({ text }: { text: string }) => <div data-testid="banner">{text}</div>
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children, index, value }: { children: React.ReactNode; index: number; value: number }) =>
        index === value ? <div data-testid={`tab-panel-${index}`}>{children}</div> : null,
    a11yProps: () => ({})
}));

vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: ({ rows }: { rows: unknown[] }) => (
        <div data-testid="mui-data-grid">{rows?.length ?? 0} rows</div>
    )
}));

vi.mock('../Utils/util_functions', () => ({
    APPROVAL_COUNTRIES: ['germany', 'austria', 'switzerland']
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: () => ({ hash: '' })
    };
});

const mockTasks = [
    {
        id: '1',
        show: true,
        isFinalVersion: false,
        file_type: 'CV',
        student_id: 'student1',
        flag_by_user_id: [],
        latest_message_left_by_id: 'a1'
    }
];

const defaultProps = {
    handleFavoriteToggle: vi.fn(),
    new_message_tasks: mockTasks,
    fav_message_tasks: [],
    followup_tasks: [],
    pending_progress_tasks: [],
    closed_tasks: [],
    isLoaded: true,
    success: true
};

describe('CVMLRLOverview', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CVMLRLOverview {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders tabs', () => {
        expect(screen.getByRole('tab', { name: /TODO/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /My Favorites/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Follow up/i })).toBeInTheDocument();
    });

    it('renders the first tab panel by default', () => {
        expect(screen.getByTestId('tab-panel-0')).toBeInTheDocument();
    });

    it('renders a MuiDataGrid in the active tab', () => {
        expect(screen.getByTestId('mui-data-grid')).toBeInTheDocument();
    });

    it('renders a banner in the first tab', () => {
        expect(screen.getByTestId('banner')).toBeInTheDocument();
    });
});
