import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthProvider', () => ({
    useAuth: () => ({
        user: { _id: 'u1', role: 'Agent', timezone: 'UTC' }
    })
}));

vi.mock('@store/constant', () => ({
    default: { PROFILE: '/profile' }
}));

vi.mock('@utils/contants', () => ({
    getLocalTime: vi.fn((t: string) => t),
    getUTCTimezoneOffset: vi.fn(() => 0)
}));

import { CreateNewEventModal } from './CreateNewEventModal';

const mockStudents = [
    {
        _id: { toString: () => 's1' },
        firstname: 'Alice',
        lastname: 'Smith',
        firstname_chinese: '',
        lastname_chinese: ''
    }
];

const defaultProps = {
    available_termins: [{ start: '2024-06-01T10:00:00+00:00' }],
    handleUpdateTimeSlot: vi.fn(),
    handleSelectStudent: vi.fn(),
    students: mockStudents,
    newEventStart: '2024-06-01T10:00:00+00:00',
    events: [],
    handleModalCreateEvent: vi.fn(),
    handleNewEventModalClose: vi.fn(),
    isNewEventModalOpen: true,
    BookButtonDisable: false,
    student_id: ''
};

describe('CreateNewEventModal', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CreateNewEventModal {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('Create New Event')).toBeDefined();
    });

    it('renders Create and Cancel buttons', () => {
        expect(screen.getAllByText(/Create/)[0]).toBeDefined();
        expect(screen.getAllByText(/Cancel/)[0]).toBeDefined();
    });

    it('renders description textarea', () => {
        expect(screen.getByPlaceholderText('Description')).toBeDefined();
    });
});

describe('CreateNewEventModal closed', () => {
    it('does not render dialog content when closed', () => {
        render(
            <MemoryRouter>
                <CreateNewEventModal
                    {...defaultProps}
                    isNewEventModalOpen={false}
                />
            </MemoryRouter>
        );
        expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
});
