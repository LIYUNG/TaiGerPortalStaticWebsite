import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { is_TaiGer_role } from '@taiger-common/core';

import InterviewMetadataSidebar from './InterviewMetadataSidebar';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            _id: 'user-001',
            role: 'Student',
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'jane@example.com',
            timezone: 'Europe/Berlin'
        }
    })
}));

vi.mock('react-timezone-select', () => ({
    __esModule: true,
    default: () => <select data-testid="timezone-select" />
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
    AdapterDayjs: class {}
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
    LocalizationProvider: ({ children }: { children: ReactNode }) => (
        <>{children}</>
    )
}));

vi.mock('@mui/x-date-pickers/DesktopDateTimePicker', () => ({
    DesktopDateTimePicker: () => (
        <input data-testid="date-time-picker" type="text" />
    )
}));

vi.mock('@/api', () => ({
    getEssayWriters: vi.fn().mockResolvedValue({
        data: { data: [] }
    }),
    addInterviewTrainingDateTime: vi.fn().mockResolvedValue({
        data: { success: true }
    }),
    updateInterview: vi.fn().mockResolvedValue({
        data: { success: true }
    })
}));

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar">TopBar</div>
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main">Modal</div>
}));

vi.mock('../../Notes/NotesEditor', () => ({
    default: () => <div data-testid="notes-editor">NotesEditor</div>
}));

const mockTheme = createTheme();

const baseInterview = {
    _id: { toString: () => 'interview-001' },
    isClosed: false,
    trainer_id: [],
    student_id: {
        _id: { toString: () => 'student-001' },
        firstname: 'Alice',
        lastname: 'Smith',
        email: 'alice@example.com',
        pictureUrl: ''
    },
    program_id: {
        _id: { toString: () => 'program-001' },
        school: 'TU Munich',
        program_name: 'Computer Science',
        degree: 'MSc',
        semester: 'WS2024'
    },
    event_id: null,
    interview_date: null,
    interviewer: '',
    interview_description: null
};

const baseProps = {
    interview: baseInterview,
    openDeleteDocModalWindow: vi.fn(),
    theme: mockTheme,
    onInterviewUpdate: vi.fn()
};

const renderSidebar = (props = baseProps) =>
    render(
        <MemoryRouter>
            <InterviewMetadataSidebar {...props} />
        </MemoryRouter>
    );

describe('InterviewMetadataSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
    });

    it('renders without crashing', () => {
        renderSidebar();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('shows In Progress status when interview is not closed', () => {
        renderSidebar();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('shows Completed status when interview is closed', () => {
        renderSidebar({
            ...baseProps,
            interview: { ...baseInterview, isClosed: true }
        });
        expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('shows trainer assignment section', () => {
        renderSidebar();
        expect(screen.getByText('Trainer')).toBeInTheDocument();
        expect(screen.getByText('No Trainer Assigned')).toBeInTheDocument();
    });

    it('shows Assign Trainer button for admin/agent users', () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(true);
        renderSidebar();
        expect(
            screen.getByRole('button', { name: 'Assign Trainer' })
        ).toBeInTheDocument();
    });

    it('shows trainer names when trainers are assigned', () => {
        const interviewWithTrainer = {
            ...baseInterview,
            trainer_id: [
                {
                    _id: { toString: () => 'trainer-001' },
                    firstname: 'Bob',
                    lastname: 'Builder',
                    pictureUrl: ''
                }
            ]
        };
        renderSidebar({ ...baseProps, interview: interviewWithTrainer });
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('shows interview time section', () => {
        renderSidebar();
        expect(screen.getByText('Interview Training Time')).toBeInTheDocument();
    });

    it('shows "To be announced" when no meeting time is set for student', () => {
        renderSidebar();
        // "To be announced" appears for the time card when student has no event
        const announcements = screen.getAllByText('To be announced');
        expect(announcements.length).toBeGreaterThan(0);
    });

    it('shows meeting link section', () => {
        renderSidebar();
        expect(
            screen.getByText('Interview Training Meeting Link')
        ).toBeInTheDocument();
    });

    it('shows Join Meeting link when meeting link is available', () => {
        const interviewWithMeeting = {
            ...baseInterview,
            event_id: {
                _id: 'event-001',
                meetingLink: 'https://meet.example.com/test',
                start: '2024-01-15T10:00:00Z'
            }
        };
        renderSidebar({ ...baseProps, interview: interviewWithMeeting });
        expect(screen.getByText('Join Meeting')).toBeInTheDocument();
    });

    it('shows program information', () => {
        renderSidebar();
        expect(screen.getByText('Program Details')).toBeInTheDocument();
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('MSc')).toBeInTheDocument();
        expect(screen.getByText('WS2024')).toBeInTheDocument();
    });

    it('shows student information', () => {
        renderSidebar();
        expect(screen.getByText('Student Information')).toBeInTheDocument();
        expect(
            screen.getByText(
                (content) =>
                    content.includes('Alice') && content.includes('Smith')
            )
        ).toBeInTheDocument();
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });

    it('shows training documentation card', () => {
        renderSidebar();
        expect(
            screen.getByText('Interview Training Documentation')
        ).toBeInTheDocument();
        expect(screen.getByText('View Documentation')).toBeInTheDocument();
    });

    it('shows Interview Training Survey button', () => {
        renderSidebar();
        expect(
            screen.getByText('Interview Training Survey')
        ).toBeInTheDocument();
    });

    it('shows Official Details and Actions cards for TaiGer role users', () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(true);
        renderSidebar();
        expect(screen.getByText('Official Details')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('does not show Official Details card for non-TaiGer role users', () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
        renderSidebar();
        expect(screen.queryByText('Official Details')).not.toBeInTheDocument();
    });

    it('shows Delete Interview button for TaiGer role users', () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(true);
        renderSidebar();
        expect(screen.getByText('Delete Interview')).toBeInTheDocument();
    });
});
