import React from 'react';
import { render, screen } from '@testing-library/react';

import SurveyMissingFieldsAlerts from './components/SurveyMissingFieldsAlerts';

const t = (key: string) => key;

describe('SurveyMissingFieldsAlerts', () => {
    it('renders missing academic/application card when data is incomplete', () => {
        const survey = {
            student_id: 's1',
            survey_link: '',
            academic_background: {},
            application_preference: {}
        };
        render(<SurveyMissingFieldsAlerts survey={survey} t={t} />);
        expect(
            screen.getByText('The followings information are still missing')
        ).toBeInTheDocument();
    });

    it('renders missing language skills card when languages not filled', () => {
        const survey = {
            student_id: 's1',
            survey_link: '',
            academic_background: {
                university: {
                    attended_high_school: 'X',
                    high_school_isGraduated: 'X',
                    isGraduated: 'X'
                },
                language: {}
            },
            application_preference: {
                expected_application_date: '2025',
                expected_application_semester: 'WS',
                target_degree: 'Master',
                target_program_language: 'English'
            }
        };
        render(<SurveyMissingFieldsAlerts survey={survey} t={t} />);
        expect(
            screen.getByText(
                'Your language skills and certificates information are still missing or not up-to-date'
            )
        ).toBeInTheDocument();
    });
});
