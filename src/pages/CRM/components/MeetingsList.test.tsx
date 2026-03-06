import { render, screen } from '@testing-library/react';
import MeetingsList from './MeetingsList';

vi.mock('@pages/CRM/components/meetingUtils', () => ({
    sanitizeMeetingTitle: vi.fn((title: string) => title)
}));

const t = (key: string) => key;

const baseMeeting = {
    id: 'meeting-1',
    title: 'Intro Call',
    date: '2024-03-15T10:00:00Z',
    summary: { gist: 'Discussed goals and next steps.' }
};

describe('MeetingsList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when meetings array is empty', () => {
        const { container } = render(<MeetingsList meetings={[]} t={t} />);
        expect(container.firstChild).toBeNull();
    });

    describe('with a single baseMeeting', () => {
        beforeEach(() => {
            render(<MeetingsList meetings={[baseMeeting]} t={t} />);
        });

        it('renders meeting title', () => {
            expect(screen.getByText('Intro Call')).toBeInTheDocument();
        });

        it('renders meeting date', () => {
            const dateStr = new Date(baseMeeting.date).toLocaleDateString();
            expect(screen.getByText(dateStr)).toBeInTheDocument();
        });

        it('renders meeting summary gist', () => {
            expect(
                screen.getByText('Discussed goals and next steps.')
            ).toBeInTheDocument();
        });

        it('renders a link to the meeting page', () => {
            const link = screen.getByRole('link', { name: 'Intro Call' });
            expect(link).toHaveAttribute('href', '/crm/meetings/meeting-1');
        });
    });

    it('renders no summary placeholder when gist is missing', () => {
        const meeting = { ...baseMeeting, summary: undefined };
        render(<MeetingsList meetings={[meeting]} t={t} />);
        expect(screen.getByText('common.noSummary')).toBeInTheDocument();
    });

    it('renders multiple meetings', () => {
        const meetings = [
            baseMeeting,
            {
                id: 'meeting-2',
                title: 'Follow Up',
                date: '2024-04-01T09:00:00Z',
                summary: { gist: 'Follow up notes' }
            }
        ];
        render(<MeetingsList meetings={meetings} t={t} />);
        expect(screen.getByText('Intro Call')).toBeInTheDocument();
        expect(screen.getByText('Follow Up')).toBeInTheDocument();
    });
});
