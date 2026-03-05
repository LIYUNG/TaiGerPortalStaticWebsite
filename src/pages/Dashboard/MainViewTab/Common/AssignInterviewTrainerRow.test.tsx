import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

import AssignInterviewTrainerRow from './AssignInterviewTrainerRow';

const mockTasksOverview = {
    noEditorsStudents: 5,
    noEssayWritersEssays: 3,
    noTrainerInInterviewsStudents: 4,
    noAgentsStudents: 1
} as any;

describe('AssignInterviewTrainerRow', () => {
    it('renders the assign interview trainers link with count', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignInterviewTrainerRow tasksOverview={mockTasksOverview} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Assign Interview Trainers/)).toBeTruthy();
        expect(screen.getByText(/4/)).toBeTruthy();
    });

    it('renders description text', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignInterviewTrainerRow tasksOverview={mockTasksOverview} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText('Please assign interview trainers')).toBeTruthy();
    });
});
