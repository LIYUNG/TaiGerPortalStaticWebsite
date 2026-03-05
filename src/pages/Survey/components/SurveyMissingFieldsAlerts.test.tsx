import { render, screen } from '@testing-library/react';
import SurveyMissingFieldsAlerts from './SurveyMissingFieldsAlerts';

vi.mock('../../Utils/checking-functions', () => ({
    MissingSurveyFieldsListArray: vi.fn(() => [
        'Missing field A',
        'Missing field B'
    ])
}));

vi.mock('../../Utils/util_functions', () => ({
    check_academic_background_filled: vi.fn(() => false),
    check_application_preference_filled: vi.fn(() => false),
    check_languages_filled: vi.fn(() => false)
}));

const t = (k: string) => k;

const incompleteSurvey = {
    academic_background: {
        language: {
            english_isPassed: '-',
            german_isPassed: '-',
            gre_isPassed: '-',
            gmat_isPassed: '-'
        }
    },
    application_preference: {}
} as any;

describe('SurveyMissingFieldsAlerts', () => {
    it('shows missing fields card when background incomplete', () => {
        render(<SurveyMissingFieldsAlerts survey={incompleteSurvey} t={t} />);
        expect(
            screen.getByText('The followings information are still missing')
        ).toBeInTheDocument();
    });

    it('shows missing field items', () => {
        render(<SurveyMissingFieldsAlerts survey={incompleteSurvey} t={t} />);
        expect(screen.getByText('Missing field A')).toBeInTheDocument();
        expect(screen.getByText('Missing field B')).toBeInTheDocument();
    });

    it('shows language missing card', () => {
        render(<SurveyMissingFieldsAlerts survey={incompleteSurvey} t={t} />);
        expect(
            screen.getByText(
                'Your language skills and certificates information are still missing or not up-to-date'
            )
        ).toBeInTheDocument();
    });
});
