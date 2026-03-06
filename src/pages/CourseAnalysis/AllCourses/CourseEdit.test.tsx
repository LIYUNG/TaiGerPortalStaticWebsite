import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import CourseEdit from './CourseEdit';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('react-router-dom', () => {
    const React = require('react');
    return {
        Link: React.forwardRef(function LinkMock(
            props: { children?: ReactNode; to?: string },
            ref: React.Ref<HTMLAnchorElement>
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

describe('CourseEdit', () => {
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
        render(<CourseEdit />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders the Update button', () => {
        render(<CourseEdit />);
        expect(
            screen.getByRole('button', { name: /Update/i })
        ).toBeInTheDocument();
    });

    it('renders Chinese and English course name fields', () => {
        render(<CourseEdit />);
        expect(
            screen.getByLabelText(/Course Name in Chinese/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Course Name in English/i)
        ).toBeInTheDocument();
    });
});
