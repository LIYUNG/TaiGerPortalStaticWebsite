import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyLanguagesCard from './SurveyLanguagesCard';

vi.mock('@utils/contants', () => ({
    ENGLISH_CERTIFICATE_ARRAY_OPTIONS: [{ value: 'IELTS', label: 'IELTS' }],
    GERMAN_CERTIFICATE_ARRAY_OPTIONS: [{ value: 'TestDaF', label: 'TestDaF', disabled: false }],
    GMAT_CERTIFICATE_OPTIONS: [{ value: 'GMAT', label: 'GMAT', disabled: false }],
    GRE_CERTIFICATE_ARRAY_OPTIONS: [{ value: 'GRE', label: 'GRE', disabled: false }],
    IS_PASSED_OPTIONS: [
        { value: '-', label: '-' },
        { value: 'O', label: 'Yes' },
        { value: 'X', label: 'No' }
    ],
    convertDate: (d: string) => d
}));

vi.mock('@mui/x-date-pickers', () => ({
    DatePicker: () => <div>DatePicker</div>,
    LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
    AdapterDayjs: vi.fn()
}));

vi.mock('dayjs', () => ({
    default: () => ({ isValid: () => false, toDate: () => new Date() })
}));

const tFn = (k: string) => k;

const mockSurvey = {
    academic_background: {
        language: {
            english_isPassed: '-',
            german_isPassed: '-',
            gre_isPassed: '-',
            gmat_isPassed: '-'
        }
    },
    changed_language: false
};

const defaultProps = {
    survey: mockSurvey as any,
    user: { role: 'Agent', _id: 'a1', archiv: false },
    t: tFn,
    handleChangeLanguage: vi.fn(),
    handleTestDate: vi.fn(),
    handleSurveyLanguageSubmit: vi.fn()
};

describe('SurveyLanguagesCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SurveyLanguagesCard {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders Languages Test and Certificates heading', () => {
        expect(screen.getByText(/languages test and certificates/i)).toBeInTheDocument();
    });

    it('renders English passed field', () => {
        expect(screen.getAllByText(/english passed/i)[0]).toBeInTheDocument();
    });

    it('renders German passed field', () => {
        expect(screen.getAllByText(/german passed/i)[0]).toBeInTheDocument();
    });

    it('renders Update button', () => {
        expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });
});
