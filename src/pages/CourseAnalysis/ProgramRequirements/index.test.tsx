import { ReactNode, forwardRef, Ref } from 'react';
import { render, screen } from '@testing-library/react';
import ProgramRequirements from './index';

vi.mock('react-router-dom', () => {
    return {
        useLoaderData: () => ({ programRequirements: [] }),
        useNavigate: () => vi.fn(),
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
            children: ((data: unknown) => ReactNode) | ReactNode;
            resolve: unknown;
        }) => <>{typeof children === 'function' ? children([]) : children}</>,
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
    beforeEach(() => {
        render(<ProgramRequirements />);
    });

    it('renders ProgramRequirementsOverview via Await', () => {
        expect(
            screen.getByTestId('program-requirements-overview')
        ).toBeInTheDocument();
    });
});
