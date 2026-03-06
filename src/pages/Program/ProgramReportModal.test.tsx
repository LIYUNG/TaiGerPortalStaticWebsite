import { render, screen } from '@testing-library/react';
import ProgramReportModal from './ProgramReportModal';

const defaultProps = {
    isReport: true,
    setReportModalHideDelete: vi.fn(),
    uni_name: 'TU Berlin',
    program_name: 'Computer Science',
    program_id: 'prog1',
    submitProgramReport: vi.fn()
};

describe('ProgramReportModal', () => {
    it('renders dialog when open', () => {
        render(<ProgramReportModal {...defaultProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders Report title', () => {
        render(<ProgramReportModal {...defaultProps} />);
        expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('renders university and program name in content', () => {
        render(<ProgramReportModal {...defaultProps} />);
        expect(screen.getByText(/TU Berlin/)).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });

    it('does not render dialog when closed', () => {
        render(<ProgramReportModal {...defaultProps} isReport={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
