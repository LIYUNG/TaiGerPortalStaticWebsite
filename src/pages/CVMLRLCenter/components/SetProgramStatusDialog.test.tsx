import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SetProgramStatusDialog from './SetProgramStatusDialog';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    isApplicationSubmitted: false,
    isLoaded: true,
    studentFirstname: 'Alice',
    onConfirm: vi.fn()
};

describe('SetProgramStatusDialog', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders when open', () => {
        render(<SetProgramStatusDialog {...defaultProps} />);
        expect(screen.getByText('Attention')).toBeInTheDocument();
    });

    it('shows "close" when isApplicationSubmitted is false', () => {
        render(
            <SetProgramStatusDialog
                {...defaultProps}
                isApplicationSubmitted={false}
            />
        );
        expect(
            screen.getByText(/close this program for Alice/)
        ).toBeInTheDocument();
    });

    it('shows "re-open" when isApplicationSubmitted is true', () => {
        render(
            <SetProgramStatusDialog
                {...defaultProps}
                isApplicationSubmitted={true}
            />
        );
        expect(
            screen.getByText(/re-open this program for Alice/)
        ).toBeInTheDocument();
    });

    it('calls onConfirm when Yes is clicked', () => {
        const onConfirm = vi.fn();
        render(
            <SetProgramStatusDialog {...defaultProps} onConfirm={onConfirm} />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when No is clicked', () => {
        const onClose = vi.fn();
        render(<SetProgramStatusDialog {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('No'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
