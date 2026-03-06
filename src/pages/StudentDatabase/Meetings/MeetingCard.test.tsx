import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MeetingCard } from './MeetingCard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

const mockMeeting = {
    _id: 'meeting1',
    title: 'Consultation Meeting',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    location: 'Zoom',
    description: 'Discuss application',
    notes: 'Bring documents',
    isConfirmed: false,
    isConfirmedReceiver: false,
    attended: false,
    meetingLink: 'https://zoom.us/j/123',
    agent: { firstname: 'John', lastname: 'Doe' }
};

const defaultProps = {
    meeting: mockMeeting,
    isPast: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onConfirm: vi.fn(),
    showActions: true
};

describe('MeetingCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MeetingCard {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders meeting title', () => {
        expect(screen.getByText('Consultation Meeting')).toBeInTheDocument();
    });

    it('renders meeting location', () => {
        expect(screen.getByText('Zoom')).toBeInTheDocument();
    });

    it('renders meeting description', () => {
        expect(screen.getByText('Discuss application')).toBeInTheDocument();
    });

    it('renders pending status chip for unconfirmed meeting', () => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });
});
