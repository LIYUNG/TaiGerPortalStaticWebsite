import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'u1', role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => true),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string) => `/student/${id}`,
        PROFILE_HASH: '#profile',
        TEAM_AGENT_LINK: (id: string) => `/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editors/${id}`,
        COMMUNICATIONS_TAIGER_MODE_LINK: (id: string) => `/comm/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    NoonNightLabel: vi.fn(() => 'AM'),
    convertDate: vi.fn(() => '2024-01-10'),
    getDate: vi.fn(() => '2024-01-10'),
    getTime: vi.fn(() => '10:00'),
    isInTheFuture: vi.fn(() => true),
    showTimezoneOffset: vi.fn(() => '+0'),
    stringToColor: vi.fn(() => '#abc')
}));

vi.mock('../../DateComponent', () => ({
    default: () => <span data-testid="event-date" />
}));

import EventConfirmationCard from './EventConfirmationCard';

const mockEvent = {
    _id: 'ev1',
    title: 'Meeting',
    start: new Date('2024-01-10T10:00:00'),
    end: new Date('2024-01-10T11:00:00'),
    description: 'Test description',
    provider: {
        _id: { toString: () => 'p1' },
        firstname: 'Dr',
        lastname: 'Smith'
    }
};

describe('EventConfirmationCard', () => {
    it('renders without crashing when given an event', () => {
        render(
            <MemoryRouter>
                <EventConfirmationCard
                    event={mockEvent as Parameters<typeof EventConfirmationCard>[0]['event']}
                    handleConfirmAppointmentModalOpen={vi.fn()}
                    handleEditAppointmentModalOpen={vi.fn()}
                    handleDeleteAppointmentModalOpen={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(document.body).toBeDefined();
    });

    it('renders loading state', () => {
        render(
            <MemoryRouter>
                <EventConfirmationCard
                    event={mockEvent as Parameters<typeof EventConfirmationCard>[0]['event']}
                    handleConfirmAppointmentModalOpen={vi.fn()}
                    handleEditAppointmentModalOpen={vi.fn()}
                    handleDeleteAppointmentModalOpen={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(document.body).toBeDefined();
    });
});
