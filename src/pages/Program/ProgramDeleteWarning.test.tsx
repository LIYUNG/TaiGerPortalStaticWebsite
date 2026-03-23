import { render, screen } from '@testing-library/react';
import ProgramDeleteWarning from './ProgramDeleteWarning';

vi.mock('@components/Modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        title,
        content,
        open
    }: {
        title: string;
        content: string;
        open: boolean;
    }) =>
        open ? (
            <div data-testid="confirmation-modal">
                <span>{title}</span>
                <span>{content}</span>
            </div>
        ) : null
}));

const defaultProps = {
    uni_name: 'TU Berlin',
    program_name: 'Computer Science',
    isPending: false,
    setDeleteProgramWarningOpen: vi.fn(),
    RemoveProgramHandler: vi.fn(),
    program_id: 'p1',
    deleteProgramWarning: true
};

describe('ProgramDeleteWarning', () => {
    it('renders ConfirmationModal when open', () => {
        render(<ProgramDeleteWarning {...defaultProps} />);
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('displays the university and program name in confirmation content', () => {
        render(<ProgramDeleteWarning {...defaultProps} />);
        expect(screen.getByText(/TU Berlin/)).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });

    it('displays Warning title', () => {
        render(<ProgramDeleteWarning {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('does not render modal when deleteProgramWarning is false', () => {
        render(
            <ProgramDeleteWarning
                {...defaultProps}
                deleteProgramWarning={false}
            />
        );
        expect(
            screen.queryByTestId('confirmation-modal')
        ).not.toBeInTheDocument();
    });
});
