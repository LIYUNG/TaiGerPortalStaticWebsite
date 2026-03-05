import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImportStudentProgramsCard } from './ImportStudentProgramsCard';

vi.mock('@tanstack/react-query', () => ({
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@hooks/useApplicationStudent', () => ({
    useApplicationStudent: vi.fn(() => ({
        data: null,
        isLoading: false,
        isError: false
    }))
}));

vi.mock('@hooks/useStudentSearch', () => ({
    useStudentSearch: vi.fn(() => ({ results: [], isSuccess: false }))
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    createApplicationV2: vi.fn(),
    queryClient: { refetchQueries: vi.fn(() => Promise.resolve()) },
    Application: {}
}));

vi.mock('../Utils/checking-functions', () => ({
    HighlightText: ({ text }: { text: string }) => <span>{text}</span>
}));

const mockStudent = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    applications: []
} as any;

describe('ImportStudentProgramsCard', () => {
    it('renders the import programs heading', () => {
        render(<ImportStudentProgramsCard student={mockStudent} />);
        expect(
            screen.getByText('Import programs from another student')
        ).toBeInTheDocument();
    });

    it('renders the search student text field', () => {
        render(<ImportStudentProgramsCard student={mockStudent} />);
        expect(
            screen.getByPlaceholderText('Search student...')
        ).toBeInTheDocument();
    });

    it('renders the find student instruction text', () => {
        render(<ImportStudentProgramsCard student={mockStudent} />);
        expect(
            screen.getByText(
                'Find the student (name or email) and import his/her progams'
            )
        ).toBeInTheDocument();
    });
});
