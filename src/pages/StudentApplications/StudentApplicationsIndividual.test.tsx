import { render, screen } from '@testing-library/react';
import type { IStudentResponse } from '@taiger-common/model';

vi.mock('react-router-dom', () => ({
    useParams: () => ({ student_id: 'stu1' })
}));

interface UseApplicationStudentResult {
    data: IStudentResponse | null;
    isLoading: boolean;
    isError: boolean;
}

const mockUseApplicationStudent = vi.fn<
    (...args: unknown[]) => UseApplicationStudentResult
>(() => ({
    data: null,
    isLoading: true,
    isError: false
}));

vi.mock('@hooks/useApplicationStudent', () => ({
    useApplicationStudent: (...args: unknown[]) =>
        mockUseApplicationStudent(...args)
}));

vi.mock('./StudentApplicationsTableTemplate', () => ({
    default: () => <div data-testid="table-template" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

import StudentApplicationsIndividual from './StudentApplicationsIndividual';

describe('StudentApplicationsIndividual', () => {
    beforeEach(() => {
        mockUseApplicationStudent.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false
        });
    });

    it('renders Loading when isLoading is true', () => {
        render(<StudentApplicationsIndividual />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders null when isError is true and no data', () => {
        mockUseApplicationStudent.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true
        });
        const { container } = render(<StudentApplicationsIndividual />);
        expect(container.firstChild).toBeNull();
    });

    it('renders StudentApplicationsTableTemplate when student data is available', () => {
        mockUseApplicationStudent.mockReturnValue({
            data: {
                _id: 'stu1',
                firstname: 'John',
                lastname: 'Doe',
                applications: []
            } as unknown as IStudentResponse,
            isLoading: false,
            isError: false
        });
        render(<StudentApplicationsIndividual />);
        expect(screen.getByTestId('table-template')).toBeInTheDocument();
    });
});
