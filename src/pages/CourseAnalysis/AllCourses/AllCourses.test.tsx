import { ReactNode, forwardRef, Ref } from 'react';
import { render, screen } from '@testing-library/react';
import AllCourses from './AllCourses';
import { useAllCourses } from '@hooks/useAllCourses';

vi.mock('@hooks/useAllCourses', () => ({
    useAllCourses: vi.fn(() => ({ data: undefined, isLoading: false }))
}));

vi.mock('react-router-dom', () => {
    const linkForwardRef = (name: string) =>
        forwardRef(function LinkMock(
            props: { children?: ReactNode; to?: string },
            ref: Ref<HTMLAnchorElement>
        ) {
            const { children, to, ...rest } = props;
            return (
                <a ref={ref} href={to ?? '#'} data-testid={name} {...rest}>
                    {children}
                </a>
            );
        });
    return {
        Link: linkForwardRef('link'),
        NavLink: linkForwardRef('navlink'),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        INTERNAL_WIDGET_COURSE_ANALYSER_LINK:
            '/internal/widgets/course-analyser'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('./AllCoursesTable', () => ({
    AllCoursesTable: () => <div data-testid="all-courses-table" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

describe('AllCourses', () => {
    it('renders breadcrumb with company name', () => {
        vi.mocked(useAllCourses).mockReturnValue({
            data: undefined,
            isLoading: false
        } as never);
        render(<AllCourses />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders AllCoursesTable when not loading', () => {
        vi.mocked(useAllCourses).mockReturnValue({
            data: { data: [] },
            isLoading: false
        } as never);
        render(<AllCourses />);
        expect(screen.getByTestId('all-courses-table')).toBeInTheDocument();
    });

    it('renders Loading when isLoading is true', () => {
        vi.mocked(useAllCourses).mockReturnValue({
            data: undefined,
            isLoading: true
        } as never);
        render(<AllCourses />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
