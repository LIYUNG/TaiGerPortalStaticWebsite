import { render, screen } from '@testing-library/react';
import ProgramRequirementsOverview from './ProgramRequirementsOverview';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({})),
    MRT_GlobalFilterTextField: () => <div data-testid="mrt-global-filter" />,
    MRT_ToggleFiltersButton: () => <div data-testid="mrt-toggle-filters" />
}));

vi.mock('react-router-dom', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    useNavigate: () => vi.fn()
}));

vi.mock('@store/constant', () => ({
    default: {
        KEYWORDS_EDIT: '/courses/analysis/keywords',
        CREATE_NEW_PROGRAM_ANALYSIS:
            '/courses/analysis/programs/requirements/new',
        EDIT_PROGRAM_ANALYSIS: (id: string) =>
            `/courses/analysis/programs/requirements/${id}/edit`,
        PROGRAM_ANALYSIS: '/courses/analysis/programs'
    }
}));

vi.mock('@/api', () => ({
    deleteProgramRequirement: vi.fn(() =>
        Promise.resolve({ data: { success: true } })
    )
}));

describe('ProgramRequirementsOverview', () => {
    it('renders MaterialReactTable with empty data', () => {
        render(<ProgramRequirementsOverview programRequirements={[]} />);
        expect(screen.getByTestId('mrt')).toBeInTheDocument();
    });
});
