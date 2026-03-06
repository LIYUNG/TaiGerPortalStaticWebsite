import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbeddedThreadComponent } from './EmbeddedThreadComponent';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student/123',
        SINGLE_PROGRAM_LINK: () => '/program/abc',
        COMMUNICATIONS_TAIGER_MODE_LINK: () => '/comm/123',
        PROFILE_HASH: '#profile'
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
        _id: 'student1',
        firstname: 'John',
        lastname: 'Doe',
        pictureUrl: null
    },
    program_id: {
        _id: 'prog1',
        school: 'TU Munich',
        program_name: 'Computer Science'
    },
    isFinalVersion: false,
    flag_by_user_id: [],
    messages: []
};

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(() => ({
        data: {
            data: {
                data: mockThread,
                deadline: null,
                agents: [],
                conflict_list: [],
                editors: [],
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
    default: () => <div data-testid="child-loading" />
}));

vi.mock('@utils/contants', () => ({
    APP_BAR_HEIGHT: 64,
    stringAvatar: vi.fn(() => ({ sx: {}, children: 'JD' }))
}));

vi.mock('@/api/query', () => ({
    getMessagThreadQuery: vi.fn((id: string) => ({ queryKey: ['thread', id], queryFn: vi.fn() }))
}));

describe('EmbeddedThreadComponent', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EmbeddedThreadComponent setThreadId={vi.fn()} />
            </MemoryRouter>
        );
    });

    it('renders the doc modification thread page', () => {
        expect(screen.getByTestId('doc-modification-thread-page')).toBeInTheDocument();
    });

    it('renders the school name', () => {
        expect(screen.getByText(/TU Munich/i)).toBeInTheDocument();
    });

    it('renders the program name and file type', () => {
        expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
    });

    it('renders a Switch View link or button', () => {
        expect(screen.getByText(/Switch View/i)).toBeInTheDocument();
    });
});
