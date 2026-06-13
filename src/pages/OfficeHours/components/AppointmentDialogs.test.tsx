import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmAppointmentDialog } from './ConfirmAppointmentDialog';
import { DeleteAppointmentDialog } from './DeleteAppointmentDialog';
import { EditAppointmentDialog } from './EditAppointmentDialog';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('ConfirmAppointmentDialog', () => {
    it('disables Yes when there is no description, enables + fires onConfirm otherwise', () => {
        const onConfirm = vi.fn();
        const { rerender } = render(
            <ConfirmAppointmentDialog
                bookButtonDisable={false}
                event={{ description: '' }}
                eventId="e1"
                onClose={vi.fn()}
                onConfirm={onConfirm}
                open
            />
        );
        expect(screen.getByRole('button', { name: 'Yes' })).toBeDisabled();

        rerender(
            <ConfirmAppointmentDialog
                bookButtonDisable={false}
                event={{ description: 'discuss visa' }}
                eventId="e1"
                onClose={vi.fn()}
                onConfirm={onConfirm}
                open
            />
        );
        const yes = screen.getByRole('button', { name: 'Yes' });
        expect(yes).toBeEnabled();
        fireEvent.click(yes);
        expect(onConfirm).toHaveBeenCalledWith(expect.anything(), 'e1', {
            description: 'discuss visa'
        });
    });
});

describe('DeleteAppointmentDialog', () => {
    it('requires a reason: the action is disabled until a reason is entered, then fires onDelete with it', () => {
        const onDelete = vi.fn();
        render(
            <DeleteAppointmentDialog
                bookButtonDisable={false}
                eventId="e2"
                onClose={vi.fn()}
                onDelete={onDelete}
                open
            />
        );
        const action = screen.getByRole('button', { name: /Cancel meeting/i });
        expect(action).toBeDisabled();

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'No longer available' }
        });
        expect(action).toBeEnabled();
        fireEvent.click(action);
        expect(onDelete).toHaveBeenCalledWith(
            expect.anything(),
            'e2',
            'No longer available'
        );
    });

    it('reject mode shows a Reject action/title', () => {
        render(
            <DeleteAppointmentDialog
                bookButtonDisable={false}
                eventId="e2"
                mode="reject"
                onClose={vi.fn()}
                onDelete={vi.fn()}
                open
            />
        );
        expect(
            screen.getByRole('button', { name: /Reject request/i })
        ).toBeInTheDocument();
    });

    it('stays disabled while a request is in flight even with a reason', () => {
        render(
            <DeleteAppointmentDialog
                bookButtonDisable
                eventId="e2"
                onClose={vi.fn()}
                onDelete={vi.fn()}
                open
            />
        );
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'reason' }
        });
        expect(
            screen.getByRole('button', { name: /Cancel meeting/i })
        ).toBeDisabled();
    });
});

describe('EditAppointmentDialog', () => {
    it('disables Update for empty description and fires onUpdate when filled', () => {
        const onUpdate = vi.fn();
        const { rerender } = render(
            <EditAppointmentDialog
                bookButtonDisable={false}
                event={{ description: '' }}
                eventId="e3"
                onClose={vi.fn()}
                onUpdate={onUpdate}
                onUpdateDescription={vi.fn()}
                open
            />
        );
        expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

        rerender(
            <EditAppointmentDialog
                bookButtonDisable={false}
                event={{ description: 'topic' }}
                eventId="e3"
                onClose={vi.fn()}
                onUpdate={onUpdate}
                onUpdateDescription={vi.fn()}
                open
            />
        );
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        expect(onUpdate).toHaveBeenCalledWith(expect.anything(), 'e3', {
            description: 'topic'
        });
    });
});
