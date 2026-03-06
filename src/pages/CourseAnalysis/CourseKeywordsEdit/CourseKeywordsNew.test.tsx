import React from 'react';
import { render, screen } from '@testing-library/react';
import CourseKeywordsOverviewNew from './CourseKeywordsNew';

vi.mock('react-router-dom', () => ({
    Link: React.forwardRef<
        HTMLAnchorElement,
        { children?: React.ReactNode; to?: string }
    >(function LinkMock({ children, to }, ref) {
        return (
            <a ref={ref} href={to ?? '#'}>
                {children}
            </a>
        );
    }),
    useNavigate: () => vi.fn()
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs',
        KEYWORDS_EDIT: '/courses/analysis/keywords',
        KEYWORDS_NEW: '/courses/analysis/keywords/new'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    postKeywordSet: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

describe('CourseKeywordsNew', () => {
    it('renders the course-keywords-new-component container', () => {
        render(<CourseKeywordsOverviewNew />);
        expect(
            screen.getByTestId('course-keywords-new-component')
        ).toBeInTheDocument();
    });

    it('renders company name in breadcrumb', () => {
        render(<CourseKeywordsOverviewNew />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders the Categories heading', () => {
        render(<CourseKeywordsOverviewNew />);
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });
});
