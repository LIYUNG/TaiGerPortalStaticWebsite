import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SingleThreadPage from './SingleThreadPage';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => true),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: (_id: string, hash: string) =>
            `/student/${_id}${hash}`,
        COMMUNICATIONS_TAIGER_MODE_LINK: (id: string) => `/comm/${id}`,
        CVMLRL_HASH: '#cvmlrl'
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ documentsthreadId: 'thread123' }),
        useNavigate: () => vi.fn()
    };
});

const mockThread = {
    _id: 'thread123',
    file_type: 'CV',
    student_id: {
        _id: { toString: () => 'student1' },
        firstname: 'John',
        lastname: 'Doe'
    },
    isFinalVersion: false,
    flag_by_user_id: [],
    messages: []
};

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(() => ({
        data: {
            data: {
                success: true,
                data: mockThread,
                agents: [],
                conflict_list: [],
                editors: [],
                deadline: null,
                threadAuditLog: [],
                similarThreads: []
            }
        },
        isLoading: false,
        error: null
    }))
}));

vi.mock('../DocModificationThreadPage', () => ({
    default: () => <div data-testid="doc-modification-thread-page" />
}));

vi.mock('../../../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav aria-label="breadcrumb">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('@/api/query', () => ({
    getMessagThreadQuery: vi.fn((id: string) => ({
        queryKey: ['thread', id],
        queryFn: vi.fn()
    }))
}));

describe('SingleThreadPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SingleThreadPage />
            </MemoryRouter>
        );
    });

    it('renders breadcrumbs navigation', () => {
        expect(
            screen.getByRole('navigation', { name: /breadcrumb/i })
        ).toBeInTheDocument();
    });

    it('renders the student name in breadcrumbs', () => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    it('renders the doc modification thread page', () => {
        expect(
            screen.getByTestId('doc-modification-thread-page')
        ).toBeInTheDocument();
    });

    it('renders a Switch View link or button for non-student users', () => {
        expect(screen.getByText(/Switch View/i)).toBeInTheDocument();
    });
});
