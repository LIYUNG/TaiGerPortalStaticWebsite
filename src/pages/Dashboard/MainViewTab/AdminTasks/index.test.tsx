import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../Common/AssignEditorRow', () => ({
    default: () => (
        <tr data-testid="assign-editor-row">
            <td>Assign Editors</td>
            <td>Please assign editors</td>
        </tr>
    )
}));

vi.mock('../Common/AssignEssayWriterRow', () => ({
    default: () => (
        <tr data-testid="assign-essay-writer-row">
            <td>Assign Essay Writers</td>
            <td>Please assign essay writers</td>
        </tr>
    )
}));

vi.mock('../Common/AssignInterviewTrainerRow', () => ({
    default: () => (
        <tr data-testid="assign-interview-trainer-row">
            <td>Assign Interview Trainers</td>
            <td>Please assign interview trainers</td>
        </tr>
    )
}));

import AdminTasks from './index';

const mockTasksOverview = {
    noEditorsStudents: 2,
    noEssayWritersStudents: 1,
    noInterviewTrainersStudents: 0
};

const renderWithTable = (students = [], tasksOverview = mockTasksOverview) =>
    render(
        <MemoryRouter>
            <table>
                <tbody>
                    <AdminTasks students={students} tasksOverview={tasksOverview} />
                </tbody>
            </table>
        </MemoryRouter>
    );

describe('AdminTasks', () => {
    it('renders without crashing with empty students', () => {
        renderWithTable();
        expect(document.body).toBeTruthy();
    });

    it('renders AssignEditorRow', () => {
        renderWithTable();
        expect(screen.getByTestId('assign-editor-row')).toBeTruthy();
    });

    it('renders AssignEssayWriterRow', () => {
        renderWithTable();
        expect(screen.getByTestId('assign-essay-writer-row')).toBeTruthy();
    });
});
