import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationTableRow from './ApplicationTableRow';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer', vpdEnable: false }
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false),
    isProgramWithdraw: vi.fn(() => false),
    isProgramAdmitted: vi.fn(() => false)
}));

vi.mock('../../Utils/util_functions', () => ({
    is_program_ml_rl_essay_ready: vi.fn(() => true),
    is_the_uni_assist_vpd_uploaded: vi.fn(() => true),
    isCVFinished: vi.fn(() => true),
    application_deadline_V2_calculator: vi.fn(() => '2025-12-01')
}));

vi.mock('@components/Overlay/OverlayButton', () => ({
    default: ({ text }: { text: string }) => <div>{text}</div>
}));

vi.mock('@utils/contants', () => ({
    IS_SUBMITTED_STATE_OPTIONS: [
        { value: '-', label: 'Not Yet' },
        { value: 'O', label: 'Admitted' }
    ]
}));

const mockApplication = {
    _id: 'app1',
    programId: {
        _id: 'prog1',
        school: 'MIT',
        degree: 'MSc',
        program_name: 'Computer Science',
        semester: 'WS',
        toefl: 100,
        ielts: 7.0,
        application_deadline: '2025-12-01'
    },
    decided: '-',
    closed: '-',
    admission: '-',
    finalEnrolment: false,
    application_year: 2025
} as any;

const mockStudent = {
    _id: 'student1',
    firstname: 'Alice',
    lastname: 'Smith',
    applications: [mockApplication]
};

const defaultProps = {
    application: mockApplication,
    application_idx: 0,
    studentToShow: mockStudent,
    user: null,
    today: new Date('2025-11-01'),
    handleChange: vi.fn(),
    handleWithdraw: vi.fn(),
    handleDelete: vi.fn(),
    handleEdit: vi.fn()
};

const renderRow = (props = {}) =>
    render(
        <MemoryRouter>
            <table>
                <tbody>
                    <ApplicationTableRow {...defaultProps} {...props} />
                </tbody>
            </table>
        </MemoryRouter>
    );

describe('ApplicationTableRow', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders school name', () => {
        renderRow();
        expect(screen.getByText('MIT')).toBeInTheDocument();
    });

    it('renders degree', () => {
        renderRow();
        expect(screen.getByText('MSc')).toBeInTheDocument();
    });

    it('renders program name', () => {
        renderRow();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });

    it('renders semester', () => {
        renderRow();
        expect(screen.getByText('WS')).toBeInTheDocument();
    });

    it('renders toefl score', () => {
        renderRow();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('shows delete and edit buttons for non-student users', async () => {
        const { is_TaiGer_Student } = await import('@taiger-common/core');
        (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(false);
        renderRow();
        expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    });

    it('calls handleDelete when delete button clicked', async () => {
        const { is_TaiGer_Student } = await import('@taiger-common/core');
        (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(false);
        const handleDelete = vi.fn();
        renderRow({ handleDelete });
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(handleDelete).toHaveBeenCalledWith(
            expect.anything(),
            'app1',
            'student1'
        );
    });

    it('calls handleEdit when edit button clicked', async () => {
        const { is_TaiGer_Student } = await import('@taiger-common/core');
        (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(false);
        const handleEdit = vi.fn();
        renderRow({ handleEdit });
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[1]);
        expect(handleEdit).toHaveBeenCalledWith(
            expect.anything(),
            'app1',
            2025,
            'student1'
        );
    });

    it('hides action buttons for student users', async () => {
        const { is_TaiGer_Student } = await import('@taiger-common/core');
        (is_TaiGer_Student as ReturnType<typeof vi.fn>).mockReturnValue(true);
        renderRow({ user: { role: 'Student' } as any });
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
