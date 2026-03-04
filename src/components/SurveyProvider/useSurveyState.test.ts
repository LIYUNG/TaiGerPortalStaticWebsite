import { renderHook, act } from '@testing-library/react';

import { useSurveyState } from './useSurveyState';

vi.mock('@/api', () => ({
    updateAcademicBackground: vi.fn(),
    updateApplicationPreference: vi.fn(),
    updateDocumentationHelperLink: vi.fn(),
    updateLanguageSkill: vi.fn()
}));

const defaultInitialValue = {
    student_id: 'student-1',
    survey_link: 'https://example.com',
    academic_background: {
        university: { attended_high_school: '' },
        language: {}
    },
    application_preference: {}
};

describe('useSurveyState', () => {
    it('returns initial survey and handlers', () => {
        const { result } = renderHook(() =>
            useSurveyState({ initialValue: defaultInitialValue })
        );

        expect(result.current.survey).toEqual(defaultInitialValue);
        expect(result.current.survey.student_id).toBe('student-1');
        expect(result.current.survey.survey_link).toBe('https://example.com');
        expect(typeof result.current.handleChangeAcademic).toBe('function');
        expect(typeof result.current.handleChangeApplicationPreference).toBe(
            'function'
        );
        expect(typeof result.current.setApplicationPreferenceByField).toBe(
            'function'
        );
        expect(typeof result.current.handleTestDate).toBe('function');
        expect(typeof result.current.handleChangeLanguage).toBe('function');
        expect(typeof result.current.handleAcademicBackgroundSubmit).toBe(
            'function'
        );
        expect(typeof result.current.handleSurveyLanguageSubmit).toBe(
            'function'
        );
        expect(typeof result.current.handleApplicationPreferenceSubmit).toBe(
            'function'
        );
        expect(typeof result.current.updateDocLink).toBe('function');
        expect(typeof result.current.onChangeURL).toBe('function');
    });

    it('updates survey_link when onChangeURL is called', () => {
        const { result } = renderHook(() =>
            useSurveyState({ initialValue: defaultInitialValue })
        );

        act(() => {
            result.current.onChangeURL({
                preventDefault: vi.fn(),
                target: { value: 'https://new-link.com' }
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(result.current.survey.survey_link).toBe('https://new-link.com');
    });

    it('sets changed_academic when handleChangeAcademic is called', () => {
        const { result } = renderHook(() =>
            useSurveyState({ initialValue: defaultInitialValue })
        );

        act(() => {
            result.current.handleChangeAcademic({
                preventDefault: vi.fn(),
                target: { name: 'attended_high_school', value: 'Test High School' }
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(result.current.survey.changed_academic).toBe(true);
        expect(
            result.current.survey.academic_background?.university
                ?.attended_high_school
        ).toBe('Test High School');
    });

    it('sets changed_application_preference when handleChangeApplicationPreference is called', () => {
        const { result } = renderHook(() =>
            useSurveyState({ initialValue: defaultInitialValue })
        );

        act(() => {
            result.current.handleChangeApplicationPreference({
                preventDefault: vi.fn(),
                target: { name: 'target_degree', value: 'Master' }
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(result.current.survey.changed_application_preference).toBe(
            true
        );
        expect(
            result.current.survey.application_preference?.target_degree
        ).toBe('Master');
    });

    it('setApplicationPreferenceByField updates application_preference', () => {
        const { result } = renderHook(() =>
            useSurveyState({ initialValue: defaultInitialValue })
        );

        const setTargetSubjects =
            result.current.setApplicationPreferenceByField(
                'targetApplicationSubjects'
            );

        act(() => {
            setTargetSubjects(['CS', 'DS']);
        });

        expect(result.current.survey.changed_application_preference).toBe(
            true
        );
        expect(
            result.current.survey.application_preference
                ?.targetApplicationSubjects
        ).toEqual(['CS', 'DS']);
    });

    it('calls onSuccess when provided and API succeeds', async () => {
        const { updateAcademicBackground } = await import('@/api');
        vi.mocked(updateAcademicBackground).mockResolvedValue({
            data: { data: {}, success: true },
            status: 200
        } as never);

        const onSuccess = vi.fn();
        const { result } = renderHook(() =>
            useSurveyState({
                initialValue: defaultInitialValue,
                onSuccess
            })
        );

        await act(async () => {
            result.current.handleAcademicBackgroundSubmit(
                { preventDefault: vi.fn() } as React.FormEvent,
                result.current.survey.academic_background?.university ?? {}
            );
        });

        await vi.waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });
    });
});
