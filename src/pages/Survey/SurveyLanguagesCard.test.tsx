import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import SurveyLanguagesCard from './components/SurveyLanguagesCard';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';
import type { IUser } from '@taiger-common/model';

const t = (key: string) => key;

const baseSurvey: SurveyStateValue = {
    student_id: 'test-1',
    survey_link: 'https://example.com',
    academic_background: {
        university: {},
        language: {
            english_isPassed: '-',
            german_isPassed: '-',
            gre_isPassed: '-',
            gmat_isPassed: '-'
        }
    },
    application_preference: {},
    changed_language: false
};

const baseUser = { archiv: false, role: 'Agent' } as unknown as IUser;

const baseProps = {
    survey: baseSurvey,
    user: baseUser,
    t,
    handleChangeLanguage: vi.fn(),
    handleTestDate: vi.fn(),
    handleSurveyLanguageSubmit: vi.fn()
};

const renderCard = (props = baseProps) =>
    render(<SurveyLanguagesCard {...props} />);

describe('SurveyLanguagesCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Languages Test and Certificates heading', () => {
        renderCard();
        expect(
            screen.getByText('Languages Test and Certificates')
        ).toBeInTheDocument();
    });

    it('renders English isPassed dropdown', () => {
        renderCard();
        expect(
            screen.getByLabelText('English Passed ? (IELTS 6.5 / TOEFL 88)')
        ).toBeInTheDocument();
    });

    it('renders German isPassed dropdown', () => {
        renderCard();
        expect(
            screen.getByLabelText(
                'German Passed ? (Set Not need if applying English taught programs.)'
            )
        ).toBeInTheDocument();
    });

    it('renders GRE isPassed dropdown', () => {
        renderCard();
        expect(
            screen.getByLabelText('GRE Test ? (At least V145 Q160 )')
        ).toBeInTheDocument();
    });

    it('renders GMAT isPassed dropdown', () => {
        renderCard();
        expect(
            screen.getByLabelText('GMAT Test ? (At least 600 )')
        ).toBeInTheDocument();
    });

    it('shows English certificate select when english_isPassed is "O"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    english_isPassed: 'O',
                    english_certificate: 'IELTS'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByLabelText('English Certificate')
        ).toBeInTheDocument();
    });

    it('shows English certificate select when english_isPassed is "X"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    english_isPassed: 'X'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByLabelText('English Certificate')
        ).toBeInTheDocument();
    });

    it('does not show English certificate when english_isPassed is "-"', () => {
        renderCard();
        expect(
            screen.queryByLabelText('English Certificate')
        ).not.toBeInTheDocument();
    });

    it('shows English score fields when english_isPassed is "O"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    english_isPassed: 'O',
                    english_certificate: 'IELTS'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('Overall')).toBeInTheDocument();
        expect(screen.getByLabelText('Reading')).toBeInTheDocument();
        expect(screen.getByLabelText('Listening')).toBeInTheDocument();
        expect(screen.getByLabelText('Writing')).toBeInTheDocument();
        expect(screen.getByLabelText('Speaking')).toBeInTheDocument();
    });

    it('does not show English score fields when english_isPassed is "X"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    english_isPassed: 'X'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.queryByLabelText('Overall')).not.toBeInTheDocument();
    });

    it('shows German certificate select when german_isPassed is "O"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    german_isPassed: 'O'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('German Certificate')).toBeInTheDocument();
    });

    it('shows passport warning banner when english_isPassed is "X"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    english_isPassed: 'X'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByText('護照')).toBeInTheDocument();
    });

    it('shows passport warning banner when german_isPassed is "X"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    german_isPassed: 'X'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByText('護照')).toBeInTheDocument();
    });

    it('does not show passport warning banner when all isPassed are not "X"', () => {
        renderCard();
        expect(screen.queryByText('護照')).not.toBeInTheDocument();
    });

    it('renders Update button disabled when changed_language is false', () => {
        renderCard();
        const updateButton = screen.getByRole('button', { name: 'Update' });
        expect(updateButton).toBeDisabled();
    });

    it('renders Update button enabled when changed_language is true', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            changed_language: true
        };
        renderCard({ ...baseProps, survey });
        const updateButton = screen.getByRole('button', { name: 'Update' });
        expect(updateButton).not.toBeDisabled();
    });

    it('does not show Update button for archived users', () => {
        const archivedUser = {
            ...baseUser,
            archiv: true
        } as unknown as IUser;
        renderCard({ ...baseProps, user: archivedUser });
        expect(
            screen.queryByRole('button', { name: 'Update' })
        ).not.toBeInTheDocument();
    });

    it('calls handleChangeLanguage when German score field changes', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    german_isPassed: 'O'
                }
            }
        };
        const props = { ...baseProps, survey };
        renderCard(props);
        const input = screen.getByLabelText('German Test Score');
        fireEvent.change(input, {
            target: { name: 'german_score', value: '4' }
        });
        expect(props.handleChangeLanguage).toHaveBeenCalledTimes(1);
    });

    it('calls handleSurveyLanguageSubmit when Update button is clicked', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            changed_language: true
        };
        renderCard({ ...baseProps, survey });
        const updateButton = screen.getByRole('button', { name: 'Update' });
        fireEvent.click(updateButton);
        expect(baseProps.handleSurveyLanguageSubmit).toHaveBeenCalledTimes(1);
    });

    it('shows GRE certificate select when gre_isPassed is "O"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    gre_isPassed: 'O',
                    gre_certificate: 'GRE General'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('GRE Test')).toBeInTheDocument();
    });

    it('shows GMAT certificate select when gmat_isPassed is "O"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    gmat_isPassed: 'O',
                    gmat_certificate: 'GMAT'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('GMAT Test')).toBeInTheDocument();
    });

    it('shows GRE score field when gre_isPassed is "O" and gre_certificate is set', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    gre_isPassed: 'O',
                    gre_certificate: 'GRE General'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('GRE Test Score')).toBeInTheDocument();
    });

    it('shows GMAT score field when gmat_isPassed is "O" and gmat_certificate is set', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                language: {
                    ...baseSurvey.academic_background?.language,
                    gmat_isPassed: 'O',
                    gmat_certificate: 'GMAT'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(screen.getByLabelText('GMAT Test Score')).toBeInTheDocument();
    });
});
