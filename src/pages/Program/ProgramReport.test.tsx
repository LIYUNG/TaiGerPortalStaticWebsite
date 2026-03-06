import { render, screen } from '@testing-library/react';
import ProgramReport from './ProgramReport';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_AdminAgent: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false)
}));

vi.mock('@/api', () => ({
    getProgramTicket: vi.fn(() =>
        Promise.resolve({
            data: { data: [], success: true },
            status: 200
        })
    ),
    createProgramReport: vi.fn(() =>
        Promise.resolve({ data: { data: {}, success: true }, status: 200 })
    ),
    deleteProgramTicket: vi.fn(() =>
        Promise.resolve({ data: { success: true }, status: 200 })
    ),
    updateProgramTicket: vi.fn(() =>
        Promise.resolve({ data: { data: {}, success: true }, status: 200 })
    )
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d) => String(d))
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

vi.mock('./ProgramReportModal', () => ({
    default: () => <div data-testid="program-report-modal" />
}));

vi.mock('./ProgramReportDeleteModal', () => ({
    default: () => <div data-testid="program-report-delete-modal" />
}));

vi.mock('./ProgramReportUpdateModal', () => ({
    default: () => <div data-testid="program-report-update-modal" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

const defaultProps = {
    program_id: 'prog1',
    program_name: 'Computer Science',
    uni_name: 'TU Berlin'
};

describe('ProgramReport', () => {
    beforeEach(() => {
        render(<ProgramReport {...defaultProps} />);
    });

    it('renders without crashing and shows Report button', async () => {
        expect(await screen.findByRole('button', { name: /Report/i })).toBeInTheDocument();
    });

    it('renders ProgramReportModal', async () => {
        expect(await screen.findByTestId('program-report-modal')).toBeInTheDocument();
    });

    it('renders ProgramReportDeleteModal', async () => {
        expect(await screen.findByTestId('program-report-delete-modal')).toBeInTheDocument();
    });

    it('renders ProgramReportUpdateModal', async () => {
        expect(await screen.findByTestId('program-report-update-modal')).toBeInTheDocument();
    });
});
