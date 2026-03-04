import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'stu1' } })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('./ImportStudentProgramsCard', () => ({
    ImportStudentProgramsCard: () => <div data-testid="import-card" />
}));

vi.mock('./StudentPreferenceCard', () => ({
    StudentPreferenceCard: () => <div data-testid="preference-card" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Program/ProgramList', () => ({
    default: () => <div data-testid="program-list" />
}));

import StudentApplicationsAssignProgramlistPage from './StudentApplicationsAssignProgramlistPage';

const mockStudent = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    applications: []
} as any;

const renderPage = (props = {}) =>
    render(
        <MemoryRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <StudentApplicationsAssignProgramlistPage
                    student={mockStudent}
                    isLoaded={true}
                    {...props}
                />
            </Suspense>
        </MemoryRouter>
    );

describe('StudentApplicationsAssignProgramlistPage', () => {
    it('renders the Applications breadcrumb after lazy load', async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText('Applications')).toBeInTheDocument()
        );
    });

    it('renders the student preference card after lazy load', async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByTestId('preference-card')).toBeInTheDocument()
        );
    });

    it('renders the Back button after lazy load', async () => {
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'Back' })
            ).toBeInTheDocument()
        );
    });
});
