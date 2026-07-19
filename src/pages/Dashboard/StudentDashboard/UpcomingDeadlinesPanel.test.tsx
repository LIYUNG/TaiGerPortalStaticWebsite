import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpcomingDeadlinesPanel from './UpcomingDeadlinesPanel';
import type { Application } from '@/api/types';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`,
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/applications/${id}`
    }
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: (a: { decided?: string }) => a?.decided === 'O',
    isProgramSubmitted: (a: { closed?: string }) => a?.closed === 'O',
    isProgramWithdraw: (a: { closed?: string }) => a?.closed === 'X'
}));

// Echoes back the program's deadline so fixtures control the dates directly.
vi.mock('@pages/Utils/util_functions', () => ({
    application_deadline_V2_calculator: (a: {
        programId?: { application_deadline?: string };
    }) => a?.programId?.application_deadline ?? ''
}));

const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

const app = (
    id: string,
    overrides: Record<string, unknown> = {},
    deadline: string | undefined = daysFromNow(20)
) =>
    ({
        _id: id,
        decided: 'O',
        closed: '-',
        admission: '-',
        programId: {
            _id: `p-${id}`,
            school: `${id} University`,
            program_name: `${id} Program`,
            application_deadline: deadline
        },
        ...overrides
    }) as unknown as Application;

// Each entry renders two links — the school and the "Open" action — so scope
// entry counting to the school links only.
const schoolLinks = () =>
    screen.queryAllByRole('link', { name: /University$/ });

const renderPanel = (applications: Application[]) =>
    render(
        <MemoryRouter>
            <UpcomingDeadlinesPanel
                applications={applications}
                studentId="stu1"
            />
        </MemoryRouter>
    );

describe('UpcomingDeadlinesPanel', () => {
    it('lists deadlines soonest first', () => {
        renderPanel([
            app('Far', {}, daysFromNow(60)),
            app('Near', {}, daysFromNow(3)),
            app('Mid', {}, daysFromNow(20))
        ]);

        const schools = schoolLinks().map((link) => link.textContent);
        expect(schools).toEqual([
            'Near University',
            'Mid University',
            'Far University'
        ]);
    });

    // A deadline you cannot act on is noise that buries the ones you can.
    it('excludes submitted, withdrawn and undecided applications', () => {
        renderPanel([
            app('Submitted', { closed: 'O' }),
            app('Withdrawn', { closed: 'X' }),
            app('Undecided', { decided: '-' }),
            app('Actionable')
        ]);

        expect(schoolLinks()).toHaveLength(1);
        expect(screen.getByText('Actionable University')).toBeInTheDocument();
    });

    it('skips applications with no deadline set', () => {
        // Built inline: passing `undefined` to app() would fall through to the
        // default deadline, so the program is overridden wholesale instead.
        const noDeadline = app('NoDeadline', {
            programId: {
                _id: 'p-NoDeadline',
                school: 'NoDeadline University',
                program_name: 'NoDeadline Program'
            }
        });

        renderPanel([noDeadline, app('HasDeadline')]);
        expect(schoolLinks()).toHaveLength(1);
        expect(screen.getByText('HasDeadline University')).toBeInTheDocument();
    });

    it('shows days remaining and flags an overdue deadline', () => {
        renderPanel([app('Overdue', {}, daysFromNow(-5))]);
        expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('counts the days left for an upcoming deadline', () => {
        renderPanel([app('Soon', {}, daysFromNow(3))]);
        expect(screen.getByText(/3 days left/)).toBeInTheDocument();
    });

    it('caps the list and reports the remainder', () => {
        renderPanel(
            Array.from({ length: 8 }, (_, i) =>
                app(`P${i}`, {}, daysFromNow(i + 1))
            )
        );

        expect(schoolLinks()).toHaveLength(5);
        expect(screen.getByText('+3 more')).toBeInTheDocument();
    });

    it('says so when nothing is due', () => {
        renderPanel([app('Submitted', { closed: 'O' })]);
        expect(screen.getByText('No deadlines coming up.')).toBeInTheDocument();
    });

    it('links each entry to the applications page', () => {
        renderPanel([app('Alpha')]);
        const open = screen.getByRole('link', { name: 'Open' });
        expect(open).toHaveAttribute('href', '/applications/stu1');
    });

    it('badges the total number of open deadlines', () => {
        const { container } = renderPanel([
            app('A', {}, daysFromNow(2)),
            app('B', {}, daysFromNow(5))
        ]);
        expect(
            within(container).getByText('2', { selector: '.MuiChip-label' })
        ).toBeInTheDocument();
    });
});
