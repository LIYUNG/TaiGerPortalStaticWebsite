import { render, screen } from '@testing-library/react';
import ProgramRequirements from './index';

vi.mock('react-router-dom', () => ({
    useLoaderData: () => ({ programRequirements: [] }),
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
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

vi.mock('./ProgramRequirementsOverview', () => ({
    default: () => <div data-testid="program-requirements-overview" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

describe('ProgramRequirements (index)', () => {
    it('renders program_requirements_component container', () => {
        render(<ProgramRequirements />);
        expect(
            screen.getByTestId('program_requirements_component')
        ).toBeInTheDocument();
    });

    it('renders breadcrumb with company name', () => {
        render(<ProgramRequirements />);
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders ProgramRequirementsOverview via Await', () => {
        render(<ProgramRequirements />);
        expect(
            screen.getByTestId('program-requirements-overview')
        ).toBeInTheDocument();
    });
});
