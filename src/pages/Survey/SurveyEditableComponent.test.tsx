import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SurveyEditableComponent from './SurveyEditableComponent';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { archiv: false, role: 'Agent' } })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@taiger-common/core', () => ({
    Bayerische_Formel: () => '2.5',
    is_TaiGer_Admin: () => true,
    is_TaiGer_Student: () => false
}));

const mockSurvey: SurveyStateValue = {
    student_id: 'test-1',
    survey_link: 'https://example.com',
    academic_background: {
        university: {
            attended_high_school: 'Test School',
            high_school_isGraduated: '-',
            isGraduated: '-'
        },
        language: {}
    },
    application_preference: {}
};

const mockHandlers = {
    handleChangeAcademic: vi.fn(),
    handleChangeApplicationPreference: vi.fn(),
    setApplicationPreferenceByField: () => vi.fn(),
    handleTestDate: vi.fn(),
    handleChangeLanguage: vi.fn(),
    handleAcademicBackgroundSubmit: vi.fn(),
    handleSurveyLanguageSubmit: vi.fn(),
    handleApplicationPreferenceSubmit: vi.fn(),
    updateDocLink: vi.fn(),
    onChangeURL: vi.fn()
};

const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SurveyEditableComponent', () => {
    it('renders without crashing when given survey and handlers', () => {
        renderWithRouter(
            <SurveyEditableComponent
                survey={mockSurvey}
                {...mockHandlers}
            />
        );
        expect(
            screen.getByText('Academic Background Survey')
        ).toBeInTheDocument();
    });

    it('renders Application Preference section', () => {
        renderWithRouter(
            <SurveyEditableComponent
                survey={mockSurvey}
                {...mockHandlers}
            />
        );
        expect(screen.getByText('Application Preference')).toBeInTheDocument();
    });

    it('renders Languages Test and Certificates section', () => {
        renderWithRouter(
            <SurveyEditableComponent
                survey={mockSurvey}
                {...mockHandlers}
            />
        );
        expect(
            screen.getByText('Languages Test and Certificates')
        ).toBeInTheDocument();
    });
});
