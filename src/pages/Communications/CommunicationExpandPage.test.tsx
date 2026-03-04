import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: () => ({ studentId: 'stu1' }),
    useNavigate: () => vi.fn(),
    Navigate: ({ to }: { to: string }) => (
        <div data-testid="navigate" data-to={to} />
    ),
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: true }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'a1',
            firstname: 'Agent',
            lastname: 'One',
            pictureUrl: ''
        }
    })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@components/Loading/ChildLoading', () => ({
    default: () => <div data-testid="child-loading" />
}));

vi.mock('@/api', () => ({
    WidgetExportMessagePDF: vi.fn(),
    BASE_URL: 'http://localhost:3000',
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@/api/query', () => ({
    getCommunicationQuery: vi.fn(() => ({
        queryKey: ['comm'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@components/EmbeddedChatList', () => ({
    default: () => <div data-testid="embedded-chat-list" />
}));

vi.mock('./CommunicationExpandPageMessagesComponent', () => ({
    default: () => <div data-testid="comm-expand-page-messages" />
}));

vi.mock('../StudentDatabase/FetchStudentLayer', () => ({
    FetchStudentLayer: () => <div data-testid="fetch-student-layer" />
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

vi.mock('../Utils/util_functions', () => ({
    truncateText: (text: string) => text
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}#${hash}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: (name: string) => ({ children: name[0], sx: {} }),
    convertDate: (d: string) => d ?? '',
    convertDateUXFriendly: (d: string) => d ?? ''
}));

import CommunicationExpandPage from './CommunicationExpandPage';

describe('CommunicationExpandPage', () => {
    test('renders embedded chat list for TaiGer role user', () => {
        render(<CommunicationExpandPage />);
        expect(screen.getByTestId('embedded-chat-list')).toBeInTheDocument();
    });

    test('shows child loading when isLoading is true on desktop', async () => {
        const { useQuery } = await import('@tanstack/react-query');
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true
        } as ReturnType<typeof useQuery>);

        render(<CommunicationExpandPage />);
        // On non-mobile, ChildLoading is shown while loading
        expect(screen.getByTestId('child-loading')).toBeInTheDocument();
    });
});
