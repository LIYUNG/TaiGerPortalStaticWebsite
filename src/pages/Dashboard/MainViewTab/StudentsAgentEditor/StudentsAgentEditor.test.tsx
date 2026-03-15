import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import StudentsAgentEditor from './StudentsAgentEditor';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    // Return false to avoid triggering props.isArchivPage reference (pre-existing source bug)
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('../StudDocsOverview/EditUserListSubpage', () => ({
    default: () => <div data-testid="edit-user-list-subpage" />
}));

vi.mock('../StudDocsOverview/EditAttributesSubpage', () => ({
    default: () => <div data-testid="edit-attributes-subpage" />
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        is_User_Archived: vi.fn(() => false)
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        PROFILE_HASH: 'profile',
        TEAM_AGENT_LINK: vi.fn(() => '/team/agent/u1'),
        TEAM_EDITOR_LINK: vi.fn(() => '/team/editor/u1')
    }
}));

vi.mock('@utils/contants', () => ({
    COLORS: {},
    convertDate: vi.fn((d: string) => d),
    isInTheFuture: vi.fn(() => true)
}));

const makeStudent = () => ({
    _id: 's1',
    firstname: 'Leo',
    lastname: 'Zhang',
    email: 'leo@test.com',
    agents: [{ _id: 'u1', firstname: 'Agent', lastname: 'One' }],
    editors: [],
    archiv: false,
    attributes: [],
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS',
        target_degree: 'Master',
        target_application_field: 'CS'
    },
    academic_background: {
        university: {
            attended_university: 'NTU',
            attended_university_program: 'EE'
        },
        language: {
            english_certificate: 'TOEFL',
            german_certificate: '',
            english_score: '100',
            german_score: '',
            english_isPassed: 'X',
            english_test_date: '2024-01-01',
            german_isPassed: '',
            german_test_date: ''
        }
    }
});

describe('StudentsAgentEditor', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentsAgentEditor
                            student={makeStudent() as never}
                            submitUpdateAgentlist={vi.fn()}
                            submitUpdateEditorlist={vi.fn()}
                            submitUpdateAttributeslist={vi.fn()}
                            updateStudentArchivStatus={vi.fn()}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Leo, Zhang/)).toBeInTheDocument();
    });

    it('renders agent name link', () => {
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentsAgentEditor
                            student={makeStudent() as never}
                            submitUpdateAgentlist={vi.fn()}
                            submitUpdateEditorlist={vi.fn()}
                            submitUpdateAttributeslist={vi.fn()}
                            updateStudentArchivStatus={vi.fn()}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('renders no-agent message when agents list is empty', () => {
        const student = { ...makeStudent(), agents: [] };
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <StudentsAgentEditor
                            student={student as never}
                            submitUpdateAgentlist={vi.fn()}
                            submitUpdateEditorlist={vi.fn()}
                            submitUpdateAttributeslist={vi.fn()}
                            updateStudentArchivStatus={vi.fn()}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('No Agent assigned')).toBeInTheDocument();
    });
});
