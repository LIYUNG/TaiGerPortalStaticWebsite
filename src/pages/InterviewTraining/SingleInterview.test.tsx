import { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
    QueryClient,
    QueryClientProvider,
    type UseQueryOptions
} from '@tanstack/react-query';
import { is_TaiGer_role } from '@taiger-common/core';

import SingleInterview from './SingleInterview';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            _id: 'user-001',
            role: 'Agent',
            firstname: 'Test',
            lastname: 'Agent',
            email: 'agent@example.com',
            timezone: 'UTC',
            archiv: false
        }
    })
}));

vi.mock('@/contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setOpenSnackbar: vi.fn(),
        setSeverity: vi.fn(),
        setMessage: vi.fn()
    })
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ interview_id: 'interview-001' }),
        useLocation: () => ({
            hash: '',
            pathname: '/',
            search: '',
            state: null
        }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('@/api', () => ({
    SubmitMessageWithAttachment: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    deleteAMessageInThread: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    deleteInterview: vi.fn().mockResolvedValue({ data: { success: true } }),
    updateInterview: vi.fn().mockResolvedValue({ data: { success: true } }),
    addInterviewTrainingDateTime: vi
        .fn()
        .mockResolvedValue({ data: { success: true } }),
    getUsers: vi.fn().mockResolvedValue({ data: { data: [], success: true } })
}));

vi.mock('@/api/query', () => ({
    getInterviewQuery: vi.fn(() => ({
        queryKey: ['interviews', 'interview-001'],
        queryFn: vi.fn().mockResolvedValue({
            data: {
                success: true,
                data: {
                    _id: { toString: () => 'interview-001' },
                    isClosed: false,
                    trainer_id: [],
                    student_id: {
                        _id: { toString: () => 'student-001' },
                        firstname: 'Alice',
                        lastname: 'Smith',
                        email: 'alice@example.com',
                        pictureUrl: ''
                    },
                    program_id: {
                        _id: { toString: () => 'program-001' },
                        school: 'TU Munich',
                        program_name: 'Computer Science',
                        degree: 'MSc',
                        semester: 'WS2024'
                    },
                    event_id: null,
                    interview_date: null,
                    thread_id: {
                        _id: { toString: () => 'thread-001' },
                        messages: []
                    }
                },
                interviewAuditLog: []
            }
        })
    }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => (
        <div data-testid="error-page">Error {res_status}</div>
    )
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main">Modal</div>
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@components/Message/MessageList', () => ({
    default: () => <div data-testid="message-list">Messages</div>
}));

vi.mock('@components/Message/DocThreadEditor', () => ({
    default: () => <div data-testid="doc-thread-editor">Editor</div>
}));

vi.mock('@components/Tabs', () => ({
    a11yProps: (_value: number, index: number) => ({
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`
    }),
    CustomTabPanel: ({
        children,
        value,
        index
    }: {
        children: ReactNode;
        value: number;
        index: number;
    }) => (value === index ? <div>{children}</div> : null)
}));

vi.mock('../Audit', () => ({
    default: () => <div data-testid="audit">Audit</div>
}));

vi.mock('./InterviewFeedback', () => ({
    InterviewFeedback: () => (
        <div data-testid="interview-feedback">Feedback</div>
    )
}));

vi.mock('./components/InterviewMetadataSidebar', () => ({
    default: () => <div data-testid="interview-metadata-sidebar">Sidebar</div>
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });

const renderSingleInterview = () => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <SingleInterview />
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('SingleInterview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
    });

    it('renders loading state initially', async () => {
        // The Loading component is shown while query is pending
        // We simulate this by having Loading mock always be present when data is not yet loaded.
        // Since useQuery starts with isLoading=true before the queryFn resolves,
        // we verify Loading appears and then disappears.
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity }
            }
        });
        // Use a deferred promise so the query stays pending during initial render
        let resolveQuery: (v: unknown) => void;
        const pendingPromise = new Promise((resolve) => {
            resolveQuery = resolve;
        });

        const { getInterviewQuery } = await import('@/api/query');
        vi.mocked(getInterviewQuery).mockReturnValueOnce({
            queryKey: ['interviews', 'interview-001'],
            queryFn: () => pendingPromise
        } as UseQueryOptions);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SingleInterview />
                </MemoryRouter>
            </QueryClientProvider>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        // Resolve to clean up
        resolveQuery!({
            data: { success: false, data: null, interviewAuditLog: [] }
        });
    });

    it('renders after data loads', async () => {
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        });
    });

    it('renders breadcrumbs after data loads', async () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
        });
    });

    it('renders tab navigation after data loads', async () => {
        renderSingleInterview();
        await waitFor(() => {
            // At least the discussion-thread tab should be present
            expect(screen.getByText('discussion-thread')).toBeInTheDocument();
        });
    });

    it('renders InterviewMetadataSidebar after data loads', async () => {
        renderSingleInterview();
        await waitFor(() => {
            expect(
                screen.getByTestId('interview-metadata-sidebar')
            ).toBeInTheDocument();
        });
    });

    it('renders All Interviews breadcrumb link for TaiGer role users', async () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(true);
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.getByText('All Interviews')).toBeInTheDocument();
        });
    });

    it('renders My Interviews breadcrumb link for non-TaiGer role users', async () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.getByText('My Interviews')).toBeInTheDocument();
        });
    });

    it('renders Audit tab for non-TaiGer role users', async () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(false);
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.getByText('Audit')).toBeInTheDocument();
        });
    });

    it('renders History tab for TaiGer role users', async () => {
        vi.mocked(is_TaiGer_role).mockReturnValue(true);
        renderSingleInterview();
        await waitFor(() => {
            expect(screen.getByText('History')).toBeInTheDocument();
        });
    });

    it('renders error page with HTTP status when interview query fails with axios-style error', async () => {
        const queryClient = createTestQueryClient();
        const { getInterviewQuery } = await import('@/api/query');
        vi.mocked(getInterviewQuery).mockReturnValueOnce({
            queryKey: ['interviews', 'interview-001'],
            queryFn: vi.fn().mockRejectedValue({ response: { status: 403 } })
        } as UseQueryOptions);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SingleInterview />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('error-page')).toHaveTextContent(
                'Error 403'
            );
        });
    });

    it('renders error page 500 when interview query fails without response status', async () => {
        const queryClient = createTestQueryClient();
        const { getInterviewQuery } = await import('@/api/query');
        vi.mocked(getInterviewQuery).mockReturnValueOnce({
            queryKey: ['interviews', 'interview-001'],
            queryFn: vi.fn().mockRejectedValue(new Error('Network error'))
        } as UseQueryOptions);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SingleInterview />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('error-page')).toHaveTextContent(
                'Error 500'
            );
        });
    });

    it('renders error page 404 when API returns no interview payload', async () => {
        const queryClient = createTestQueryClient();
        const { getInterviewQuery } = await import('@/api/query');
        vi.mocked(getInterviewQuery).mockReturnValueOnce({
            queryKey: ['interviews', 'interview-001'],
            queryFn: vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    data: null,
                    interviewAuditLog: []
                }
            })
        } as UseQueryOptions);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SingleInterview />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('error-page')).toHaveTextContent(
                'Error 404'
            );
        });
    });
});
