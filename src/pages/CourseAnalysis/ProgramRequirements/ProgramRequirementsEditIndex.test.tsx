import { render, screen } from '@testing-library/react';
import ProgramRequirementsEditIndex from './ProgramRequirementsEditIndex';

vi.mock('react-router-dom', () => ({
    useLoaderData: () => ({ programRequirement: null }),
    useNavigate: () => vi.fn(),
    useParams: () => ({ requirementId: 'req-123' }),
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    Await: ({
        children
    }: {
        children: ((data: unknown) => React.ReactNode) | React.ReactNode;
        resolve: unknown;
    }) => (
        <>
            {typeof children === 'function'
                ? children({ distinctPrograms: [], keywordsets: [] })
                : children}
        </>
    ),
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

vi.mock('./ProgramRequirementsNew', () => ({
    default: () => <div data-testid="program-requirements-new" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

describe('ProgramRequirementsEditIndex', () => {
    it('renders program_requirements_edit_component container', () => {
        render(<ProgramRequirementsEditIndex />);
        expect(
            screen.getByTestId('program_requirements_edit_component')
        ).toBeInTheDocument();
    });

    it('renders breadcrumb with company name', () => {
        render(<ProgramRequirementsEditIndex />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders ProgramRequirementsNew via Await', () => {
        render(<ProgramRequirementsEditIndex />);
        expect(
            screen.getByTestId('program-requirements-new')
        ).toBeInTheDocument();
    });
});
