import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentApplicationCard from './StudentApplicationCard';
import type { Application } from '@/api/types';
import type { IStudentResponse } from '@taiger-common/model';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer', vpdEnable: false }
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: (a: { decided?: string }) => a.decided === 'O',
    isProgramSubmitted: (a: { closed?: string }) => a.closed === 'O',
    isProgramAdmitted: (a: { admission?: string }) => a.admission === 'O',
    isProgramWithdraw: (a: { closed?: string }) => a.closed === 'X'
}));

vi.mock('../../Utils/util_functions', () => ({
    is_program_ml_rl_essay_ready: vi.fn(() => true),
    is_the_uni_assist_vpd_uploaded: vi.fn(() => true),
    isCVFinished: vi.fn(() => true),
    application_deadline_V2_calculator: vi.fn(() => '2025-12-01')
}));

// The checklist model is unit-tested on its own; here it is a seam so the card
// can be driven through each outstanding-items state.
vi.mock('../../Utils/applicationChecklist', () => ({
    buildApplicationChecklist: vi.fn(() => [
        {
            id: 'cv',
            label: 'CV',
            state: 'ok',
            href: '/cv',
            points: 1,
            earned: 1
        },
        {
            id: 'english',
            label: 'English',
            state: 'warning',
            href: '/survey',
            detail: 'TOEFL - 95',
            title: 'English Requirements not met',
            points: 1,
            earned: 0
        },
        {
            id: 'submit',
            label: 'Submit',
            state: 'missing',
            href: '/apps',
            points: 1,
            earned: 0
        }
    ]),
    progressBarCounter: vi.fn(() => 33)
}));

vi.mock(
    '@components/ApplicationProgressCard/ApplicationProgressCardBody',
    () => ({
        default: () => <div data-testid="full-checklist" />
    })
);

const application = {
    _id: 'app1',
    decided: 'O',
    closed: '-',
    admission: '-',
    finalEnrolment: false,
    application_year: '2025',
    programId: {
        _id: 'prog1',
        school: 'TU Berlin',
        degree: 'M. Sc.',
        program_name: 'Computer Science',
        semester: 'WS',
        application_deadline: '2025-12-01'
    }
} as unknown as Application;

const student = { _id: 'stu1' } as unknown as IStudentResponse;

const defaultProps = {
    application,
    application_idx: 3,
    student,
    status: 'decided' as const,
    handleChange: vi.fn(),
    handleFinalEnrolmentChange: vi.fn(),
    handleWithdraw: vi.fn(),
    handleAdmissionResultChange: vi.fn(() => Promise.resolve())
};

const renderCard = (props = {}) =>
    render(
        <MemoryRouter>
            <StudentApplicationCard {...defaultProps} {...props} />
        </MemoryRouter>
    );

