import {
    fireEvent,
    render,
    screen,
    waitFor,
    within
} from '@testing-library/react';
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
    streamAIAssistFirstMessage: vi.fn(),
    streamAIAssistMessage: vi.fn(),
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
        apiMocks.streamAIAssistFirstMessage.mockImplementation(
            async (payload: unknown) =>
                apiMocks.postAIAssistFirstMessage(payload)
        );
        apiMocks.streamAIAssistMessage.mockImplementation(
            async (conversationId: string, payload: unknown) =>
                apiMocks.postAIAssistMessage(conversationId, payload)
        );
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

    it('keeps mention text and does not add extra starter prompt text when selecting quick skill', async () => {
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
        ).toBe('@Abby Student ');
        expect(apiMocks.postAIAssistFirstMessage).not.toHaveBeenCalled();
    });

    it('sends draft messages with Enter and keeps newlines with Alt+Enter', async () => {
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
        await user.type(input, 'line 1{Alt>}{Enter}{/Alt}line 2');
        expect(input).toHaveValue('line 1\nline 2');

        await user.type(input, '{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: 'line 1\nline 2',
                preferredLanguage: 'en'
            });
        });
    });

    it('sends the selected student as message context', async () => {
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
        await user.type(
            screen.getByLabelText('Ask TaiGer AI'),
            'check risk now'
        );
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: '@Abby Student check risk now',
                assistContext: {
                    mentionedStudent: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    requestedSkill: 'identify_risk'
                },
                preferredLanguage: 'en'
            });
        });
        expect(apiMocks.postAIAssistMessage).not.toHaveBeenCalled();
    });

    it('auto-inserts @mention when selecting student from UI picker', async () => {
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

        expect(screen.getByLabelText('Ask TaiGer AI')).toHaveValue(
            '@Abby Student '
        );
    });

    it('submits with only selected student and skill without extra prompt', async () => {
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
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: '@Abby Student',
                assistContext: {
                    mentionedStudent: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    requestedSkill: 'identify_risk'
                },
                preferredLanguage: 'en'
            });
        });
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
                    },
                    preferredLanguage: 'en'
                }
            );
        });
        expect(apiMocks.postAIAssistFirstMessage).not.toHaveBeenCalled();
    });

    it('clears selected skill after each successful send', async () => {
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
        await user.type(input, 'first follow-up{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistMessage).toHaveBeenNthCalledWith(
                1,
                'conv_latest',
                {
                    message: 'first follow-up',
                    assistContext: {
                        mentionedStudent: {
                            id: 'student_abby',
                            displayName: 'Abby Student'
                        },
                        requestedSkill: 'review_open_tasks'
                    },
                    preferredLanguage: 'en'
                }
            );
        });

        await user.clear(input);
        await user.type(input, 'second follow-up{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistMessage).toHaveBeenNthCalledWith(
                2,
                'conv_latest',
                {
                    message: 'second follow-up',
                    assistContext: {
                        mentionedStudent: {
                            id: 'student_abby',
                            displayName: 'Abby Student'
                        }
                    },
                    preferredLanguage: 'en'
                }
            );
        });
    });

    it('resolves @student suggestions into assistContext', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        apiMocks.searchAIAssistStudents.mockResolvedValueOnce({
            success: true,
            data: [pickerStudents[0]]
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, '@Abb');

        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: 'Use student Abby Student'
                })
            ).toBeTruthy();
        });
        await user.click(
            screen.getByRole('option', {
                name: 'Use student Abby Student'
            })
        );
        await user.type(input, ' review risks{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: expect.stringContaining('review risks'),
                assistContext: {
                    mentionedStudent: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    }
                },
                preferredLanguage: 'en'
            });
        });
    });

    it('matches @student suggestions by chinese name without spaces', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        apiMocks.searchAIAssistStudents.mockResolvedValueOnce({
            success: true,
            data: [pickerStudents[0]]
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, '@學生艾比');

        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: 'Use student Abby Student'
                })
            ).toBeTruthy();
        });
    });

    it('resolves #skill suggestions into assistContext', async () => {
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
        await user.type(input, '#iden');

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Use skill identify_risk'
                })
            ).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', {
                name: 'Use skill identify_risk'
            })
        );
        await user.type(input, ' for this case{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: expect.stringContaining(
                    '#identify_risk for this case'
                ),
                assistContext: {
                    requestedSkill: 'identify_risk'
                },
                preferredLanguage: 'en'
            });
        });
    });

    it('does not bind a selected student to the conversation payload', async () => {
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
        await user.type(
            screen.getByLabelText('Ask TaiGer AI'),
            'risk follow-up'
        );
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: '@Abby Student risk follow-up',
                assistContext: {
                    mentionedStudent: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    requestedSkill: 'identify_risk'
                },
                preferredLanguage: 'en'
            });
        });
    });

    it('supports keyboard selection for @student suggestions', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        apiMocks.searchAIAssistStudents.mockResolvedValueOnce({
            success: true,
            data: [pickerStudents[0], pickerStudents[1]]
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Blank chat' })
            ).toBeTruthy();
        });
        await user.click(screen.getByRole('button', { name: 'Blank chat' }));

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.type(input, '@Ad');
        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: 'Use student Ada Lovelace'
                })
            ).toBeTruthy();
        });

        await user.keyboard('{ArrowDown}{Enter}');
        await user.type(input, ' ping{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: expect.stringContaining('ping'),
                assistContext: {
                    mentionedStudent: {
                        id: 'student_ada',
                        displayName: 'Ada Lovelace'
                    }
                },
                preferredLanguage: 'en'
            });
        });
    });

    it('does not send a mentioned student id for unresolved @student text', async () => {
        const user = userEvent.setup();
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        apiMocks.searchAIAssistStudents.mockResolvedValueOnce({
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
        await user.type(input, '@UnknownStudent review this{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistFirstMessage).toHaveBeenCalledWith({
                message: '@UnknownStudent review this',
                preferredLanguage: 'en'
            });
        });
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

    it('highlights mention and skill tokens in message text from metadata', async () => {
        apiMocks.getAIAssistConversation.mockResolvedValueOnce({
            success: true,
            data: {
                conversation: conversations[0],
                messages: [
                    {
                        id: 'msg_user_meta',
                        conversationId: 'conv_latest',
                        role: 'user',
                        content: '@Abby Student #identify_risk check blockers',
                        linkHints: [
                            {
                                label: '@Abby Student',
                                entityType: 'student',
                                entityId: 'student_abby',
                                start: 0,
                                end: 13,
                                route: 'student_database_profile'
                            }
                        ],
                        skillTrace: {
                            requestedSkill: 'identify_risk',
                            resolvedSkill: 'identify_risk',
                            mode: 'composer',
                            student: {
                                id: 'student_abby',
                                displayName: 'Abby Student'
                            },
                            status: 'captured',
                            steps: []
                        }
                    }
                ],
                trace: []
            }
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: '@Abby Student' })
            ).toBeTruthy();
        });
        expect(screen.getByText('#identify_risk check blockers')).toBeTruthy();
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
        await user.click(screen.getByRole('button', { name: 'Send message' }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'AI Assist is temporarily unavailable. Please try again.'
                )
            ).toBeTruthy();
        });
        expect(input).toHaveValue('Need help');
    });

    it('shows tool traces as readable collapsed summaries by default', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        expect(screen.getByText('Tools used (1)')).toBeTruthy();
        expect(screen.getAllByText('Search students').length).toBeGreaterThan(
            0
        );
        expect(screen.queryByText(/"arguments"/)).toBeNull();

        await user.click(
            screen.getAllByRole('button', {
                name: 'Show details for Search students'
            })[0]
        );

        expect(screen.getByText(/"arguments"/)).toBeTruthy();
    });

    it('shows go-to-bottom button when transcript is scrolled up', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        const transcript = screen.getByTestId(
            'ai-assist-transcript'
        ) as HTMLDivElement;
        const scrollToMock = vi.fn();

        Object.defineProperty(transcript, 'scrollTo', {
            configurable: true,
            value: scrollToMock
        });
        Object.defineProperty(transcript, 'scrollHeight', {
            configurable: true,
            value: 1000
        });
        Object.defineProperty(transcript, 'clientHeight', {
            configurable: true,
            value: 200
        });
        Object.defineProperty(transcript, 'scrollTop', {
            configurable: true,
            value: 0,
            writable: true
        });

        fireEvent.scroll(transcript);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Go to bottom' })
            ).toBeTruthy();
        });

        await user.click(screen.getByRole('button', { name: 'Go to bottom' }));

        expect(scrollToMock).toHaveBeenCalledWith({
            top: 1000,
            behavior: 'auto'
        });
        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: 'Go to bottom' })
            ).toBeNull();
        });
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
