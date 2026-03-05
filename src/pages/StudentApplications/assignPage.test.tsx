import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', () => ({
    useParams: () => ({ student_id: 'stu1' })
}));

const mockUseApplicationStudent = vi.fn(() => ({
    data: null,
    isLoading: true,
    isError: false
}));

vi.mock('@hooks/useApplicationStudent', () => ({
    useApplicationStudent: (...args: unknown[]) =>
        mockUseApplicationStudent(...args)
}));

vi.mock('./StudentApplicationsAssignProgramlistPage', () => ({
    default: () => <div data-testid="assign-programlist-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

import StudentApplicationsAssignPage from './assignPage';

describe('StudentApplicationsAssignPage', () => {
    beforeEach(() => {
        mockUseApplicationStudent.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false
        });
    });

    it('renders Loading when isLoading is true', () => {
        render(<StudentApplicationsAssignPage />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders null when isError is true and no data', () => {
        mockUseApplicationStudent.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true
        });
        const { container } = render(<StudentApplicationsAssignPage />);
        expect(container.firstChild).toBeNull();
    });

    it('renders StudentApplicationsAssignProgramlistPage when student data is available', () => {
        mockUseApplicationStudent.mockReturnValue({
            data: {
                _id: 'stu1',
                firstname: 'Jane',
                lastname: 'Doe',
                applications: []
            },
            isLoading: false,
            isError: false
        });
        render(<StudentApplicationsAssignPage />);
        expect(
            screen.getByTestId('assign-programlist-page')
        ).toBeInTheDocument();
    });
});
