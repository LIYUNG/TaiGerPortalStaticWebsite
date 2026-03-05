import { render, screen, fireEvent } from '@testing-library/react';
import SetAsFinalFileDialog from './SetAsFinalFileDialog';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('@utils/contants', () => ({
    spinner_style2: {}
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    docName: 'MotivationLetter.pdf',
    isFinal: true,
    isLoaded: true,
    onConfirm: vi.fn()
};

describe('SetAsFinalFileDialog', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders when open', () => {
        render(<SetAsFinalFileDialog {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('shows "final" when isFinal is true', () => {
        render(<SetAsFinalFileDialog {...defaultProps} isFinal={true} />);
        expect(
            screen.getByText(/set MotivationLetter\.pdf as final/)
        ).toBeInTheDocument();
    });

    it('shows "open" when isFinal is false', () => {
        render(<SetAsFinalFileDialog {...defaultProps} isFinal={false} />);
        expect(
            screen.getByText(/set MotivationLetter\.pdf as open/)
        ).toBeInTheDocument();
    });

    it('calls onConfirm when Yes is clicked', () => {
        const onConfirm = vi.fn();
        render(
            <SetAsFinalFileDialog {...defaultProps} onConfirm={onConfirm} />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when No is clicked', () => {
        const onClose = vi.fn();
        render(<SetAsFinalFileDialog {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('No'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('disables confirm when not loaded', () => {
        render(<SetAsFinalFileDialog {...defaultProps} isLoaded={false} />);
        // button is disabled when not loaded
        const yesButton = screen
            .getAllByRole('button')
            .find((btn) => btn.hasAttribute('disabled'));
        expect(yesButton).toBeTruthy();
    });
});
