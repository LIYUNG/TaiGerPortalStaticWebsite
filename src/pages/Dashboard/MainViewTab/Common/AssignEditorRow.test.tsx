import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

import AssignEditorRow from './AssignEditorRow';

const mockTasksOverview = {
    noEditorsStudents: 5,
    noEssayWritersEssays: 3,
    noTrainerInInterviewsStudents: 2,
    noAgentsStudents: 1
} as any;

describe('AssignEditorRow', () => {
    it('renders the assign editors link with count', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignEditorRow tasksOverview={mockTasksOverview} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Assign Editors/)).toBeTruthy();
        expect(screen.getByText(/5/)).toBeTruthy();
    });

    it('renders description text', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <AssignEditorRow tasksOverview={mockTasksOverview} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText('Please assign editors')).toBeTruthy();
    });
});
