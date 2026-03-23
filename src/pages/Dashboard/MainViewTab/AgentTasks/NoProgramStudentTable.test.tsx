import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import NoProgramStudentTable from './NoProgramStudentTable';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        anyStudentWithoutApplicationSelection: vi.fn(() => true),
        hasApplications: vi.fn(() => false)
    };
});

vi.mock('../../MainViewTab/AgentTasks/NoProgramStudentTask', () => ({
    default: () => <tr data-testid="no-program-task" />
}));

const makeStudent = (agentId = 'u1') => ({
    _id: { toString: () => 's1' },
    firstname: 'Carol',
    lastname: 'Chen',
    agents: [{ _id: agentId }]
});

describe('NoProgramStudentTable', () => {
    it('renders when there are students without applications', () => {
        render(
            <MemoryRouter>
                <NoProgramStudentTable
                    students={[makeStudent('u1') as never]}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('No Program Selected Yet')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <NoProgramStudentTable
                    students={[makeStudent('u1') as never]}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Student Name')).toBeInTheDocument();
    });

    it('renders nothing when no students without applications', async () => {
        const { anyStudentWithoutApplicationSelection } = await import(
            '../../../Utils/util_functions'
        );
        vi.mocked(anyStudentWithoutApplicationSelection).mockReturnValue(false);

        const { container } = render(
            <MemoryRouter>
                <NoProgramStudentTable students={[]} />
            </MemoryRouter>
        );
        expect(
            container.querySelector('[data-testid="no-program-task"]')
        ).not.toBeInTheDocument();
    });
});
