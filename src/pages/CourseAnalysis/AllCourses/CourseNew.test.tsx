import { render, screen } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import CourseNew from './CourseNew';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('react-router-dom', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    useNavigate: () => vi.fn()
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        INTERNAL_WIDGET_COURSE_ANALYSER_LINK:
            '/internal/widgets/course-analyser',
        COURSE_DATABASE: '/courses/analysis/courses/all'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    createCourse: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

describe('CourseNew', () => {
    beforeEach(() => {
        vi.mocked(useMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false
        } as never);
    });

    it('renders breadcrumb with company name', () => {
        render(<CourseNew />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders the Create button', () => {
        render(<CourseNew />);
        expect(
            screen.getByRole('button', { name: /Create/i })
        ).toBeInTheDocument();
    });

    it('renders course name input fields', () => {
        render(<CourseNew />);
        expect(
            screen.getByLabelText(/Course Name in Chinese/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Course Name in English/i)
        ).toBeInTheDocument();
    });
});
