import { render, screen } from '@testing-library/react';
import { DeleteCourseDialog } from './DeleteCourseDialog';
import { useMutation } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null
    }))
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    deleteCourse: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    courses: [
        { _id: 'c1', all_course_chinese: '物理', all_course_english: 'Physics' }
    ],
    handleOnSuccess: vi.fn()
};

describe('DeleteCourseDialog', () => {
    beforeEach(() => {
        vi.mocked(useMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
            isError: false,
            error: null
        } as never);
    });

    it('renders dialog with title when open', () => {
        render(<DeleteCourseDialog {...defaultProps} />);
        expect(screen.getByText('Delete Course')).toBeInTheDocument();
    });

    it('displays course names in the dialog content', () => {
        render(<DeleteCourseDialog {...defaultProps} />);
        expect(screen.getByText('物理 - Physics')).toBeInTheDocument();
    });

    it('renders Delete and Close buttons', () => {
        render(<DeleteCourseDialog {...defaultProps} />);
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});
