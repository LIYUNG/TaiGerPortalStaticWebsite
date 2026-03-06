import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn(() => ({
        data: {
            data: { success: true, data: [] },
            status: 200
        },
        isLoading: false,
        isError: false,
        error: null
    })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Admin',
            _id: 'u1',
            firstname: 'Test',
            lastname: 'User'
        }
    })
}));

vi.mock('react-router-dom', async (orig) => {
    const actual = await orig<typeof import('react-router-dom')>();
    return {
        ...actual,
        useParams: vi.fn(() => ({ user_id: undefined }))
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    updateArchivStudents: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getArchivStudentsQuery: vi.fn(() => ({
        queryKey: ['archiv-students', 'u1'],
        queryFn: vi.fn()
    }))
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('../StudentDatabase/StudentsTable', () => ({
    StudentsTable: () => <div data-testid="students-table" />
}));

vi.mock('../Utils/util_functions', () => ({
    student_transform: vi.fn((students: unknown[]) => students)
}));

import ArchivStudents from './index';

describe('ArchivStudents', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );
        expect(screen.getByTestId('archiv_student_component')).toBeTruthy();
    });

    it('renders breadcrumbs', () => {
        render(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeTruthy();
    });

    it('renders students table', () => {
        render(
            <MemoryRouter>
                <ArchivStudents />
            </MemoryRouter>
        );
        expect(screen.getByTestId('students-table')).toBeTruthy();
    });
});
