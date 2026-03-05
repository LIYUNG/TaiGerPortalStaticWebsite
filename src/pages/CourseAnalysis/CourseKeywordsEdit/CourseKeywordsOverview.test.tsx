import { render, screen } from '@testing-library/react';
import CourseKeywordsOverview from './CourseKeywordsOverview';

vi.mock('react-router-dom', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
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
    it('renders Categories heading', () => {
        render(<CourseKeywordsOverview courseKeywordSets={[]} />);
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders Create link/button', () => {
        render(<CourseKeywordsOverview courseKeywordSets={[]} />);
        expect(screen.getByText('Create')).toBeInTheDocument();
    });

    it('renders the MRT localization table', () => {
        render(<CourseKeywordsOverview courseKeywordSets={[]} />);
        expect(screen.getByTestId('mrt-localization')).toBeInTheDocument();
    });
});
