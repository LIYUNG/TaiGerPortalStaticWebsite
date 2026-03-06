import { ReactNode, Ref, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import CourseForm from './CourseForm';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('react-router-dom', () => {
    return {
        Link: forwardRef(function LinkMock(
            props: { children?: ReactNode; to?: string },
            ref: Ref<HTMLAnchorElement>
        ) {
            const { children, to, ...rest } = props;
            return (
                <a ref={ref} href={to ?? '#'} {...rest}>
                    {children}
                </a>
            );
        }),
        useNavigate: () => vi.fn(),
        useParams: () => ({ courseId: 'course-123' })
    };
});

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
    updateCourse: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getCoursessQuery: vi.fn(() => ({ queryKey: ['course'], queryFn: vi.fn() }))
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

describe('CourseForm (create mode)', () => {
    beforeEach(() => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false
        } as never);
        vi.mocked(useMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false
        } as never);
    });

    it('renders breadcrumb with company name', () => {
        render(<CourseForm mode="create" />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders the Create button', () => {
        render(<CourseForm mode="create" />);
        expect(
            screen.getByRole('button', { name: /Create/i })
        ).toBeInTheDocument();
    });

    it('renders course name input fields', () => {
        render(<CourseForm mode="create" />);
        expect(
            screen.getByLabelText(/Course Name in Chinese/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Course Name in English/i)
        ).toBeInTheDocument();
    });

    it('does not render Back button in create mode', () => {
        render(<CourseForm mode="create" />);
        expect(
            screen.queryByRole('link', { name: /Back/i })
        ).not.toBeInTheDocument();
    });
});

describe('CourseForm (edit mode)', () => {
    beforeEach(() => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false
        } as never);
        vi.mocked(useMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false
        } as never);
    });

    it('renders breadcrumb with company name', () => {
        render(<CourseForm mode="edit" />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders the Update button', () => {
        render(<CourseForm mode="edit" />);
        expect(
            screen.getByRole('button', { name: /Update/i })
        ).toBeInTheDocument();
    });

    it('renders Chinese and English course name fields', () => {
        render(<CourseForm mode="edit" />);
        expect(
            screen.getByLabelText(/Course Name in Chinese/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Course Name in English/i)
        ).toBeInTheDocument();
    });

    it('renders Back link in edit mode', () => {
        render(<CourseForm mode="edit" />);
        expect(
            screen.getByRole('link', { name: /Back/i })
        ).toBeInTheDocument();
    });
});
