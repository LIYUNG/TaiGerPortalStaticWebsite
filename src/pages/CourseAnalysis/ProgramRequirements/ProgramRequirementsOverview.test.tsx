import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import ProgramRequirementsOverview from './ProgramRequirementsOverview';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({})),
    MRT_GlobalFilterTextField: () => <div data-testid="mrt-global-filter" />,
    MRT_ToggleFiltersButton: () => <div data-testid="mrt-toggle-filters" />
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
        useNavigate: () => vi.fn()
    };
});

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
