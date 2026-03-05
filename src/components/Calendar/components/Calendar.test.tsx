import { ReactNode } from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'u1', role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('react-big-calendar', () => ({
    Calendar: ({ children }: { children?: ReactNode }) => (
        <div data-testid="big-calendar">{children}</div>
    ),
    momentLocalizer: vi.fn(() => ({}))
}));

vi.mock('moment', () => ({
    default: vi.fn(() => ({}))
}));

vi.mock('@utils/contants', () => ({
    NoonNightLabel: vi.fn(() => 'AM'),
    stringToColor: vi.fn(() => '#aabbcc')
}));

vi.mock('./Popping', () => ({
    default: () => <div data-testid="popping" />
}));

vi.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}));

import MyCalendar from './Calendar';

const mockEvents = [
    {
        id: 'e1',
        title: 'Meeting',
        start: new Date('2024-01-10T10:00:00'),
        end: new Date('2024-01-10T11:00:00'),
        description: 'Test meeting'
    }
];

const defaultProps = {
    BookButtonDisable: false,
    events: mockEvents,
    selectedEvent: null,
    handleModalClose: vi.fn(),
    handleModalBook: vi.fn(),
    handleChange: vi.fn(),
    handleSelectEvent: vi.fn(),
    handleSelectSlot: vi.fn(),
    handleChangeReceiver: vi.fn(),
    newDescription: '',
    newReceiver: ''
};

describe('MyCalendar', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MyCalendar {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('big-calendar')).toBeDefined();
    });

    it('renders Popping component', () => {
        expect(screen.getByTestId('popping')).toBeDefined();
    });
});

describe('MyCalendar with selected event', () => {
    it('renders with a selected event', () => {
        render(
            <MemoryRouter>
                <MyCalendar
                    {...defaultProps}
                    selectedEvent={mockEvents[0]}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('big-calendar')).toBeDefined();
    });

    it('renders with BookButtonDisable true', () => {
        render(
            <MemoryRouter>
                <MyCalendar
                    {...defaultProps}
                    BookButtonDisable={true}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('big-calendar')).toBeDefined();
    });
});
