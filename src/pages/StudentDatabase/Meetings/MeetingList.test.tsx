import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MeetingList } from './MeetingList';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('./MeetingCard', () => ({
    MeetingCard: ({ meeting }: { meeting: { title: string } }) => (
        <div data-testid="meeting-card">{meeting.title}</div>
    )
}));

const onEdit = vi.fn();
const onDelete = vi.fn();
const onConfirm = vi.fn();

describe('MeetingList - empty state', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MeetingList
                    meetings={[]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onConfirm={onConfirm}
                />
            </MemoryRouter>
        );
    });

    it('shows no meetings found message when empty', () => {
        expect(screen.getByText(/no meetings found/i)).toBeInTheDocument();
    });
});

describe('MeetingList - with upcoming meetings', () => {
    const futureMeeting = {
        _id: 'm1',
        title: 'Future Meeting',
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        isConfirmed: false,
        isConfirmedReceiver: false,
        attended: false
    };

    beforeEach(() => {
        render(
            <MemoryRouter>
                <MeetingList
                    meetings={[futureMeeting]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onConfirm={onConfirm}
                />
            </MemoryRouter>
        );
    });

    it('renders upcoming meetings section', () => {
        expect(screen.getByText(/upcoming meetings/i)).toBeInTheDocument();
    });

    it('renders meeting card for upcoming meeting', () => {
        expect(screen.getByTestId('meeting-card')).toBeInTheDocument();
        expect(screen.getByText('Future Meeting')).toBeInTheDocument();
    });
});
