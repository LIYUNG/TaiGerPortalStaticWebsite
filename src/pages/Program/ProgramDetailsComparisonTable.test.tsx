import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IApplicationPopulated } from '@taiger-common/model';
import ProgramDetailsComparisonTable from './ProgramDetailsComparisonTable';

vi.mock('@utils/contants', () => ({
    program_fields: [
        { name: 'School', prop: 'school' },
        { name: 'Program', prop: 'program_name' },
        { name: 'Degree', prop: 'degree' }
    ]
}));

vi.mock('../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

const mockApplications = [
    {
        _id: 'app1',
        programId: {
            _id: 'prog1',
            school: 'TU Berlin',
            program_name: 'Computer Science',
            degree: 'Master',
            country: 'Germany'
        }
    },
    {
        _id: 'app2',
        programId: {
            _id: 'prog2',
            school: 'TU Munich',
            program_name: 'Engineering',
            degree: 'Bachelor',
            country: 'Germany'
        }
    }
];

const renderTable = (applications = mockApplications) =>
    render(
        <ProgramDetailsComparisonTable
            applications={applications as unknown as IApplicationPopulated[]}
        />
    );

describe('ProgramDetailsComparisonTable', () => {
    it('renders without crashing', () => {
        renderTable();
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders field names from program_fields', () => {
        renderTable();
        expect(screen.getByText('School')).toBeInTheDocument();
        expect(screen.getByText('Program')).toBeInTheDocument();
    });

    it('renders program data values', () => {
        renderTable();
        expect(screen.getByText('TU Berlin')).toBeInTheDocument();
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
    });

    it('renders Country row', () => {
        renderTable();
        expect(screen.getByText('Country')).toBeInTheDocument();
    });

    it('shows a column per program, headed by school and program name', () => {
        renderTable();
        expect(
            screen.getByRole('columnheader', {
                name: /TU Berlin - Computer Science/
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('columnheader', {
                name: /TU Munich - Engineering/
            })
        ).toBeInTheDocument();
    });

    it('hides a program column when it is removed from the picker', async () => {
        const user = userEvent.setup();
        renderTable();

        // The picker renders one deletable chip per compared program.
        const chips = screen
            .getAllByRole('button', { name: /TU Munich - Engineering/ })
            .filter((element) => element.closest('.MuiChip-root'));
        await user.click(
            chips[0].closest('.MuiChip-root')!.querySelector('svg')!
        );

        await waitFor(() => {
            expect(
                screen.queryByRole('columnheader', {
                    name: /TU Munich - Engineering/
                })
            ).not.toBeInTheDocument();
        });
        expect(
            screen.getByRole('columnheader', {
                name: /TU Berlin - Computer Science/
            })
        ).toBeInTheDocument();
    });

    it('hides rows where the compared programs agree when "Only differences" is on', async () => {
        const user = userEvent.setup();
        renderTable();

        // Both programs sit in Germany, so the Country row carries no signal.
        expect(screen.getByText('Country')).toBeInTheDocument();
        await user.click(
            screen.getByRole('checkbox', { name: /differences/i })
        );

        await waitFor(() => {
            expect(screen.queryByText('Country')).not.toBeInTheDocument();
        });
        expect(screen.getByText('School')).toBeInTheDocument();
    });

    it('renders an empty state when there are no applications', () => {
        renderTable([]);
        expect(screen.getByText('No programs to compare')).toBeInTheDocument();
    });
});
