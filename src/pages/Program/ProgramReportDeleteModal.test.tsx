import { render, screen } from '@testing-library/react';
import ProgramReportDeleteModal from './ProgramReportDeleteModal';

const defaultProps = {
    program_name: 'Computer Science',
    uni_name: 'TU Berlin',
    ticket: {
        _id: 'ticket1',
        description: 'Deadline is wrong',
        feedback: 'Please fix this',
        status: 'open'
    },
    isReportDelete: true,
    setReportDeleteModalHide: vi.fn(),
    submitProgramDeleteReport: vi.fn()
};

describe('ProgramReportDeleteModal', () => {
    beforeEach(() => {
        render(<ProgramReportDeleteModal {...defaultProps} />);
    });

    it('renders dialog when open', () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders dialog title', () => {
        expect(screen.getAllByText('Delete ticket')[0]).toBeInTheDocument();
    });

    it('renders the university and program name in content', () => {
        expect(screen.getByText(/TU Berlin/)).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });
});

describe('ProgramReportDeleteModal — closed', () => {
    it('does not render dialog when closed', () => {
        render(<ProgramReportDeleteModal {...defaultProps} isReportDelete={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
