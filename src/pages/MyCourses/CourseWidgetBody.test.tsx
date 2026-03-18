import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseWidgetBody from './CourseWidgetBody';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        KEYWORDS_EDIT: '/keywords',
        COURSE_DATABASE: '/courses-db',
        PROGRAM_ANALYSIS: '/program-analysis',
        CREATE_NEW_PROGRAM_ANALYSIS: '/create-analysis',
        INTERNAL_WIDGET_V2_LINK: () => '/widget'
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ student_id: 's1' }) };
});

vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    WidgetTranscriptanalyserV2: vi.fn()
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: React.ReactNode;
        index: number;
        value: number;
    }) => (index === value ? <div>{children}</div> : null),
    a11yProps: () => ({})
}));

vi.mock(
    '@components/ProgramRequirementsTable/ProgramRequirementsTable',
    () => ({
        ProgramRequirementsTable: () => (
            <div data-testid="program-requirements-table">
                ProgramRequirementsTable
            </div>
        )
    })
);

vi.mock('@utils/contants', () => ({
    convertDateUXFriendly: (d: string) => d
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

vi.mock('react-datasheet-grid', () => ({
    DataSheetGrid: () => <div data-testid="data-sheet-grid">DataSheetGrid</div>,
    textColumn: {},
    keyColumn: (_key: string, col: unknown) => ({ ...col, id: _key })
}));

vi.mock('./react-datasheet-customize.css', () => ({}));

describe('CourseWidgetBody', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CourseWidgetBody programRequirements={[]} />
            </MemoryRouter>
        );
    });

    it('renders Course Analyser heading', () => {
        expect(screen.getByText(/course analyser/i)).toBeInTheDocument();
    });

    it('renders DataSheetGrid', () => {
        expect(screen.getByTestId('data-sheet-grid')).toBeInTheDocument();
    });

    it('renders Edit Keywords button', () => {
        expect(screen.getByText(/edit keywords/i)).toBeInTheDocument();
    });

    it('renders ProgramRequirementsTable', () => {
        expect(
            screen.getByTestId('program-requirements-table')
        ).toBeInTheDocument();
    });
});
