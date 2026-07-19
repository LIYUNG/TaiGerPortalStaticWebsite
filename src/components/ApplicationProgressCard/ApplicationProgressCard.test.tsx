import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'user1', role: 'Student' } })
}));

// Field-accurate: the status chip derives its stage from these, so constant
// stubs would make every card read the same.
vi.mock('@taiger-common/core', () => ({
    isProgramAdmitted: (a: { admission?: string }) => a?.admission === 'O',
    isProgramRejected: (a: { admission?: string }) => a?.admission === 'X',
    isProgramSubmitted: (a: { closed?: string }) => a?.closed === 'O',
    isProgramDecided: (a: { decided?: string }) => a?.decided === 'O',
    isProgramWithdraw: (a: { closed?: string }) => a?.closed === 'X'
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        INTERVIEW_ADD_LINK: '/interviews/add',
        INTERVIEW_SINGLE_LINK: (id: string) => `/interviews/${id}`,
        EVENT_STUDENT_STUDENTID_LINK: (id: string) => `/events/${id}`
    }
}));

vi.mock('@/api', () => ({
    updateStudentApplicationResult: vi.fn(() =>
        Promise.resolve({ data: { success: true, data: {} } })
    ),
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('@pages/Utils/util_functions', () => ({
    application_deadline_V2_calculator: vi.fn(() => '30 days')
}));

vi.mock('@pages/Utils/applicationChecklist', () => ({
    progressBarCounter: vi.fn(() => 50)
}));

vi.mock('@utils/contants', () => ({
    FILE_OK_SYMBOL: '✓',
    FILE_NOT_OK_SYMBOL: '✗',
    convertDate: vi.fn((d) => String(d))
}));

vi.mock('../../config', () => ({
    appConfig: { interviewEnable: false }
}));

vi.mock('../Modal/ConfirmationModal', () => ({
    ConfirmationModal: () => <div data-testid="confirmation-modal" />
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('./ApplicationProgressCardBody', () => ({
    default: () => <div data-testid="card-body" />
}));

vi.mock('../ApplicationLockControl/ApplicationLockControl', () => ({
    default: () => <div data-testid="lock-control" />
}));

import ApplicationProgressCard from './ApplicationProgressCard';

const mockApplication = {
    _id: { toString: () => 'app1' },
    programId: {
        _id: { toString: () => 'prog1' },
        country: 'de',
        school: 'TU Munich',
        degree: 'MSc',
        program_name: 'Computer Science',
        semester: 'WS'
    },
    // Decided by default: the checklist affordance only exists once the student
    // has committed to the programme.
    decided: 'O',
    closed: '-',
    admission: '-',
    doc_modification_thread: []
};

const mockStudent = {
    _id: { toString: () => 'student1' },
    firstname: 'John',
    lastname: 'Doe'
};

describe('ApplicationProgressCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ApplicationProgressCard
                    application={mockApplication}
                    student={mockStudent}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('lock-control')).toBeDefined();
    });

    it('renders program school name', () => {
        expect(screen.getByText('TU Munich')).toBeDefined();
    });

    it('renders program degree and name', () => {
        expect(screen.getByText(/Computer Science/)).toBeDefined();
    });

    // Semester answers "which intake", so it belongs with the programme
    // identity rather than with the deadline it used to share a row with.
    it('renders the semester alongside the degree and program name', () => {
        expect(
            screen.getByText('MSc · Computer Science · WS')
        ).toBeInTheDocument();
    });

    // Three independent signals: lock (can I edit), deadline (when), status
    // (where it got to). Folding them together meant the deadline vanished the
    // moment an application was submitted.
    it('renders lock, deadline and status as separate signals', () => {
        const schoolRow = screen.getByRole('link', {
            name: /TU Munich/
        }).parentElement;

        expect(schoolRow).toContainElement(screen.getByTestId('lock-control'));
        // '30 days' is the mocked application_deadline_V2_calculator output.
        expect(schoolRow).toHaveTextContent('30 days');
        expect(schoolRow).toHaveTextContent('Decided');
    });

    it('links the school name to the program and keeps the lock chip on its row', () => {
        const schoolLink = screen.getByRole('link', { name: /TU Munich/ });
        expect(schoolLink).toHaveAttribute('href', '/programs/prog1');
        // The flag, school and lock chip share one row; the chip reads as an
        // attribute of the program rather than owning a line of its own.
        const schoolRow = schoolLink.parentElement;
        expect(schoolRow).toContainElement(screen.getByTestId('lock-control'));
        expect(schoolRow).toContainElement(screen.getByAltText('Logo'));
    });

    it('gives the degree and program name a full-width row of their own', () => {
        const schoolRow = screen.getByRole('link', {
            name: /TU Munich/
        }).parentElement;
        // Not nested in the flag row — otherwise it would be indented by the
        // flag's column instead of spanning the card.
        expect(schoolRow).not.toContainElement(
            screen.getByText(/MSc · Computer Science/)
        );
    });

    it('renders confirmation modal', () => {
        expect(screen.getByTestId('confirmation-modal')).toBeDefined();
    });

    it('offers a labelled expand control that starts collapsed', () => {
        const toggle = screen.getByRole('button', { name: /Show checklist/ });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands the checklist when the control is activated', async () => {
        const user = userEvent.setup();
        await user.click(
            screen.getByRole('button', { name: /Show checklist/ })
        );

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Hide checklist/ })
            ).toHaveAttribute('aria-expanded', 'true');
        });
    });

    it('points the expand control at the region it opens', () => {
        const toggle = screen.getByRole('button', { name: /Show checklist/ });
        const region = document.getElementById(
            toggle.getAttribute('aria-controls') ?? ''
        );
        expect(region).not.toBeNull();
        expect(region).toContainElement(screen.getByTestId('card-body'));
    });
});

// Rendered separately: the shared beforeEach mounts a decided application.
describe('ApplicationProgressCard — undecided programme', () => {
    const renderUndecided = () =>
        render(
            <MemoryRouter>
                <ApplicationProgressCard
                    application={{ ...mockApplication, decided: '-' }}
                    student={mockStudent}
                />
            </MemoryRouter>
        );

    // Tasks for a programme the student has not committed to are not owed yet,
    // so the checklist is not merely collapsed — it is not offered at all.
    it('hides the checklist control and body entirely', () => {
        renderUndecided();

        expect(
            screen.queryByRole('button', { name: /Show checklist/ })
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('card-body')).not.toBeInTheDocument();
    });

    it('still shows the programme identity and status', () => {
        renderUndecided();

        expect(
            screen.getByRole('link', { name: /TU Munich/ })
        ).toBeInTheDocument();
        expect(screen.getByText('Not decided')).toBeInTheDocument();
    });
});
