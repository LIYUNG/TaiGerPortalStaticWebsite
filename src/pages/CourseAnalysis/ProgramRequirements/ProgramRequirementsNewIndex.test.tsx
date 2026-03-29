import { ReactNode, forwardRef, Ref } from 'react';
import { render, screen } from '@testing-library/react';
import ProgramRequirementsNewIndex from './ProgramRequirementsNewIndex';

vi.mock('@/hooks/useProgramsAndCourseKeywordSets', () => ({
    useProgramsAndCourseKeywordSets: () => ({
        data: { distinctPrograms: [], keywordsets: [] },
        isLoading: false,
        isError: false,
        error: null,
        queryKey: ['program-requirements', 'programs-and-keywords'] as const
    })
}));

vi.mock('react-router-dom', () => ({
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
    })
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

vi.mock('./ProgramRequirementsNew', () => ({
    default: () => <div data-testid="program-requirements-new" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

describe('ProgramRequirementsNewIndex', () => {
    it('renders program_requirements_new_component container', () => {
        render(<ProgramRequirementsNewIndex />);
        expect(
            screen.getByTestId('program_requirements_new_component')
        ).toBeInTheDocument();
    });

    it('renders breadcrumb with company name', () => {
        render(<ProgramRequirementsNewIndex />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders ProgramRequirementsNew when data is loaded', () => {
        render(<ProgramRequirementsNewIndex />);
        expect(
            screen.getByTestId('program-requirements-new')
        ).toBeInTheDocument();
    });
});
