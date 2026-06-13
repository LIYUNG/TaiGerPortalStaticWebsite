import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventConfirmationList } from './EventConfirmationList';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

// Stub the heavy card so the list test stays isolated from theme/auth/router.
vi.mock('@components/Calendar/components/EventConfirmationCard', () => ({
    default: ({
        event,
        disabled
    }: {
        event: EventConfirmationCardEvent;
        disabled?: boolean;
    }) => (
        <div data-disabled={String(Boolean(disabled))} data-testid="ecc">
            {String(event._id)}
        </div>
    )
}));

const handlers = {
    handleConfirmAppointmentModalOpen: vi.fn(),
    handleEditAppointmentModalOpen: vi.fn(),
    handleDeleteAppointmentModalOpen: vi.fn()
};

const ev = (id: string): EventConfirmationCardEvent => ({
    _id: id,
    start: '2999-01-01T09:00:00.000Z',
    end: '2999-01-01T09:30:00.000Z'
});

describe('EventConfirmationList', () => {
    it('renders one card per event', () => {
        render(
            <EventConfirmationList
                events={[ev('a'), ev('b'), ev('c')]}
                {...handlers}
            />
        );
        expect(screen.getAllByTestId('ecc')).toHaveLength(3);
    });

    it('renders nothing for an empty list', () => {
        render(<EventConfirmationList events={[]} {...handlers} />);
        expect(screen.queryByTestId('ecc')).toBeNull();
    });

    it('forwards the disabled flag to every card', () => {
        render(
            <EventConfirmationList disabled events={[ev('a')]} {...handlers} />
        );
        expect(screen.getByTestId('ecc').getAttribute('data-disabled')).toBe(
            'true'
        );
    });
});
