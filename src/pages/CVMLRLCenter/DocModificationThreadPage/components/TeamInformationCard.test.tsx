import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import TeamInformationCard from './TeamInformationCard';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        TEAM_AGENT_LINK: (id: string) => `/teams/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/teams/editors/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: () => ({ children: 'AB', sx: {} })
}));

vi.mock('../../../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'Essay' }
}));

const theme = createTheme();

const makeUser = (overrides = {}) =>
    ({
        _id: 'user-1',
        role: 'Agent',
        firstname: 'Alice',
        lastname: 'Smith',
        pictureUrl: ''
    } as any);

const makeThread = (overrides = {}) =>
    ({
        _id: 'thread-1',
        file_type: 'ML',
        outsourced_user_id: [],
        student_id: { _id: 'student-1' },
        program_id: null,
        isFinalVersion: false,
        ...overrides
    } as any);

const teamGradient = { start: '#1565c0', end: '#1976d2' };

const renderCard = (props = {}) =>
    render(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <TeamInformationCard
                    agents={[]}
                    editors={[]}
                    startEditingEditor={vi.fn()}
                    teamGradient={teamGradient}
                    thread={makeThread()}
                    user={makeUser()}
                    {...props}
                />
            </ThemeProvider>
        </MemoryRouter>
    );

describe('TeamInformationCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Your Team heading', () => {
        renderCard();
        expect(screen.getByText('Your Team')).toBeInTheDocument();
    });

    it('renders with agents list showing agent names', () => {
        const agents = [
            { _id: 'a1', firstname: 'Bob', lastname: 'Jones', pictureUrl: '' },
            { _id: 'a2', firstname: 'Carol', lastname: 'White', pictureUrl: '' }
        ] as any;
        renderCard({ agents });
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Carol')).toBeInTheDocument();
    });

    it('renders with editors list showing editor names', () => {
        const editors = [
            { _id: 'e1', firstname: 'Dave', lastname: 'Brown', pictureUrl: '' }
        ] as any;
        renderCard({ editors });
        expect(screen.getByText('Dave')).toBeInTheDocument();
    });

    it('shows "No agents assigned" when agents list is empty', () => {
        renderCard({ agents: [] });
        expect(screen.getByText('No agents assigned')).toBeInTheDocument();
    });

    it('renders Agent label section', () => {
        renderCard();
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('renders Editor label section', () => {
        renderCard();
        expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('shows Essay Writer label when file_type is Essay', () => {
        renderCard({ thread: makeThread({ file_type: 'Essay' }) });
        expect(screen.getByText('Essay Writer')).toBeInTheDocument();
    });
});
