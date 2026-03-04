import { render, screen } from '@testing-library/react';

import SurveyComponent from './SurveyComponent';
import { useSurveyState } from '@components/SurveyProvider/useSurveyState';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';

vi.mock('@components/SurveyProvider/useSurveyState');

vi.mock('./SurveyEditableComponent', () => ({
    default: (props: Record<string, unknown>) => (
        <div data-testid="survey-editable">
            <span data-testid="survey-student-id">
                {String((props.survey as { student_id?: string })?.student_id ?? '')}
            </span>
            <span data-testid="survey-link">
                {String((props.survey as { survey_link?: string })?.survey_link ?? '')}
            </span>
        </div>
    )
}));

const mockInitialSurvey: SurveyStateValue = {
    student_id: 'test-student-123',
    survey_link: 'https://survey.example.com',
    academic_background: { university: {}, language: {} },
    application_preference: {}
};

describe('SurveyComponent', () => {
    beforeEach(() => {
        vi.mocked(useSurveyState).mockReturnValue({
            survey: mockInitialSurvey,
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
        });
    });

    it('renders SurveyEditableComponent with survey from useSurveyState', () => {
        render(<SurveyComponent initialSurvey={mockInitialSurvey} />);

        expect(screen.getByTestId('survey-editable')).toBeInTheDocument();
        expect(screen.getByTestId('survey-student-id').textContent).toBe(
            'test-student-123'
        );
        expect(screen.getByTestId('survey-link').textContent).toBe(
            'https://survey.example.com'
        );
    });

    it('calls useSurveyState with initialSurvey and optional onSurveySuccess', () => {
        const onSurveySuccess = vi.fn();
        render(
            <SurveyComponent
                initialSurvey={mockInitialSurvey}
                onSurveySuccess={onSurveySuccess}
            />
        );

        expect(useSurveyState).toHaveBeenCalledWith({
            initialValue: mockInitialSurvey,
            onSuccess: onSurveySuccess
        });
    });
});
