import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyApplicationPreferenceCard from './SurveyApplicationPreferenceCard';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@utils/contants', () => ({
    convertDate: (d: string) => d,
    DEGREE_ARRAY_OPTIONS: [{ value: 'M.Sc.', label: 'Master of Science' }],
    EXPECTATION_APPLICATION_YEARS: () => [{ value: '2025', label: '2025' }],
    LANGUAGES_PREFERENCE_ARRAY_OPTIONS: [{ value: 'English', label: 'English' }],
    PROGRAM_SUBJECTS_DETAILED: [],
    SEMESTER_ARRAY_OPTIONS: [{ value: 'WS', label: 'Winter Semester' }],
    TRI_STATE_OPTIONS: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: '-', label: '-' }]
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div>SearchableMultiSelect</div>
}));

const tFn = (k: string) => k;

const mockSurvey = {
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS',
        target_degree: 'M.Sc.',
        target_program_language: 'English',
        application_outside_germany: 'Yes',
        considered_privat_universities: 'No',
        special_wished: '',
        target_application_field: '',
        targetApplicationSubjects: [],
        updatedAt: '2025-01-01'
    },
    changed_application_preference: false
};

const defaultProps = {
    survey: mockSurvey as any,
    user: { role: 'Agent', _id: 'a1', archiv: false },
    t: tFn,
    handleChangeApplicationPreference: vi.fn(),
    setApplicationPreferenceByField: vi.fn(() => vi.fn()),
    handleApplicationPreferenceSubmit: vi.fn()
};

describe('SurveyApplicationPreferenceCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SurveyApplicationPreferenceCard {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders Application Preference heading', () => {
        expect(screen.getByText('Application Preference')).toBeInTheDocument();
    });

    it('renders expected application year field', () => {
        expect(screen.getAllByText(/expected application year/i)[0]).toBeInTheDocument();
    });

    it('renders target degree field', () => {
        expect(screen.getAllByText(/target degree programs/i)[0]).toBeInTheDocument();
    });

    it('renders update button', () => {
        expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });
});
