import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table } from '@mui/material';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProgramConflict from './ProgramConflict';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}${hash}`,
        PROFILE_HASH: '#profile'
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
        studentId: 'student1',
        firstname: 'John',
        lastname: 'Doe',
        application_preference: { expected_application_date: '2025' }
    },
    {
        studentId: 'student2',
        firstname: 'Jane',
        lastname: 'Smith',
        application_preference: { expected_application_date: '2025' }
    }
];

describe('ProgramConflict', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Table>
                    <ProgramConflict
                        program={mockProgram}
                        students={mockStudents}
                    />
                </Table>
            </MemoryRouter>
        );
    });

    it('renders the school name link', () => {
        expect(
            screen.getByRole('link', { name: /TU Munich/i })
        ).toBeInTheDocument();
    });

    it('renders the program name link', () => {
        expect(
            screen.getByRole('link', { name: /Computer Science/i })
        ).toBeInTheDocument();
    });

    it('renders student name links', () => {
        expect(
            screen.getByRole('link', { name: /John, Doe/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Jane, Smith/i })
        ).toBeInTheDocument();
    });

    it('renders the application deadline', () => {
        expect(screen.getAllByText(/2025-01-15/i).length).toBeGreaterThan(0);
    });
});
