import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApplicationAccordionList from './ApplicationAccordionList';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('../../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false })),
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false })),
    application_deadline_V2_calculator: vi.fn(() => '2025-12-01'),
    is_program_closed: vi.fn(() => false),
    is_program_ml_rl_essay_finished: vi.fn(() => true),
    file_category_const: {}
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => true),
    isProgramSubmitted: vi.fn(() => false),
    isProgramWithdraw: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@components/ApplicationLockControl/ApplicationLockControl', () => ({
    default: () => <div>LockControl</div>
}));

vi.mock('@utils/contants', () => ({
    FILE_OK_SYMBOL: '✓',
    FILE_MISSING_SYMBOL: '✗',
    convertDate: vi.fn(() => '2025-01-01')
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`,
        STUDENT_APPLICATIONS_ID_LINK: (id: string) =>
            `/students/${id}/applications`,
        DASHBOARD_LINK: '/'
    }
}));

vi.mock('../ManualFiles', () => ({
    default: () => <div data-testid="manual-files">ManualFiles</div>
}));

vi.mock('./ApplicationAccordionSummary', () => ({
    default: ({
        application
    }: {
        application: { programId?: { school?: string } };
    }) => (
        <div data-testid="accordion-summary">
            {application?.programId?.school}
        </div>
    )
}));

const mockStudent = {
    _id: 'student1',
    generaldocs_threads: []
} as any;

const mockApplications = [
    {
        _id: 'app1',
        decided: 'O',
        closed: '-',
        doc_modification_thread: [],
        programId: {
            _id: 'prog1',
            school: 'MIT',
            degree: 'MSc',
            program_name: 'Computer Science',
            rl_required: 0
        }
    }
] as any[];

describe('ApplicationAccordionList', () => {
    const defaultProps = {
        applications: mockApplications,
        student: mockStudent,
        handleAsFinalFile: vi.fn(),
        handleProgramStatus: vi.fn(),
        initGeneralFileThread: vi.fn(),
        initProgramSpecificFileThread: vi.fn(),
        onDeleteFileThread: vi.fn(),
        openRequirements_ModalWindow: vi.fn()
    };

    it('renders an accordion for each application', () => {
        render(
            <MemoryRouter>
                <ApplicationAccordionList {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('accordion-summary')).toBeInTheDocument();
    });

    it('renders ManualFiles component inside accordion', () => {
        render(
            <MemoryRouter>
                <ApplicationAccordionList {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('manual-files')).toBeInTheDocument();
    });

    it('renders no accordions when applications array is empty', () => {
        render(
            <MemoryRouter>
                <ApplicationAccordionList {...defaultProps} applications={[]} />
            </MemoryRouter>
        );
        expect(
            screen.queryByTestId('accordion-summary')
        ).not.toBeInTheDocument();
    });
});