describe('StudentApplicationCard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('leads with the program identity', () => {
        renderCard();
        expect(screen.getByText('TU Berlin')).toBeInTheDocument();
        expect(
            screen.getByText(/M\. Sc\..*Computer Science.*WS/)
        ).toBeInTheDocument();
    });

    it('shows only the outstanding checklist items as next steps', () => {
        renderCard();
        expect(screen.getByText(/Next steps/)).toHaveTextContent('(2)');
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        // Completed work is not an action item.
        expect(screen.queryByText('CV')).not.toBeInTheDocument();
    });

    // Until the student commits to applying, none of the document work is owed
    // yet — the only real action is the Decided dropdown.
    it('hides next steps entirely for an undecided program', () => {
        renderCard({
            application: { ...application, decided: '-' },
            status: 'pending'
        });

        expect(screen.queryByText(/Next steps/)).not.toBeInTheDocument();
        expect(screen.queryByText('English')).not.toBeInTheDocument();
        expect(screen.queryByText('Submit')).not.toBeInTheDocument();
        // ...and the full checklist stays out of reach too, rather than being
        // one click away.
        expect(
            screen.queryByRole('button', { name: /Show full checklist/ })
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Decide whether to apply first.')
        ).toBeInTheDocument();
    });

    it('shows next steps again once the program is decided', () => {
        renderCard({ application: { ...application, decided: 'O' } });
        expect(screen.getByText(/Next steps/)).toBeInTheDocument();
        expect(
            screen.queryByText('Decide whether to apply first.')
        ).not.toBeInTheDocument();
    });

    // Paperwork done is not the end of the journey: the result still has to be
    // reported back, and those actions live in this card's own dropdowns.
    describe('status reporting steps', () => {
        const allDocsDone = async () => {
            const { buildApplicationChecklist } = await import(
                '../../Utils/applicationChecklist'
            );
            (
                buildApplicationChecklist as ReturnType<typeof vi.fn>
            ).mockReturnValue([
                {
                    id: 'cv',
                    label: 'CV',
                    state: 'ok',
                    href: '/cv',
                    points: 1,
                    earned: 1
                }
            ]);
        };

        it('asks for the admission result once submitted', async () => {
            await allDocsDone();
            renderCard({
                application: { ...application, closed: 'O', admission: '-' },
                status: 'submitted'
            });

            expect(
                screen.getByText('Update admission status')
            ).toBeInTheDocument();
            expect(
                screen.queryByText('Nothing outstanding')
            ).not.toBeInTheDocument();
        });

        it('stops asking once a result is recorded', async () => {
            await allDocsDone();
            renderCard({
                application: { ...application, closed: 'O', admission: 'X' },
                status: 'rejected'
            });

            expect(
                screen.queryByText('Update admission status')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Nothing outstanding')).toBeInTheDocument();
        });

        it('asks for final enrolment once admitted', async () => {
            await allDocsDone();
            renderCard({
                application: {
                    ...application,
                    closed: 'O',
                    admission: 'O',
                    finalEnrolment: false
                },
                status: 'admitted'
            });

            expect(
                screen.getByText('Update final enrolment status')
            ).toBeInTheDocument();
            // The offer result is already in, so that prompt is gone.
            expect(
                screen.queryByText('Update admission status')
            ).not.toBeInTheDocument();
        });

        it('is finished once enrolment is confirmed', async () => {
            await allDocsDone();
            renderCard({
                application: {
                    ...application,
                    closed: 'O',
                    admission: 'O',
                    finalEnrolment: true
                },
                status: 'enrolled'
            });

            expect(
                screen.queryByText('Update final enrolment status')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Nothing outstanding')).toBeInTheDocument();
        });

        it('asks for nothing on a withdrawn application', async () => {
            await allDocsDone();
            renderCard({
                application: { ...application, closed: 'X' },
                status: 'withdrawn'
            });

            expect(
                screen.queryByText('Update admission status')
            ).not.toBeInTheDocument();
        });
    });

    it('reports the completion percentage', () => {
        renderCard();
        expect(screen.getByText('33%')).toBeInTheDocument();
        expect(
            screen.getByRole('progressbar', { name: 'application progress' })
        ).toBeInTheDocument();
    });

    it('reveals the full checklist on demand', () => {
        renderCard();
        expect(screen.queryByTestId('full-checklist')).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', { name: /Show full checklist/ })
        );
        expect(screen.getByTestId('full-checklist')).toBeInTheDocument();
    });

    it('congratulates rather than showing an empty next-steps list', async () => {
        const { buildApplicationChecklist } = await import(
            '../../Utils/applicationChecklist'
        );
        (buildApplicationChecklist as ReturnType<typeof vi.fn>).mockReturnValue(
            [
                {
                    id: 'cv',
                    label: 'CV',
                    state: 'ok',
                    href: '/cv',
                    points: 1,
                    earned: 1
                }
            ]
        );

        renderCard();
        expect(screen.getByText('Nothing outstanding')).toBeInTheDocument();
        expect(screen.queryByText(/Next steps/)).not.toBeInTheDocument();
    });

    // The card edits the same records as the table, so it must route through the
    // same handlers with the *original* index.
    it('passes the original index through when a status changes', () => {
        const handleChange = vi.fn();
        renderCard({ handleChange });

        fireEvent.mouseDown(
            screen.getByRole('combobox', { name: 'submission status' })
        );
        fireEvent.click(screen.getByRole('option', { name: 'Submitted' }));

        expect(handleChange).toHaveBeenCalledWith(expect.anything(), 3);
    });

    it('honours the shared lifecycle locks', () => {
        renderCard({
            application: {
                ...application,
                closed: 'O',
                admission: 'O',
                finalEnrolment: true
            },
            status: 'enrolled'
        });

        expect(
            screen.getByRole('combobox', { name: 'submission status' })
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
            screen.getByRole('combobox', { name: 'admission result' })
        ).toHaveAttribute('aria-disabled', 'true');
    });

    it('blocks submission until the prerequisites are finished', async () => {
        const { isCVFinished } = await import('../../Utils/util_functions');
        (isCVFinished as ReturnType<typeof vi.fn>).mockReturnValue(false);

        renderCard();
        expect(
            screen.getByRole('combobox', { name: 'submission status' })
        ).toHaveAttribute('aria-disabled', 'true');

        (isCVFinished as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('offers withdraw only while decided and unsubmitted', () => {
        renderCard();
        expect(
            screen.getByRole('button', { name: /Withdraw/ })
        ).toBeInTheDocument();

        renderCard({
            application: { ...application, closed: 'O' },
            status: 'submitted'
        });
        expect(
            screen.queryAllByRole('button', { name: /^Withdraw/ })
        ).toHaveLength(1);
    });
});
