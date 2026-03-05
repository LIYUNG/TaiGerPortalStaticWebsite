import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'user1', role: 'Student' } })
}));

vi.mock('@taiger-common/core', () => ({
    isProgramAdmitted: vi.fn(() => false),
    isProgramRejected: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false)
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
    updateStudentApplicationResult: vi.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('@pages/Utils/util_functions', () => ({
    application_deadline_V2_calculator: vi.fn(() => '30 days'),
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

    it('renders confirmation modal', () => {
        expect(screen.getByTestId('confirmation-modal')).toBeDefined();
    });
});
