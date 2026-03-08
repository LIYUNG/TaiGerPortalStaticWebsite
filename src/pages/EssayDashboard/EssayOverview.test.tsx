import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EssayOverview from './EssayOverview';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student',
        PROFILE_HASH: '#profile',
        DOCUMENT_MODIFICATION_LINK: () => '/doc',
        TEAM_EDITOR_LINK: () => '/editor',
        TEAM_AGENT_LINK: () => '/agent'
    }
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({ default: () => <div>Modal</div> }));
vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="data-grid">DataGrid</div>
}));
vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children, index, value }: { children: React.ReactNode; index: number; value: number }) =>
        index === value ? <div>{children}</div> : null,
    a11yProps: () => ({})
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

const defaultProps = {
    handleFavoriteToggle: vi.fn(),
    no_essay_writer_tasks: [],
    new_message_tasks: [],
    fav_message_tasks: [],
    followup_tasks: [],
    pending_progress_tasks: [],
    closed_tasks: [],
    all_active_message_tasks: [],
    isLoading: false
};

describe('EssayOverview', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EssayOverview {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders NO ESSAY WRITER tab', () => {
        expect(screen.getByText(/no essay writer/i)).toBeInTheDocument();
    });

    it('renders TODO tab', () => {
        expect(screen.getByText(/todo/i)).toBeInTheDocument();
    });

    it('renders FOLLOW UP tab', () => {
        expect(screen.getByText(/follow up/i)).toBeInTheDocument();
    });

    it('renders data grid', () => {
        expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });
});
