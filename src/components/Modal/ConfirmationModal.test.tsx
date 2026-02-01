import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal } from './ConfirmationModal';

describe('ConfirmationModal', () => {
    it('renders when open', () => {
        render(
            <ConfirmationModal
                closeText="Cancel"
                confirmText="Confirm"
                content="Are you sure?"
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                open={true}
                title="Confirm action"
            />
        );
        expect(screen.getByText('Confirm action')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', async () => {
        const onConfirm = jest.fn();
        render(
            <ConfirmationModal
                closeText="Cancel"
                confirmText="Confirm"
                content="Content"
                onClose={jest.fn()}
                onConfirm={onConfirm}
                open={true}
                title="Title"
            />
        );
        await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
        expect(onConfirm).toHaveBeenCalled();
    });
});
