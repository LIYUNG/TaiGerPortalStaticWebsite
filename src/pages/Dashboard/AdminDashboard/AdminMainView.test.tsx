import { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({
        getSelectedRowModel: vi.fn(() => ({ rows: [] })),
        resetRowSelection: vi.fn(),
        options: {}
    })),
    createMRTColumnHelper: vi.fn(() => ({
        accessor: vi.fn((key: string, opts: unknown) => ({
            accessorKey: key,
            ...opts
        }))
    }))
}));

vi.mock('@hooks/useStudents', () => ({
    default: vi.fn(() => ({
        students: [],
        submitUpdateAgentlist: vi.fn(),
        submitUpdateEditorlist: vi.fn(),
        submitUpdateAttributeslist: vi.fn(),
        updateStudentArchivStatus: vi.fn()
    }))
}));

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('@hooks/useTasksOverview', () => ({
    useTasksOverview: vi.fn(() => ({ data: undefined }))
}));

vi.mock('../../StudentDatabase/StudentsTable', () => ({
    StudentsTable: () => <div data-testid="students-table" />
}));

vi.mock('../../Program/ProgramReportCard', () => ({
    default: () => <div data-testid="program-report-card" />
}));

vi.mock('../../Audit/MiniAudit', () => ({
    default: () => <div data-testid="mini-audit" />
}));

vi.mock('../MainViewTab/AdminTasks/index', () => ({
    default: () => (
        <tr data-testid="admin-tasks">
            <td colSpan={2} />
        </tr>
    )
}));

vi.mock('@/api/query', () => ({
    getAuditLogQuery: vi.fn(() => ({ queryKey: ['audit'], queryFn: vi.fn() }))
}));

vi.mock('../../Utils/util_functions', () => ({
    student_transform: vi.fn(() => [])
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

import AdminMainView from './AdminMainView';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('AdminMainView', () => {
    it('renders without crashing', () => {
        render(<AdminMainView />, { wrapper });
        expect(screen.getByTestId('students-table')).toBeTruthy();
    });

    it('renders the ProgramReportCard', () => {
        render(<AdminMainView />, { wrapper });
        expect(screen.getByTestId('program-report-card')).toBeTruthy();
    });

    it('renders the MiniAudit card', () => {
        render(<AdminMainView />, { wrapper });
        expect(screen.getByTestId('mini-audit')).toBeTruthy();
    });
});
