import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false)
}));

vi.mock('../StudDocsOverview/EditUserListSubpage', () => ({
    default: () => <div data-testid="edit-agents-subpage" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

import NoAgentsStudentsCard from './NoAgentsStudentsCard';

const studentWithoutAgents = {
    _id: 's1',
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane@example.com',
    agents: [],
    application_preference: { expected_application_date: '2025-09' }
} as any;

const studentWithAgents = {
    _id: 's2',
    firstname: 'John',
    lastname: 'Smith',
    email: 'john@example.com',
    agents: [{ _id: 'a1', firstname: 'Agent', lastname: 'One' }],
    application_preference: { expected_application_date: '2025-09' }
} as any;

describe('NoAgentsStudentsCard', () => {
    it('renders student row when student has no agents', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoAgentsStudentsCard
                            student={studentWithoutAgents}
                            isArchivPage={false}
                            submitUpdateAgentlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Jane/)).toBeTruthy();
        expect(screen.getByText(/Doe/)).toBeTruthy();
    });

    it('renders nothing when student has agents', () => {
        const { container } = render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoAgentsStudentsCard
                            student={studentWithAgents}
                            isArchivPage={false}
                            submitUpdateAgentlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(container.querySelector('tr')).toBeNull();
    });
});
