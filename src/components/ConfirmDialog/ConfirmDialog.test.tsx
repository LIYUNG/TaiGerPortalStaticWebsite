import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './index';

describe('ConfirmDialog', () => {
    it('renders when open with title and content', () => {
        render(
            <ConfirmDialog
                open
                onClose={vi.fn()}
                title="Warning"
                content="Do you want to archiv Bob - Smith?"
            />
        );
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(
            screen.getByText('Do you want to archiv Bob - Smith?')
        ).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmDialog
                open
                onClose={vi.fn()}
                title="Confirm"
                content="Proceed?"
                variant="confirm"
                confirmLabel="Yes"
                cancelLabel="No"
                onConfirm={onConfirm}
            />
        );
        fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
        const onClose = vi.fn();
        render(
            <ConfirmDialog
                open
                onClose={onClose}
                title="Confirm"
                content="Proceed?"
                variant="confirm"
                cancelLabel="No"
            />
        );
        fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders content as ReactNode', () => {
        render(
            <ConfirmDialog
                open
                onClose={vi.fn()}
                title="Warning"
                content={
                    <>
                        Do you want to archiv <b>Alice - Smith</b>?
                    </>
                }
            />
        );
        const bold = screen.getByText(
            (_, el) => el?.tagName === 'B' && el.textContent === 'Alice - Smith'
        );
        expect(bold).toBeInTheDocument();
    });
});
