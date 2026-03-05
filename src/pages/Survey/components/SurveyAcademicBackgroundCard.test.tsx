import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyAcademicBackgroundCard from './SurveyAcademicBackgroundCard';

vi.mock('@taiger-common/core', () => ({
    Bayerische_Formel: vi.fn(() => 2.5),
    is_TaiGer_Admin: vi.fn(() => false)
}));

vi.mock('@utils/contants', () => ({
    BACHELOR_GRADUATE_STATUS_OPTIONS: [{ value: 'graduated', label: 'Graduated' }],
    DUAL_STATE_OPTIONS: [{ value: 'No', label: 'No' }],
    HIG_SCHOOL_TRI_STATE_OPTIONS: [{ value: 'Yes', label: 'Yes' }],
    convertDate: (d: string) => d,
    APPLICATION_YEARS_FUTURE: () => [{ value: 2025, label: '2025' }]
}));

vi.mock('@mui/material/colors', () => ({
    grey: { 500: '#9e9e9e' }
}));

const tFn = (k: string) => k;

const mockSurvey = {
    academic_background: {
        language: {},
        university: {
            Highest_GPA_Uni: '4.0',
            Passing_GPA_Uni: '2.0',
            My_GPA_Uni: '3.5',
            isGraduated: 'graduated',
            expected_graduation_date: '',
            high_school_isGraduated: 'Yes',
            Has_Internship_Experience: 'No',
            Has_Working_Experience: 'No'
        },
        high_school: {
            isGraduated: '',
            high_school_name: ''
        }
    },
    changed_academic: false
};

const defaultProps = {
    survey: mockSurvey as any,
    user: { role: 'Agent', _id: 'a1', archiv: false },
    t: tFn,
    handleChangeAcademic: vi.fn(),
    handleAcademicBackgroundSubmit: vi.fn(),
    openOffcanvasWindow: vi.fn(),
    surveyLink: '',
    anchorEl: null,
    onClosePopover: vi.fn(),
    onOpenPopover: vi.fn()
};

describe('SurveyAcademicBackgroundCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SurveyAcademicBackgroundCard {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders Academic Background Survey heading', () => {
        expect(screen.getByText('Academic Background Survey')).toBeInTheDocument();
    });

    it('renders High School section', () => {
        expect(screen.getByText('High School')).toBeInTheDocument();
    });

    it('renders update button', () => {
        expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });
});
