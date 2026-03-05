import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('../StudDocsOverview/EditAgentsSubpage', () => ({
    default: () => <div data-testid="edit-agents-subpage" />
}));

vi.mock('../StudDocsOverview/EditEditorsSubpage', () => ({
    default: () => <div data-testid="edit-editors-subpage" />
}));

vi.mock('../StudDocsOverview/EditAttributesSubpage', () => ({
    default: () => <div data-testid="edit-attributes-subpage" />
}));

vi.mock('../../../Utils/util_functions', () => ({
    is_User_Archived: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        TEAM_AGENT_LINK: (id: string) => `/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editors/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('@utils/contants', () => ({
    COLORS: ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'],
    stringAvatar: vi.fn((name: string) => ({ children: name.charAt(0), sx: { bgcolor: '#aaa' } })),
    ATTRIBUTES: Array.from({ length: 5 }, (_, i) => ({ definition: `def${i}` }))
}));

vi.mock('@hooks/useDialog', () => ({
    useDialog: vi.fn(() => ({ open: false, setOpen: vi.fn() }))
}));

vi.mock('@/api', () => ({
    updateAgents: vi.fn(() => Promise.resolve({ data: { success: true, data: { agents: [] } } })),
    updateEditors: vi.fn(() => Promise.resolve({ data: { success: true, data: { editors: [] } } })),
    updateAttributes: vi.fn(() => Promise.resolve({ data: { success: true, data: { attributes: [] } } }))
}));

import StudentBriefOverview from './StudentBriefOverview';

const mockStudent = {
    _id: 's1',
    firstname: 'Jane',
    lastname: 'Doe',
    lastname_chinese: '李',
    firstname_chinese: '小明',
    email: 'jane@example.com',
    agents: [],
    editors: [],
    attributes: [],
    applying_program_count: 3,
    application_preference: {
        expected_application_date: '2025-09',
        expected_application_semester: 'WS',
        target_degree: 'MS'
    }
} as any;

describe('StudentBriefOverview', () => {
    it('renders student name and email', () => {
        render(
            <MemoryRouter>
                <StudentBriefOverview
                    student={mockStudent}
                    updateStudentArchivStatus={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Jane/)).toBeTruthy();
        expect(screen.getByText(/Doe/)).toBeTruthy();
        expect(screen.getByText('jane@example.com')).toBeTruthy();
    });

    it('renders application preference info', () => {
        render(
            <MemoryRouter>
                <StudentBriefOverview
                    student={mockStudent}
                    updateStudentArchivStatus={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/2025-09/)).toBeTruthy();
        expect(screen.getByText(/3/)).toBeTruthy();
    });
});
