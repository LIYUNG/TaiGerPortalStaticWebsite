import { render, screen } from '@testing-library/react';
import ProgramDiffModal from './ProgramDiffModal';

vi.mock('@/api', () => ({
    getProgramChangeRequests: vi.fn(() =>
        Promise.resolve({ data: { data: [] } })
    )
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d) => String(d))
}));

vi.mock('@components/Modal', () => ({
    default: ({
        children,
        open
    }: {
        children: React.ReactNode;
        open: boolean;
    }) => (open ? <div data-testid="modal-new">{children}</div> : null)
}));

vi.mock('./ProgramCompare', () => ({
    default: () => <div data-testid="program-compare" />
}));

const defaultProps = {
    open: true,
    setModalHide: vi.fn(),
    originalProgram: { _id: 'prog1', school: 'TU Berlin', program_name: 'CS' }
};

describe('ProgramDiffModal', () => {
    it('renders modal when open', () => {
        render(<ProgramDiffModal {...defaultProps} />);
        expect(screen.getByTestId('modal-new')).toBeInTheDocument();
    });

    it('renders Merge Program input heading', () => {
        render(<ProgramDiffModal {...defaultProps} />);
        expect(screen.getByText('Merge Program input')).toBeInTheDocument();
    });

    it('renders ProgramCompare component', () => {
        render(<ProgramDiffModal {...defaultProps} />);
        expect(screen.getByTestId('program-compare')).toBeInTheDocument();
    });

    it('does not render modal when closed', () => {
        render(<ProgramDiffModal {...defaultProps} open={false} />);
        expect(screen.queryByTestId('modal-new')).not.toBeInTheDocument();
    });
});
