import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationAccordionSummary from './ApplicationAccordionSummary';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('../../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false })),
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false })),
    application_deadline_V2_calculator: vi.fn(() => '2025-12-01')
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false),
    isProgramWithdraw: vi.fn(() => false)
}));

vi.mock('@components/ApplicationLockControl/ApplicationLockControl', () => ({
    default: () => <div>LockControl</div>
}));

vi.mock('@utils/contants', () => ({
    FILE_OK_SYMBOL: '✓'
}));

vi.mock('@store/constant', () => ({
    default: { SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}` }
}));

const mockApplication = {
    _id: 'app1',
    decided: '-',
    closed: '-',
    doc_modification_thread: [],
    programId: {
        _id: 'prog1',
        school: 'MIT',
        degree: 'MSc',
        program_name: 'Computer Science'
    }
} as any;

describe('ApplicationAccordionSummary', () => {
    const render_ = (app = mockApplication) =>
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <ApplicationAccordionSummary
                                    application={app}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </MemoryRouter>
        );

    it('renders school, degree and program name', () => {
        render_();
        expect(screen.getByText(/MIT/)).toBeInTheDocument();
        expect(screen.getByText(/MSc/)).toBeInTheDocument();
        expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
    });

    it('renders Undecided status when decided is "-"', () => {
        render_();
        expect(screen.getByText('Undecided')).toBeInTheDocument();
    });

    it('renders deadline', () => {
        render_();
        expect(screen.getByText(/2025-12-01/)).toBeInTheDocument();
    });
});
