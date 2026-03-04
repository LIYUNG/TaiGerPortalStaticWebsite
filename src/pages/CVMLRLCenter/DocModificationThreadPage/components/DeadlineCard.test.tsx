import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import DeadlineCard from './DeadlineCard';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        TEAM_AGENT_LINK: (id: string) => `/teams/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/teams/editors/${id}`
    }
}));

const theme = createTheme();

const baseThread = {
    _id: 'thread-1',
    isFinalVersion: false,
    file_type: 'ML',
    program_id: null,
    student_id: { _id: 'student-1' },
    outsourced_user_id: []
} as any;

const baseUser = {
    _id: 'user-1',
    role: 'Student',
    firstname: 'Jane',
    lastname: 'Doe'
} as any;

const baseGradient = { start: '#1565c0', end: '#1976d2' };

const renderCard = (props = {}) =>
    render(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <DeadlineCard
                    deadline="2099-12-31"
                    deadlineGradient={baseGradient}
                    handleFavoriteToggle={vi.fn()}
                    isFavorite={false}
                    thread={baseThread}
                    urgent={false}
                    user={baseUser}
                    {...props}
                />
            </ThemeProvider>
        </MemoryRouter>
    );

describe('DeadlineCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with a deadline date', () => {
        renderCard({ deadline: '2099-12-31' });
        expect(screen.getByText('2099-12-31')).toBeInTheDocument();
    });

    it('renders the deadline label when not urgent', () => {
        renderCard({ urgent: false });
        expect(screen.getByText('Deadline')).toBeInTheDocument();
    });

    it('shows URGENT indicator when deadline is urgent', () => {
        renderCard({ urgent: true });
        expect(screen.getByText('URGENT')).toBeInTheDocument();
    });

    it('shows normal display (no URGENT) when deadline is far away', () => {
        renderCard({ urgent: false });
        expect(screen.queryByText('URGENT')).not.toBeInTheDocument();
    });

    it('shows star border icon when not favorited', () => {
        renderCard({ isFavorite: false });
        const button = screen.getByRole('button', { name: 'Add to favorites' });
        expect(button).toBeInTheDocument();
    });

    it('shows filled star icon when favorited', () => {
        renderCard({ isFavorite: true });
        const button = screen.getByRole('button', { name: 'Remove from favorites' });
        expect(button).toBeInTheDocument();
    });

    it('renders "Not Set" when no deadline provided', () => {
        renderCard({ deadline: '' });
        expect(screen.getByText('Not Set')).toBeInTheDocument();
    });
});
