import { ReactNode, forwardRef, Ref } from 'react';
import { render, screen } from '@testing-library/react';
import ProgramRequirementsEditIndex from './ProgramRequirementsEditIndex';

vi.mock('react-router-dom', () => {
    return {
        useLoaderData: () => ({ programRequirement: null }),
        useNavigate: () => vi.fn(),
        useParams: () => ({ requirementId: 'req-123' }),
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
        }),
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
        Suspense: ({ children }: { children: ReactNode }) => <>{children}</>
    };
});

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
