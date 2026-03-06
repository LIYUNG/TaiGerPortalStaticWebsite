import { ReactNode, forwardRef, Ref } from 'react';
import { render, screen } from '@testing-library/react';
import ProgramRequirementsNewIndex from './ProgramRequirementsNewIndex';

vi.mock('react-router-dom', () => {
    return {
        useLoaderData: () => ({ programsAndCourseKeywordSets: null }),
        useNavigate: () => vi.fn(),
        useParams: () => ({}),
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

    it('renders ProgramRequirementsNew via Await', () => {
        render(<ProgramRequirementsNewIndex />);
        expect(
            screen.getByTestId('program-requirements-new')
        ).toBeInTheDocument();
    });
});
