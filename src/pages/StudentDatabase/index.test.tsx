import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDatabase from '.';

vi.mock('@components/AuthProvider', () => ({
    useAuth: vi.fn()
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: vi.fn()
}));

vi.mock('@hooks/useStudents', () => ({
    default: vi.fn()
}));

vi.mock('./StudentsTable', () => ({
    StudentsTable: () => <div data-testid="students-table">StudentsTable</div>
}));

import { useAuth } from '@components/AuthProvider';
import useStudents from '@hooks/useStudents';
import { useStudentsV3 } from '@hooks/useStudentsV3';

const mockConfirmError = vi.fn();
const mockSubmitUpdateAgentlist = vi.fn();
const mockSubmitUpdateEditorlist = vi.fn();
const mockSubmitUpdateAttributeslist = vi.fn();
const mockUpdateStudentArchivStatus = vi.fn();

const mockAuthValue = {
    user: { role: 'Agent', _id: 'test-id' },
    isAuthenticated: true,
    isLoaded: true,
    login: vi.fn(),
    logout: vi.fn()
};

function setupMocks() {
    vi.mocked(useAuth).mockReturnValue(mockAuthValue);
    vi.mocked(useStudentsV3).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        queryKey: []
    } as unknown as ReturnType<typeof useStudentsV3>);
    vi.mocked(useStudents).mockReturnValue({
        students: [],
        res_modal_status: 0,
        res_modal_message: '',
        ConfirmError: mockConfirmError,
        submitUpdateAgentlist: mockSubmitUpdateAgentlist,
        submitUpdateEditorlist: mockSubmitUpdateEditorlist,
        submitUpdateAttributeslist: mockSubmitUpdateAttributeslist,
        updateStudentArchivStatus: mockUpdateStudentArchivStatus,
        onUpdateProfileFilefromstudent: vi.fn()
    });
}

describe('StudentDatabase', () => {
    beforeEach(() => {
        setupMocks();
    });

    test('renders without crashing when user has TaiGer role', () => {
        render(
            <MemoryRouter initialEntries={['/student-database']}>
                <StudentDatabase />
            </MemoryRouter>
        );

        expect(screen.getByTestId('student_datdabase')).toBeInTheDocument();
        expect(screen.getByTestId('students-table')).toBeInTheDocument();
    });

    test('redirects to dashboard when user has no TaiGer role', () => {
        vi.mocked(useAuth).mockReturnValue({
            ...mockAuthValue,
            user: { role: 'Student', _id: 'student-id' }
        });

        render(
            <MemoryRouter initialEntries={['/student-database']}>
                <StudentDatabase />
            </MemoryRouter>
        );

        expect(screen.queryByTestId('student_datdabase')).not.toBeInTheDocument();
    });
});
