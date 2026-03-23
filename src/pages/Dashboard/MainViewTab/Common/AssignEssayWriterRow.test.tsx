import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

import AssignEssayWriterRow from './AssignEssayWriterRow';

const mockTasksOverview = {
    noEditorsStudents: 5,
    noEssayWritersEssays: 7,
    noTrainerInInterviewsStudents: 2,
    noAgentsStudents: 1
} as any;

describe('AssignEssayWriterRow', () => {
    it('renders the assign essay writer link with count', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignEssayWriterRow
                            tasksOverview={mockTasksOverview}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Assign Essay Writer/)).toBeTruthy();
        expect(screen.getByText(/7/)).toBeTruthy();
    });

    it('renders description text', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignEssayWriterRow
                            tasksOverview={mockTasksOverview}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText('Please assign essay writers')).toBeTruthy();
    });
});
