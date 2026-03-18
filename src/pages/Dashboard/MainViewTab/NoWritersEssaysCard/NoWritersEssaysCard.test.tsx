import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('../StudDocsOverview/EditEssayWritersSubpage', () => ({
    default: () => <div data-testid="edit-essay-writers-subpage" />
}));

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/documents/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

import NoWritersEssaysCard from './NoWritersEssaysCard';

const essayThreadWithoutWriters = {
    _id: 'dt1',
    outsourced_user_id: [],
    file_type: 'MotivationLetter',
    program_id: {
        _id: 'p1',
        school: 'MIT',
        program_name: 'CS',
        degree: 'MS',
        semester: 'WS2025'
    },
    student_id: {
        _id: 's1',
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        editors: [],
        agents: [],
        application_preference: { expected_application_date: '2025-09' }
    },
    messages: [{ _id: 'm1' }]
} as any;

const essayThreadWithWriters = {
    _id: 'dt2',
    outsourced_user_id: [{ _id: 'w1', firstname: 'Writer', lastname: 'One' }],
    file_type: 'MotivationLetter',
    program_id: {
        _id: 'p2',
        school: 'Stanford',
        program_name: 'EE',
        degree: 'PhD',
        semester: 'SS2025'
    },
    student_id: {
        _id: 's2',
        firstname: 'John',
        lastname: 'Smith',
        email: 'john@example.com',
        editors: [],
        agents: [],
        application_preference: { expected_application_date: '2025-09' }
    },
    messages: []
} as any;

describe('NoWritersEssaysCard', () => {
    it('renders essay thread row when no writer assigned', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoWritersEssaysCard
                            essayDocumentThread={essayThreadWithoutWriters}
                            isArchivPage={false}
                            submitUpdateEssayWriterlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Jane/)).toBeTruthy();
        expect(screen.getByText(/MotivationLetter/)).toBeTruthy();
    });

    it('renders nothing when essay already has a writer', () => {
        const { container } = render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoWritersEssaysCard
                            essayDocumentThread={essayThreadWithWriters}
                            isArchivPage={false}
                            submitUpdateEssayWriterlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(container.querySelector('tr')).toBeNull();
    });
});
