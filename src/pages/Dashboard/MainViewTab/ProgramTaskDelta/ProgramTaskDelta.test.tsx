import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table } from '@mui/material';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProgramTaskDelta from './ProgramTaskDelta';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/student/${id}${hash}`,
        CVMLRL_HASH: '#cvmlrl'
    }
}));

const mockProgram = {
    _id: 'prog1',
    school: 'TU Munich',
    program_name: 'Computer Science',
    application_deadline: '2025-01-15',
    degree: 'Master'
};

const mockStudents = [
    {
        _id: 'student1',
        firstname: 'John',
        lastname: 'Doe',
        deltas: {
            add: [{ fileType: 'CV' }, { fileType: 'ML' }],
            remove: [{ fileThread: { file_type: 'RL' } }]
        }
    }
];

describe('ProgramTaskDelta', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Table>
                    <ProgramTaskDelta program={mockProgram} students={mockStudents} />
                </Table>
            </MemoryRouter>
        );
    });

    it('renders the school name link', () => {
        expect(screen.getByRole('link', { name: /TU Munich/i })).toBeInTheDocument();
    });

    it('renders the program name link', () => {
        expect(screen.getByRole('link', { name: /Computer Science/i })).toBeInTheDocument();
    });

    it('renders student name link', () => {
        expect(screen.getByRole('link', { name: /John, Doe/i })).toBeInTheDocument();
    });

    it('renders missing file types (delta add)', () => {
        expect(screen.getByText(/CV, ML/i)).toBeInTheDocument();
    });
});
