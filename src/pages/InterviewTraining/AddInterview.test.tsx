import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    isProgramAdmitted: vi.fn(() => false),
    isProgramDecided: vi.fn(() => true),
    isProgramRejected: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => true)
}));

vi.mock('@/api', () => ({
    getMyInterviews: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: [],
                student: { _id: 's1', applications: [] },
                students: []
            },
            status: 200
        })
    ),
    createInterview: vi.fn(() =>
        Promise.resolve({ data: { success: true }, status: 200 })
    )
}));

vi.mock('../Notes/NotesEditor', () => ({
    default: () => <div data-testid="notes-editor" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => (
        <div data-testid="error-page">{res_status}</div>
    )
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@utils/contants', () => ({
    showTimezoneOffset: vi.fn(() => '+00:00'),
    convertDate: vi.fn((d: string) => d)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        INTERVIEW_LINK: '/interviews',
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

import AddInterview from './AddInterview';

describe('AddInterview', () => {
    it('renders Loading while data is not yet fetched', () => {
        render(
            <MemoryRouter>
                <AddInterview />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeTruthy();
    });
});
