import React from 'react';
import { render, screen } from '@testing-library/react';
import CourseKeywordsOverview from './CourseKeywordsOverview';

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

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    deleteKeywordSet: vi.fn(() => Promise.resolve({ success: true })),
    putKeywordSet: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@components/MaterialReactTable', () => ({
    default: () => <div data-testid="mrt-localization" />
}));

vi.mock('@utils/contants', () => ({
    col_keywords: []
}));

describe('CourseKeywordsOverview', () => {
    beforeEach(() => {
        render(<CourseKeywordsOverview courseKeywordSets={[]} />);
    });
    it('renders Categories heading', () => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders Create link/button', () => {
        expect(screen.getByText('Create')).toBeInTheDocument();
    });

    it('renders the MRT localization table', () => {
        expect(screen.getByTestId('mrt-localization')).toBeInTheDocument();
    });
});
