import { MouseEvent } from 'react';
import EventConfirmationCard from '@components/Calendar/components/EventConfirmationCard';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

export interface EventConfirmationListProps {
    events: EventConfirmationCardEvent[];
    /** Render the cards as read-only (Past section). */
    disabled?: boolean;
    handleConfirmAppointmentModalOpen: (
        e: MouseEvent,
        event: EventConfirmationCardEvent
    ) => void;
    handleEditAppointmentModalOpen: (
        e: MouseEvent,
        event: EventConfirmationCardEvent
    ) => void;
    handleDeleteAppointmentModalOpen: (
        e: MouseEvent,
        event: EventConfirmationCardEvent
    ) => void;
}

/**
 * Renders a list of `EventConfirmationCard`s. Extracted to replace the three
 * near-identical inline `.map(...)` blocks (Pending / Upcoming / Past) in the
 * office-hours list tab.
 */
export const EventConfirmationList = ({
    events,
    disabled,
    handleConfirmAppointmentModalOpen,
    handleEditAppointmentModalOpen,
    handleDeleteAppointmentModalOpen
}: EventConfirmationListProps) => (
    <>
        {events.map((event, i) => (
            <EventConfirmationCard
                disabled={disabled}
                event={event}
                handleConfirmAppointmentModalOpen={
                    handleConfirmAppointmentModalOpen
                }
                handleDeleteAppointmentModalOpen={
                    handleDeleteAppointmentModalOpen
                }
                handleEditAppointmentModalOpen={handleEditAppointmentModalOpen}
                key={event._id?.toString() ?? i}
            />
        ))}
    </>
);

export default EventConfirmationList;
