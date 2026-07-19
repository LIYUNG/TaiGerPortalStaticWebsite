import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyApplicationsPanel from './MyApplicationsPanel';
import type { IStudentResponse } from '@taiger-common/model';

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/applications/${id}`
    }
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: (a: { decided?: string }) => a?.decided === 'O',
    isProgramSubmitted: (a: { closed?: string }) => a?.closed === 'O',
    isProgramAdmitted: (a: { admission?: string }) => a?.admission === 'O',
    isProgramRejected: (a: { admission?: string }) => a?.admission === 'X',
    isProgramWithdraw: (a: { closed?: string }) => a?.closed === 'X'
}));

// The real card is exercised by its own suite; here it stands in as a marker so
// the panel's filtering and wiring can be asserted in isolation.
vi.mock('@components/ApplicationProgressCard/ApplicationProgressCard', () => ({
    default: ({
        application
    }: {
        application: { programId?: { program_name?: string } };
    }) => (
        <div data-testid={`card-${application.programId?.program_name}`}>
            card
        </div>
    )
}));

const app = (name: string, overrides: Record<string, unknown> = {}) => ({
    _id: `id-${name}`,
    decided: 'O',
    closed: '-',
    admission: '-',
    programId: {
        _id: `p-${name}`,
        school: `${name} University`,
        program_name: name
    },
    ...overrides
});

const student = (applications: unknown[]) =>
    ({ _id: 'stu1', applications }) as unknown as IStudentResponse;

const renderPanel = (applications: unknown[]) =>
    render(
        <MemoryRouter>
            <MyApplicationsPanel student={student(applications)} />
        </MemoryRouter>
    );

const chip = (name: string) => screen.getByRole('button', { name });

describe('MyApplicationsPanel', () => {
    it('renders a card per application', () => {
        renderPanel([app('Alpha'), app('Beta')]);
        expect(screen.getByTestId('card-Alpha')).toBeInTheDocument();
        expect(screen.getByTestId('card-Beta')).toBeInTheDocument();
    });

    // The cards carry interview requests, admission/rejection letters and the
    // status controls, so the panel must render the real component rather than
    // a summary of its own.
    it('delegates each entry to ApplicationProgressCard', () => {
        renderPanel([app('Alpha')]);
        expect(screen.getByTestId('card-Alpha')).toHaveTextContent('card');
    });

    it('shows a count chip per occupied stage', () => {
        renderPanel([
            app('Undecided', { decided: '-' }),
            app('Decided'),
            app('Admitted', { closed: 'O', admission: 'O' })
        ]);

        // Cumulative: the admitted one is decided too.
        expect(chip('Decided 2')).toBeInTheDocument();
        expect(chip('Admitted 1')).toBeInTheDocument();
    });

    // The dashboard is about applications in flight, and with nothing selected
    // the list is already unfiltered — so neither chip earns its space.
    it('offers no All or Not decided chip', () => {
        renderPanel([
            app('Undecided', { decided: '-' }),
            app('Decided'),
            app('Admitted', { closed: 'O', admission: 'O' })
        ]);

        expect(
            screen.queryByRole('button', { name: /^All / })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /^Not decided/ })
        ).not.toBeInTheDocument();
    });

    // Applications in flight are what the dashboard is for.
    it('opens on Decided rather than showing everything', () => {
        renderPanel([app('Undecided', { decided: '-' }), app('Decided')]);

        expect(screen.getByTestId('card-Decided')).toBeInTheDocument();
        expect(screen.queryByTestId('card-Undecided')).not.toBeInTheDocument();
        expect(chip('Decided 1')).toHaveAttribute('aria-pressed', 'true');
    });

    it('reveals undecided applications when the Decided chip is cleared', () => {
        renderPanel([app('Undecided', { decided: '-' }), app('Decided')]);

        fireEvent.click(chip('Decided 1'));
        expect(screen.getByTestId('card-Undecided')).toBeInTheDocument();
        expect(screen.getByTestId('card-Decided')).toBeInTheDocument();
    });

    it('filters the cards by the selected stage', () => {
        renderPanel([
            app('Undecided', { decided: '-' }),
            app('Admitted', { closed: 'O', admission: 'O' })
        ]);

        fireEvent.click(chip('Admitted 1'));
        expect(screen.getByTestId('card-Admitted')).toBeInTheDocument();
        expect(screen.queryByTestId('card-Undecided')).not.toBeInTheDocument();
    });

    it('clears the filter when the active chip is clicked again', () => {
        renderPanel([
            app('Undecided', { decided: '-' }),
            app('Admitted', { closed: 'O', admission: 'O' })
        ]);

        fireEvent.click(chip('Admitted 1'));
        expect(screen.queryByTestId('card-Undecided')).not.toBeInTheDocument();

        fireEvent.click(chip('Admitted 1'));
        expect(screen.getByTestId('card-Undecided')).toBeInTheDocument();
    });

    it('links through to the full applications page', () => {
        renderPanel([app('Alpha')]);
        expect(screen.getByRole('link', { name: 'View All' })).toHaveAttribute(
            'href',
            '/applications/stu1'
        );
    });

    it('handles a student with no applications', () => {
        renderPanel([]);
        expect(screen.getByText('No applications')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /^All / })
        ).not.toBeInTheDocument();
    });
});
