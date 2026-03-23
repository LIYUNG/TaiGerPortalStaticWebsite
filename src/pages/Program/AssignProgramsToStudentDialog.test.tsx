import { render, screen } from '@testing-library/react';
import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useMutation: () => ({
            mutate: vi.fn(),
            isPending: false,
            isError: false,
            error: null
        })
    };
});

vi.mock('@/api', () => ({
    createApplicationV2: vi.fn()
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: () => ({
        data: [
            { _id: 's1', firstname: 'John', lastname: 'Doe' },
            { _id: 's2', firstname: 'Jane', lastname: 'Smith' }
        ],
        isLoading: false,
        isError: false,
        error: null
    })
}));

const mockPrograms = [
    {
        _id: 'p1',
        school: 'TU Berlin',
        program_name: 'CS',
        degree: 'Master',
        semester: 'WS'
    },
    {
        _id: 'p2',
        school: 'LMU',
        program_name: 'Physics',
        degree: 'Master',
        semester: 'SS'
    }
] as any[];

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    programs: mockPrograms,
    handleOnSuccess: vi.fn(),
    student: null as any
};

describe('AssignProgramsToStudentDialog', () => {
    beforeEach(() => {
        render(<AssignProgramsToStudentDialog {...defaultProps} />);
    });

    it('renders dialog when open', () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders Selected Programs title', () => {
        expect(screen.getByText('Selected Programs')).toBeInTheDocument();
    });

    it('renders program list items', () => {
        expect(screen.getByText(/TU Berlin/)).toBeInTheDocument();
        expect(screen.getByText(/LMU/)).toBeInTheDocument();
    });

    it('renders student checkboxes', () => {
        expect(screen.getByText(/John, Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane, Smith/)).toBeInTheDocument();
    });
});
