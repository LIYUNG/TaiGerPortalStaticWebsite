import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TabProgramTaskDelta from './TabProgramTaskDelta';

vi.mock('./ProgramTaskDelta', () => ({
    default: ({
        program,
        students
    }: {
        program: { school: string };
        students: unknown[];
    }) => (
        <tbody data-testid="program-task-delta">
            <tr>
                <td>{program.school}</td>
                <td>{students.length} students</td>
            </tr>
        </tbody>
    )
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}${hash}`,
        CVMLRL_HASH: '#cvmlrl'
    }
}));

const mockDeltas = [
    {
        program: {
            _id: 'prog1',
            school: 'TU Munich',
            program_name: 'Computer Science',
            degree: 'Master'
        },
        students: [
            {
                _id: 's1',
                firstname: 'John',
                lastname: 'Doe',
                deltas: { add: [], remove: [] }
            }
        ]
    },
    {
        program: {
            _id: 'prog2',
            school: 'LMU Munich',
            program_name: 'Data Science',
            degree: 'Master'
        },
        students: [
            {
                _id: 's2',
                firstname: 'Jane',
                lastname: 'Smith',
                deltas: { add: [{ fileType: 'CV' }], remove: [] }
            }
        ]
    }
];

describe('TabProgramTaskDelta', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TabProgramTaskDelta deltas={mockDeltas} />
            </MemoryRouter>
        );
    });

    it('renders a table container', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table header columns', () => {
        expect(
            screen.getByRole('columnheader', { name: /University/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('columnheader', { name: /Missing/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('columnheader', { name: /Extra/i })
        ).toBeInTheDocument();
    });

    it('renders ProgramTaskDelta components for each entry', () => {
        const deltas = screen.getAllByTestId('program-task-delta');
        expect(deltas.length).toBe(2);
    });

    it('renders school names', () => {
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
        expect(screen.getByText('LMU Munich')).toBeInTheDocument();
    });
});
