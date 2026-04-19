import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
    createAIAssistConversation: vi.fn(),
    deleteAIAssistConversation: vi.fn(),
    getAIAssistConversation: vi.fn(),
    getAIAssistConversations: vi.fn(),
    getAIAssistMyStudents: vi.fn(),
    getAIAssistRecentStudents: vi.fn(),
    postAIAssistFirstMessage: vi.fn(),
    postAIAssistMessage: vi.fn(),
    searchAIAssistStudents: vi.fn(),
    updateAIAssistConversation: vi.fn()
}));

vi.mock('@/api', () => apiMocks);

import AIAssistPage from './AIAssistPage';

const conversations = [
    {
        id: 'conv_latest',
        title: 'Latest risk review',
        status: 'active',
        studentId: 'student_abby',
        studentDisplayName: 'Abby Student',
        createdAt: '2026-04-12T10:00:00.000Z',
        updatedAt: '2026-04-12T10:05:00.000Z'
    }
];

const conversationDetails = {
    conv_latest: {
        conversation: conversations[0],
        messages: [
            {
                id: 'msg_latest_user',
                conversationId: 'conv_latest',
                role: 'user',
                content: 'Find application risks'
            },
            {
                id: 'msg_latest_assistant',
                conversationId: 'conv_latest',
                role: 'assistant',
                content: 'latest persisted answer',
                skillTrace: {
                    requestedSkill: 'identify_risk',
                    resolvedSkill: 'identify_risk',
                    mode: 'skill',
                    student: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    status: 'completed',
                    steps: []
                }
            }
        ],
        trace: [
            {
                id: 'trace_latest',
                conversationId: 'conv_latest',
                assistantMessageId: 'msg_latest_assistant',
                toolName: 'search_accessible_students',
                status: 'success',
                durationMs: 12,
                arguments: { query: 'Abby' },
                result: { data: [{ id: 'student_abby', name: 'Abby Student' }] }
            }
        ]
    }
};

const pickerStudents = [
    {
        id: 'student_abby',
        name: 'Abby Student',
        chineseName: '學生艾比',
        email: 'abby@example.com',
        applyingProgramCount: 3
    },
    {
        id: 'student_ada',
        name: 'Ada Lovelace',
        chineseName: '洛芙蕾絲',
        email: 'ada@example.com',
        applyingProgramCount: 2
    }
];

