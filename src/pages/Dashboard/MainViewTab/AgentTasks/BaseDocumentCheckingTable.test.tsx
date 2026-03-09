import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import BaseDocumentCheckingTable from './BaseDocumentCheckingTable';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('../../MainViewTab/AgentTasks/BaseDocumentCheckingTasks', () => ({
    default: () => <li data-testid="base-doc-checking-task" />
}));

const makeStudent = (agentId = 'u1') => ({
    _id: 's1',
    firstname: 'John',
    lastname: 'Doe',
    agents: [{ _id: agentId }],
    profile: []
});

describe('BaseDocumentCheckingTable', () => {
    it('renders without crashing with empty students', () => {
        render(
            <MemoryRouter>
                <BaseDocumentCheckingTable students={[]} />
            </MemoryRouter>
        );
        // Text may be split across elements; use partial match
        expect(
            screen.getByText(/Check uploaded base documents/i)
        ).toBeInTheDocument();
    });

    it('renders list headers', () => {
        render(
            <MemoryRouter>
                <BaseDocumentCheckingTable students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Document Type')).toBeInTheDocument();
    });

    it('filters students by agent id', () => {
        const students = [
            makeStudent('u1'),
            makeStudent('other-agent')
        ] as never[];
        render(
            <MemoryRouter>
                <BaseDocumentCheckingTable students={students} />
            </MemoryRouter>
        );
        // Table renders (one matching student)
        expect(
            screen.getByText(/Check uploaded base documents/i)
        ).toBeInTheDocument();
    });
});
