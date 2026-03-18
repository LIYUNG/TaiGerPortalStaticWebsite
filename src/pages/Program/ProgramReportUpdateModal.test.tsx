import { render, screen } from '@testing-library/react';
import ProgramReportUpdateModal from './ProgramReportUpdateModal';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

const defaultProps = {
    ticket: {
        _id: 'ticket1',
        description: 'Deadline is wrong',
        feedback: 'Acknowledged',
        status: 'open'
    } as any,
    isUpdateReport: true,
    setReportUpdateModalHide: vi.fn(),
    uni_name: 'TU Berlin',
    program_name: 'Computer Science',
    submitProgramUpdateReport: vi.fn()
};

describe('ProgramReportUpdateModal', () => {
    it('renders dialog when open', () => {
        render(<ProgramReportUpdateModal {...defaultProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders Report title', () => {
        render(<ProgramReportUpdateModal {...defaultProps} />);
        expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('renders university and program name', () => {
        render(<ProgramReportUpdateModal {...defaultProps} />);
        expect(screen.getByText(/TU Berlin/)).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });

    it('does not render dialog when closed', () => {
        render(
            <ProgramReportUpdateModal
                {...defaultProps}
                isUpdateReport={false}
            />
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
