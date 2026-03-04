import React from 'react';
import { render, screen } from '@testing-library/react';

import SurveyApplicationPreferenceCard from './components/SurveyApplicationPreferenceCard';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: () => false
}));

const t = (key: string) => key;
const survey = {
    student_id: 's1',
    survey_link: '',
    academic_background: {},
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS'
    }
};

const defaultProps = {
    survey,
    user: { archiv: false },
    t,
    handleChangeApplicationPreference: vi.fn(),
    setApplicationPreferenceByField: () => vi.fn(),
    handleApplicationPreferenceSubmit: vi.fn()
};

describe('SurveyApplicationPreferenceCard', () => {
    it('renders Application Preference title', () => {
        render(<SurveyApplicationPreferenceCard {...defaultProps} />);
        expect(screen.getByText('Application Preference')).toBeInTheDocument();
    });

    it('renders Expected Application Year field', () => {
        render(<SurveyApplicationPreferenceCard {...defaultProps} />);
        expect(
            screen.getByLabelText(/Expected Application Year/)
        ).toBeInTheDocument();
    });

    it('renders Update button when user is not archived', () => {
        render(<SurveyApplicationPreferenceCard {...defaultProps} />);
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });
});
