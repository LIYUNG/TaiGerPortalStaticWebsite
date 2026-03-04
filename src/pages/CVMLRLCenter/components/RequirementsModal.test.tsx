import { render, screen, fireEvent } from '@testing-library/react';
import RequirementsModal from './RequirementsModal';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('../../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    requirements: 'Must have 2 years experience.'
};

describe('RequirementsModal', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders when open', () => {
        render(<RequirementsModal {...defaultProps} />);
        expect(screen.getByText('Special Requirements')).toBeInTheDocument();
    });

    it('displays requirements text', () => {
        render(<RequirementsModal {...defaultProps} />);
        expect(
            screen.getByText('Must have 2 years experience.')
        ).toBeInTheDocument();
    });

    it('calls onClose when Close is clicked', () => {
        const onClose = vi.fn();
        render(<RequirementsModal {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
