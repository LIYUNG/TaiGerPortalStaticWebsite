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

vi.mock('../StudDocsOverview/EditEditorsSubpage', () => ({
    default: () => <div data-testid="edit-editors-subpage" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('@utils/contants', () => ({
    ATTRIBUTES: [
        { definition: 'def0' },
        { definition: 'def1' },
        { definition: 'def2' },
        { definition: 'def3' },
        { definition: 'def4' }
    ],
    COLORS: ['default', 'primary', 'secondary', 'error', 'warning'],
    convertDate: vi.fn((d: string) => d),
    showTimezoneOffset: vi.fn(() => '+00:00'),
    stringAvatar: vi.fn((name: string) => ({ children: name.charAt(0) }))
}));

import NoEditorsStudentsCard from './NoEditorsStudentsCard';

const studentWithoutEditors = {
    _id: 's1',
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane@example.com',
    editors: [],
    agents: [],
    attributes: [],
    needEditor: true,
    application_preference: {
        expected_application_date: '2025-09',
        target_program_language: 'English'
    }
} as any;

const studentWithEditors = {
    _id: 's2',
    firstname: 'John',
    lastname: 'Smith',
    email: 'john@example.com',
    editors: [{ _id: 'e1', firstname: 'Editor', lastname: 'One' }],
    agents: [],
    attributes: [],
    needEditor: false,
    application_preference: {
        expected_application_date: '2025-09',
        target_program_language: 'English'
    }
} as any;

describe('NoEditorsStudentsCard', () => {
    it('renders student row when student has no editors', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoEditorsStudentsCard
                            student={studentWithoutEditors}
                            isArchivPage={false}
                            submitUpdateEditorlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Jane/)).toBeTruthy();
    });

    it('renders nothing when student already has editors', () => {
        const { container } = render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoEditorsStudentsCard
                            student={studentWithEditors}
                            isArchivPage={false}
                            submitUpdateEditorlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(container.querySelector('tr')).toBeNull();
    });
});
