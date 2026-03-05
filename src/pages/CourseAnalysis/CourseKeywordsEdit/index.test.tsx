import { forwardRef, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import CourseKeywords from './index';

vi.mock('react-router-dom', () => ({
    useLoaderData: () => ({ courseKeywordSets: [] }),
    useNavigate: () => vi.fn(),
    Link: forwardRef<HTMLAnchorElement, { children?: ReactNode; to?: string }>(
        function LinkMock({ children, to }, ref) {
            return (
                <a ref={ref} href={to ?? '#'}>
                    {children}
                </a>
            );
        }
    ),
    Await: ({
        children
    }: {
        children: ((data: unknown) => React.ReactNode) | React.ReactNode;
        resolve: unknown;
    }) => <>{typeof children === 'function' ? children([]) : children}</>,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs',
        PROGRAM_ANALYSIS: '/courses/analysis/programs'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('./CourseKeywordsOverview', () => ({
    default: () => <div data-testid="course-keywords-overview" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

describe('CourseKeywords (index)', () => {
    it('renders the course-keywords-component container', () => {
        render(<CourseKeywords />);
        expect(
            screen.getByTestId('course-keywords-component')
        ).toBeInTheDocument();
    });

    it('renders breadcrumb with company name', () => {
        render(<CourseKeywords />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders CourseKeywordsOverview via Await', () => {
        render(<CourseKeywords />);
        expect(
            screen.getByTestId('course-keywords-overview')
        ).toBeInTheDocument();
    });
});
