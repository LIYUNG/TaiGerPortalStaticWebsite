import { render, screen } from '@testing-library/react';
import ProgramRequirementsNew from './ProgramRequirementsNew';

vi.mock('react-router-dom', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
    useNavigate: () => vi.fn(),
    useParams: () => ({})
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        PROGRAMS: '/programs',
        PROGRAM_ANALYSIS: '/courses/analysis/programs',
        KEYWORDS_EDIT: '/courses/analysis/keywords',
        CREATE_NEW_PROGRAM_ANALYSIS:
            '/courses/analysis/programs/requirements/new'
    }
}));

vi.mock('@/api', () => ({
    postProgramRequirements: vi.fn(() =>
        Promise.resolve({ data: { success: true } })
    ),
    putProgramRequirement: vi.fn(() =>
        Promise.resolve({ data: { success: true } })
    )
}));

vi.mock('@utils/contants', () => ({
    ADMISSION_DESCRIPTION: {
        name: 'admissionDescription',
        label: 'Admission Description',
        description: ''
    },
    CONSIDRED_SCORES_DETAILED: [],
    FPSO: { name: 'fpso', label: 'FPSO', description: '' },
    PROGRAM_SUBJECTS_DETAILED: [],
    SCORES_TYPE: []
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div data-testid="searchable-multi-select" />
}));

const defaultProps = {
    programsAndCourseKeywordSets: {
        distinctPrograms: [],
        keywordsets: [],
        requirement: undefined
    }
};

describe('ProgramRequirementsNew', () => {
    it('renders Create new program analysis heading when no requirementId', () => {
        render(<ProgramRequirementsNew {...defaultProps} />);
        expect(
            screen.getByText('Create new program analysis')
        ).toBeInTheDocument();
    });

    it('renders Add Category button', () => {
        render(<ProgramRequirementsNew {...defaultProps} />);
        expect(
            screen.getByRole('button', { name: /Add Category/i })
        ).toBeInTheDocument();
    });

    it('renders Create submit button', () => {
        render(<ProgramRequirementsNew {...defaultProps} />);
        expect(
            screen.getByRole('button', { name: /Create/i })
        ).toBeInTheDocument();
    });
});
