import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SurveyAcademicBackgroundCard from './components/SurveyAcademicBackgroundCard';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';
import type { IUser } from '@taiger-common/model';
import { is_TaiGer_Admin } from '@taiger-common/core';

vi.mock('@taiger-common/core', () => ({
    Bayerische_Formel: vi.fn(() => '2.5'),
    is_TaiGer_Admin: vi.fn(() => false)
}));

const t = (key: string) => key;

const baseSurvey: SurveyStateValue = {
    student_id: 'test-1',
    survey_link: 'https://example.com',
    academic_background: {
        university: {
            attended_high_school: 'Test High School',
            high_school_isGraduated: '-',
            isGraduated: '-',
            Has_Internship_Experience: '-',
            Has_Working_Experience: '-'
        },
        language: {}
    },
    application_preference: {},
    changed_academic: false
};

const baseUser = { archiv: false, role: 'Agent' } as unknown as IUser;

const baseProps = {
    survey: baseSurvey,
    user: baseUser,
    t,
    handleChangeAcademic: vi.fn(),
    handleAcademicBackgroundSubmit: vi.fn(),
    openOffcanvasWindow: vi.fn(),
    surveyLink: 'https://example.com',
    anchorEl: null,
    onClosePopover: vi.fn(),
    onOpenPopover: vi.fn()
};

const renderCard = (props = baseProps) =>
    render(
        <MemoryRouter>
            <SurveyAcademicBackgroundCard {...props} />
        </MemoryRouter>
    );

describe('SurveyAcademicBackgroundCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(is_TaiGer_Admin).mockReturnValue(false);
    });

    it('renders Academic Background Survey heading', () => {
        renderCard();
        expect(
            screen.getByText('Academic Background Survey')
        ).toBeInTheDocument();
    });

    it('renders High School section label', () => {
        renderCard();
        expect(screen.getByText('High School')).toBeInTheDocument();
    });

    it('renders High School Name field', () => {
        renderCard();
        expect(
            screen.getByLabelText('High School Name (English)')
        ).toBeInTheDocument();
    });

    it('renders University (Bachelor degree) section label', () => {
        renderCard();
        expect(
            screen.getByText('University (Bachelor degree)')
        ).toBeInTheDocument();
    });

    it('renders Practical Experience section', () => {
        renderCard();
        expect(
            screen.getByText('Practical Experience')
        ).toBeInTheDocument();
    });

    it('renders GPA section with Corresponding German GPA System label', () => {
        renderCard();
        expect(
            screen.getByText('Corresponding German GPA System:')
        ).toBeInTheDocument();
    });

    it('shows high school graduation year field when high_school_isGraduated is not "-"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    high_school_isGraduated: 'Yes'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByPlaceholderText('2016')
        ).toBeInTheDocument();
    });

    it('does not show high school graduation year field when high_school_isGraduated is "-"', () => {
        renderCard();
        expect(
            screen.queryByPlaceholderText('2016')
        ).not.toBeInTheDocument();
    });

    it('shows university name field when isGraduated is "Yes"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    isGraduated: 'Yes'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByLabelText('University Name (Bachelor degree)')
        ).toBeInTheDocument();
    });

    it('shows university name field when isGraduated is "pending"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    isGraduated: 'pending'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByLabelText('University Name (Bachelor degree)')
        ).toBeInTheDocument();
    });

    it('does not show university name field when isGraduated is "-"', () => {
        renderCard();
        expect(
            screen.queryByLabelText('University Name (Bachelor degree)')
        ).not.toBeInTheDocument();
    });

    it('shows Second degree section when isGraduated is "Yes"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    isGraduated: 'Yes'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.getByText(
                'Second degree (Another Bachelor or Master)'
            )
        ).toBeInTheDocument();
    });

    it('does not show Second degree section when isGraduated is "pending"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    isGraduated: 'pending'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        expect(
            screen.queryByText(
                'Second degree (Another Bachelor or Master)'
            )
        ).not.toBeInTheDocument();
    });

    it('renders Update button disabled when changed_academic is false', () => {
        renderCard();
        const updateButton = screen.getByRole('button', {
            name: 'Update'
        });
        expect(updateButton).toBeDisabled();
    });

    it('renders Update button enabled when changed_academic is true', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            changed_academic: true
        };
        renderCard({ ...baseProps, survey });
        const updateButton = screen.getByRole('button', {
            name: 'Update'
        });
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

    it('shows Edit button for admin users', () => {
        vi.mocked(is_TaiGer_Admin).mockReturnValue(true);
        renderCard({ ...baseProps, user: { ...baseUser, role: 'Admin' } as unknown as IUser });
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });

    it('calls handleChangeAcademic when High School Name field changes', () => {
        renderCard();
        const input = screen.getByLabelText('High School Name (English)');
        fireEvent.change(input, {
            target: { name: 'attended_high_school', value: 'New School' }
        });
        expect(baseProps.handleChangeAcademic).toHaveBeenCalledTimes(1);
    });

    it('calls handleAcademicBackgroundSubmit when Update button is clicked', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            changed_academic: true
        };
        renderCard({ ...baseProps, survey });
        const updateButton = screen.getByRole('button', { name: 'Update' });
        fireEvent.click(updateButton);
        expect(baseProps.handleAcademicBackgroundSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls openOffcanvasWindow when Edit button is clicked by admin', () => {
        vi.mocked(is_TaiGer_Admin).mockReturnValue(true);
        const props = {
            ...baseProps,
            user: { ...baseUser, role: 'Admin' } as unknown as IUser
        };
        renderCard(props);
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);
        expect(props.openOffcanvasWindow).toHaveBeenCalledTimes(1);
    });

    it('renders gpa-instructions link', () => {
        renderCard();
        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
    });

    it('shows Popover formula text when anchorEl is set', () => {
        const anchorEl = document.createElement('div');
        renderCard({ ...baseProps, anchorEl });
        // Popover is open: the formula text including the equals sign should be visible
        expect(screen.getByText(/= 1 \+ \(3 \*/)).toBeInTheDocument();
    });

    it('renders second degree university fields when isSecondGraduated is "Yes"', () => {
        const survey: SurveyStateValue = {
            ...baseSurvey,
            academic_background: {
                ...baseSurvey.academic_background,
                university: {
                    ...baseSurvey.academic_background?.university,
                    isGraduated: 'Yes',
                    isSecondGraduated: 'Yes'
                }
            }
        };
        renderCard({ ...baseProps, survey });
        const programNames = screen.getAllByLabelText('Program Name');
        expect(programNames.length).toBeGreaterThan(0);
    });
});
