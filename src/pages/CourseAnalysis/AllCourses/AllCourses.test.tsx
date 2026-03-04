import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import AllCourses from './AllCourses';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false }))
}));

vi.mock('react-router-dom', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    NavLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a>
}));

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

vi.mock('@/api/query', () => ({
    getAllCoursessQuery: vi.fn(() => ({
        queryKey: ['all-courses/all'],
        queryFn: vi.fn()
    }))
}));

vi.mock('./AllCoursesTable', () => ({
    AllCoursesTable: () => <div data-testid="all-courses-table" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

describe('AllCourses', () => {
    it('renders breadcrumb with company name', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false
        } as never);
        render(<AllCourses />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders AllCoursesTable when not loading', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: { data: [] },
            isLoading: false
        } as never);
        render(<AllCourses />);
        expect(screen.getByTestId('all-courses-table')).toBeInTheDocument();
    });

    it('renders Loading when isLoading is true', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true
        } as never);
        render(<AllCourses />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