describe('AIAssistPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: conversations
        });
        apiMocks.getAIAssistConversation.mockImplementation(
            (conversationId: keyof typeof conversationDetails) =>
                Promise.resolve({
                    success: true,
                    data: conversationDetails[conversationId]
                })
        );
        apiMocks.getAIAssistRecentStudents.mockResolvedValue({
            success: true,
            data: pickerStudents
        });
        apiMocks.getAIAssistMyStudents.mockResolvedValue({
            success: true,
            data: pickerStudents
        });
        apiMocks.searchAIAssistStudents.mockResolvedValue({
            success: true,
            data: [pickerStudents[0]]
        });
        apiMocks.postAIAssistFirstMessage.mockResolvedValue({
            success: true,
            data: {
                conversation: {
                    id: 'conv_new',
                    title: 'New AI Assist conversation',
                    status: 'active',
                    studentId: 'student_abby',
                    studentDisplayName: 'Abby Student'
                },
                answer: 'mocked AI Assist answer',
                userMessage: {
                    id: 'msg_user',
                    conversationId: 'conv_new',
                    role: 'user',
                    content: 'Review this student'
                },
                assistantMessage: {
                    id: 'msg_assistant',
                    conversationId: 'conv_new',
                    role: 'assistant',
                    content: 'mocked AI Assist answer'
                },
                skillTrace: {
                    requestedSkill: 'identify_risk',
                    resolvedSkill: 'identify_risk',
                    mode: 'skill',
                    student: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    status: 'completed',
                    steps: []
                },
                trace: [
                    {
                        id: 'trace_first',
                        conversationId: 'conv_new',
                        assistantMessageId: 'msg_assistant',
                        toolName: 'get_student_summary',
                        status: 'success',
                        durationMs: 16
                    }
                ]
            }
        });
        apiMocks.postAIAssistMessage.mockResolvedValue({
            success: true,
            data: {
                answer: 'follow-up answer',
                userMessage: {
                    id: 'msg_follow_up_user',
                    conversationId: 'conv_latest',
                    role: 'user',
                    content: 'Any new risks?'
                },
                assistantMessage: {
                    id: 'msg_follow_up_assistant',
                    conversationId: 'conv_latest',
                    role: 'assistant',
                    content: 'follow-up answer'
                },
                skillTrace: {
                    requestedSkill: 'review_open_tasks',
                    resolvedSkill: 'review_open_tasks',
                    mode: 'skill',
                    student: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    status: 'completed',
                    steps: []
                },
                trace: [
                    {
                        id: 'trace_follow_up',
                        conversationId: 'conv_latest',
                        assistantMessageId: 'msg_follow_up_assistant',
                        toolName: 'get_student_applications',
                        status: 'success',
                        durationMs: 10
                    }
                ]
            }
        });
        apiMocks.deleteAIAssistConversation.mockResolvedValue({
            success: true,
            data: {
                ...conversations[0],
                status: 'archived'
            }
        });
        apiMocks.updateAIAssistConversation.mockResolvedValue({
            success: true,
            data: {
                ...conversations[0],
                title: 'Abby message review'
            }
        });
    });

    it('renders the guided empty state when there are no conversations', async () => {
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('Start with a question')).toBeTruthy();
        });
        expect(
            screen.getByRole('button', { name: 'Choose student' })
        ).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Blank chat' })).toBeTruthy();
    });

    it('creates a draft conversation locally without creating a backend conversation', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        expect(apiMocks.createAIAssistConversation).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Ask TaiGer AI')).toBeTruthy();
    });

    it('keeps a local draft when the initial conversation load resolves late', async () => {
        const user = userEvent.setup();
        let resolveConversations:
            | ((value: {
                  success: boolean;
                  data: typeof conversations;
              }) => void)
            | null = null;

        apiMocks.getAIAssistConversations.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveConversations = resolve;
            })
        );

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, 'Need help');

        resolveConversations?.({
            success: true,
            data: conversations
        });

        await waitFor(() => {
            expect(input).toHaveValue('Need help');
        });
        expect(apiMocks.getAIAssistConversation).not.toHaveBeenCalled();
        expect(screen.queryByText('latest persisted answer')).toBeNull();
    });

    it('loads quick-start student sources for the student-first flow', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Choose student' })
            ).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Choose student' })
        );

        await waitFor(() => {
            expect(screen.getByText('Recent students')).toBeTruthy();
        });
        expect(apiMocks.getAIAssistRecentStudents).toHaveBeenCalledTimes(1);
        expect(apiMocks.getAIAssistMyStudents).toHaveBeenCalledTimes(1);
        expect(screen.getAllByText('Abby Student').length).toBeGreaterThan(0);
    });

    it('prefills a starter action after selecting a student without auto-sending', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Choose student' })
            ).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Choose student' })
        );

        const recentSection = await screen.findByTestId(
            'ai-assist-student-section-recent'
        );
        await user.click(
            within(recentSection).getByRole('button', { name: 'Abby Student' })
        );
        await user.click(
            screen.getByRole('button', { name: 'Find application risks' })
        );

        expect(
            String(
                screen.getByLabelText('Ask TaiGer AI').getAttribute('value') ??
                    (
                        screen.getByLabelText(
                            'Ask TaiGer AI'
                        ) as HTMLTextAreaElement
                    ).value
            )
        ).toContain('identify the main risks');
        expect(apiMocks.postAIAssistFirstMessage).not.toHaveBeenCalled();
    });

    it('sends draft messages with Enter and keeps newlines with Shift+Enter', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, 'line 1{Shift>}{Enter}{/Shift}line 2');
        expect(input).toHaveValue('line 1\nline 2');

        await user.type(input, '{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: 'line 1\nline 2'
            });
        });
    });

    it('binds the selected student when sending the first draft message', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Choose student' })
            ).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Choose student' })
        );

        const recentSection = await screen.findByTestId(
            'ai-assist-student-section-recent'
        );
        await user.click(
            within(recentSection).getByRole('button', { name: 'Abby Student' })
        );
        await user.click(
            screen.getByRole('button', { name: 'Find application risks' })
        );
        await user.click(screen.getByRole('button', { name: 'Ask' }));

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: expect.stringContaining('identify the main risks'),
                studentId: 'student_abby',
                studentDisplayName: 'Abby Student',
                assistContext: {
                    mentionedStudent: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    requestedSkill: 'identify_risk'
                }
            });
        });
        expect(apiMocks.postAIAssistMessage).not.toHaveBeenCalled();
    });

    it('sends quick skill context with follow-up messages', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        await user.click(
            screen.getByRole('button', { name: 'Review open tasks' })
        );

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.clear(input);
        await user.type(input, 'Any new risks?{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistMessage).toHaveBeenCalledWith(
                'conv_latest',
                {
                    message: 'Any new risks?',
                    assistContext: {
                        mentionedStudent: {
                            id: 'student_abby',
                            displayName: 'Abby Student'
                        },
                        requestedSkill: 'review_open_tasks'
                    }
                }
            );
        });
        expect(apiMocks.postAIAssistFirstMessage).not.toHaveBeenCalled();
    });

    it('shows a passive fallback hint for unknown #skill tags', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.clear(input);
        await user.type(input, '#unknown_skill Review this thread');

        expect(screen.getByText('Unknown skill, using auto mode')).toBeTruthy();
    });

    it('shows skill used and student used under the assistant message', async () => {
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        expect(screen.getByText('Skill used: identify_risk')).toBeTruthy();
        expect(screen.getByText('Student: Abby Student')).toBeTruthy();
    });

    it('preserves the draft text when the first message request fails', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        apiMocks.postAIAssistFirstMessage.mockRejectedValueOnce(
            new Error('send failed')
        );

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, 'Need help');
        await user.click(screen.getByRole('button', { name: 'Ask' }));

        await waitFor(() => {
            expect(screen.getByText('send failed')).toBeTruthy();
        });
        expect(input).toHaveValue('Need help');
    });

    it('groups tool calls under the matching assistant message', async () => {
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        expect(screen.getByText('Tools used (1)')).toBeTruthy();
        expect(
            screen.getAllByText('search_accessible_students').length
        ).toBeGreaterThan(0);
    });

    it('archives a conversation from the side rail and removes it from view', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('Latest risk review')).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Delete Latest risk review' })
        );

        await waitFor(() => {
            expect(apiMocks.deleteAIAssistConversation).toHaveBeenCalledWith(
                'conv_latest'
            );
        });
        expect(screen.queryByText('Latest risk review')).toBeNull();
    });

    it('keeps rename behavior for persisted conversations', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('Latest risk review')).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Rename Latest risk review' })
        );

        const titleInput = screen.getByLabelText('Conversation title');
        await user.clear(titleInput);
        await user.type(titleInput, 'Abby message review{Enter}');

        await waitFor(() => {
            expect(apiMocks.updateAIAssistConversation).toHaveBeenCalledWith(
                'conv_latest',
                { title: 'Abby message review' }
            );
        });
        expect(screen.getByText('Abby message review')).toBeTruthy();
    });
});
