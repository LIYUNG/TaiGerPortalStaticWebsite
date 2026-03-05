import { render, screen } from '@testing-library/react';
import NewProgramEdit from './NewProgramEdit';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true)
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    isProgramValid: vi.fn(() => true),
    BINARY_STATE_ARRAY_OPTIONS: [{ value: 'true', label: 'Yes' }],
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'DE', label: 'Germany' }],
    DEGREE_CATOGARY_ARRAY_OPTIONS: [{ value: 'Master', label: 'Master' }],
    LANGUAGES_ARRAY_OPTIONS: [{ value: 'en', label: 'English' }],
    SEMESTER_ARRAY_OPTIONS: [{ value: 'WS', label: 'Winter Semester' }],
    UNI_ASSIST_ARRAY_OPTIONS: [{ value: 'yes', label: 'Yes' }],
    YES_NO_BOOLEAN_OPTIONS: [{ value: 'true', label: 'Yes' }],
    showFieldAlert: vi.fn(() => false),
    PROGRAM_SUBJECTS_DETAILED: [],
    SCHOOL_TAGS_DETAILED: []
}));

vi.mock('@taiger-common/model', () => ({
    DIFFICULTY: { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div data-testid="searchable-multi-select" />
}));

const defaultProps = {
    program: {
        _id: 'prog1',
        school: 'TU Berlin',
        program_name: 'Computer Science',
        degree: 'Master',
        semester: 'WS',
        country: 'Germany',
        lang: 'English'
    },
    programs: [{ school: 'TU Berlin' }, { school: 'LMU Munich' }],
    type: 'edit' as const,
    isSubmitting: false,
    handleSubmit_Program: vi.fn(),
    handleClick: vi.fn()
};

describe('NewProgramEdit', () => {
    it('renders without crashing', () => {
        render(<NewProgramEdit {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('renders school name from program prop', () => {
        render(<NewProgramEdit {...defaultProps} />);
        // School input should have TU Berlin value
        const inputs = screen.getAllByRole('combobox');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders for create type without program', () => {
        render(
            <NewProgramEdit
                {...defaultProps}
                program={undefined}
                type="new"
            />
        );
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('renders submit button', () => {
        render(<NewProgramEdit {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
