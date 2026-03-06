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
    beforeEach(() => {
        vi.clearAllMocks();
        render(<SetProgramStatusDialog {...defaultProps} />);
    });

    it('renders when open', () => {
        expect(screen.getByText('Attention')).toBeInTheDocument();
    });

    it('shows "close" when isApplicationSubmitted is false', () => {
        expect(
            screen.getByText(/close this program for Alice/)
        ).toBeInTheDocument();
    });

    describe('when isApplicationSubmitted is true', () => {
        it('shows "re-open"', () => {
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
    });

    describe('button interactions', () => {
        it('calls onConfirm when Yes is clicked', () => {
            const onConfirm = vi.fn();
            render(
                <SetProgramStatusDialog
                    {...defaultProps}
                    onConfirm={onConfirm}
                />
            );
            fireEvent.click(screen.getAllByText('Yes')[1]);
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when No is clicked', () => {
            const onClose = vi.fn();
            render(
                <SetProgramStatusDialog {...defaultProps} onClose={onClose} />
            );
            fireEvent.click(screen.getAllByText('No')[1]);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
