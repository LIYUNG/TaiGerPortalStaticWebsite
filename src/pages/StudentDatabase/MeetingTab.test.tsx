import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: vi.fn()
    })),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
        isLoading: false
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn()
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@/api', () => ({
    getEvents: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    postEvent: vi.fn(),
    updateEvent: vi.fn(),
    confirmEvent: vi.fn(),
    deleteEvent: vi.fn()
}));

vi.mock('./Meetings/MeetingList', () => ({
    MeetingList: () => <div data-testid="meeting-list" />
}));

vi.mock('./Meetings/MeetingFormModal', () => ({
    MeetingFormModal: () => <div data-testid="meeting-form-modal" />
}));

vi.mock('@components/Modal/ConfirmationModal', () => ({
    ConfirmationModal: () => <div data-testid="confirmation-modal" />
}));

import { MeetingTab } from './MeetingTab';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('MeetingTab', () => {
    it('renders without crashing', () => {
        render(<MeetingTab student={null} studentId="std1" />, { wrapper });
        expect(document.body.innerHTML).not.toBe('');
    });

    it('renders the Arrange Meeting button', () => {
        render(<MeetingTab student={null} studentId="std1" />, { wrapper });
        // "Arrange Meeting" appears in both the header button and the empty-state button
        const buttons = screen.getAllByText('Arrange Meeting');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('shows no meetings message when there are no meetings', () => {
        render(<MeetingTab student={null} studentId="std1" />, { wrapper });
        expect(screen.getByText('No meetings scheduled yet')).toBeTruthy();
    });
});
