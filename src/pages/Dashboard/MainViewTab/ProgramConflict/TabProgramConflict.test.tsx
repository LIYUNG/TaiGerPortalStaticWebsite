import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TabProgramConflict from './TabProgramConflict';

vi.mock('./ProgramConflict', () => ({
    default: ({ program, students }: { program: { school: string }; students: unknown[] }) => (
        <tbody data-testid="program-conflict">
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
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/student/${id}${hash}`,
        PROFILE_HASH: '#profile'
    }
}));

const mockStudents = [
    {
        program: {
            _id: 'prog1',
            school: 'TU Munich',
            program_name: 'Computer Science',
            application_deadline: '2025-01-15',
            degree: 'Master'
        },
        students: [
            { studentId: 's1', firstname: 'John', lastname: 'Doe', application_preference: {} }
        ]
    },
    {
        program: {
            _id: 'prog2',
            school: 'LMU Munich',
            program_name: 'Data Science',
            application_deadline: '2025-02-01',
            degree: 'Master'
        },
        students: [
            { studentId: 's2', firstname: 'Jane', lastname: 'Smith', application_preference: {} }
        ]
    }
];

describe('TabProgramConflict', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <TabProgramConflict program={mockStudents[0].program} students={mockStudents} />
            </MemoryRouter>
        );
    });

    it('renders a table container', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table header columns', () => {
        expect(screen.getByRole('columnheader', { name: /University/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /Student Name/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /Deadline/i })).toBeInTheDocument();
    });

    it('renders ProgramConflict components for each entry', () => {
        const conflicts = screen.getAllByTestId('program-conflict');
        expect(conflicts.length).toBe(2);
    });

    it('renders school names from the data', () => {
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
        expect(screen.getByText('LMU Munich')).toBeInTheDocument();
    });
});
