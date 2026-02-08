import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal } from './ConfirmationModal';

describe('ConfirmationModal', () => {
    test('renders when open', () => {
        const onClose = vi.fn(() => {});
        const onConfirm = vi.fn(() => {});
        render(
            <ConfirmationModal
                closeText="Cancel"
                confirmText="Confirm"
                content="Are you sure?"
                onClose={onClose}
                onConfirm={onConfirm}
                open={true}
                title="Confirm action"
            />
        );
        expect(screen.getByText('Confirm action')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Confirm/i })
        ).toBeInTheDocument();
    });

    test('calls onConfirm when confirm button clicked', async () => {
        const onConfirm = vi.fn(() => {});
        const onClose = vi.fn(() => {});
        render(
            <ConfirmationModal
                closeText="Cancel"
                confirmText="Confirm"
                content="Content"
                onClose={onClose}
                onConfirm={onConfirm}
                open={true}
                title="Title"
            />
        );
        await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
        expect(onConfirm).toHaveBeenCalled();
    });
});
