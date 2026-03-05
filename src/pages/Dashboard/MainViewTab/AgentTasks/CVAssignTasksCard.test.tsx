import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CVAssignTasksCard from './CVAssignTasksCard';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        isCVFinished: vi.fn(() => false),
        is_cv_assigned: vi.fn(() => false)
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        CVMLRL_HASH: 'cvmlrl'
    }
}));

const makeStudent = (agentId = 'u1') => ({
    _id: { toString: () => 's1' },
    firstname: 'Alice',
    lastname: 'Wang',
    agents: [{ _id: agentId }],
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS'
    }
});

describe('CVAssignTasksCard', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <CVAssignTasksCard students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('CV Not Assigned Yet')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <CVAssignTasksCard students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Docs')).toBeInTheDocument();
        expect(screen.getByText('Student')).toBeInTheDocument();
    });

    it('renders task row for matching agent student', () => {
        render(
            <MemoryRouter>
                <CVAssignTasksCard students={[makeStudent('u1') as never]} />
            </MemoryRouter>
        );
        expect(screen.getByText('CV')).toBeInTheDocument();
    });
});
