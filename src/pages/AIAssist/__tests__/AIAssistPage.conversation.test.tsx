import {
    fireEvent,
    render as rtlRender,
    screen,
    waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
    createAIAssistConversation: vi.fn(),
    deleteAIAssistConversation: vi.fn(),
    getAIAssistConversation: vi.fn(),
    getAIAssistConversations: vi.fn(),
    getAIAssistLatestAnalysis: vi.fn(),
    getAIAssistMyStudents: vi.fn(),
    getAIAssistOverview: vi.fn(),
    getAIAssistRecentStudents: vi.fn(),
    postAIAssistFirstMessage: vi.fn(),
    postAIAssistMessage: vi.fn(),
    streamAIAssistFirstMessage: vi.fn(),
    streamAIAssistMessage: vi.fn(),
    searchAIAssistStudents: vi.fn(),
    updateAIAssistConversation: vi.fn()
}));

vi.mock('@/api', () => apiMocks);

import AIAssistPage from '../AIAssistPage';
import {
    conversations,
    conversationDetails,
    pickerStudents,
    firstMessageResponse,
    followUpResponse
} from './fixtures';

const render = (
    ui: Parameters<typeof rtlRender>[0],
    options?: Parameters<typeof rtlRender>[1]
): ReturnType<typeof rtlRender> => {
    const result = rtlRender(ui, options);
    const chatHistoryButton = screen.queryByRole('button', {
        name: 'Chat / History'
    });
    if (chatHistoryButton) {
        fireEvent.click(chatHistoryButton);
    }
    return result;
};

const openLatestConversation = async (): Promise<void> => {
    fireEvent.click(
        await screen.findByRole('button', { name: 'Latest risk review' })
    );
};

describe('AIAssistPage — conversation and skill context', () => {
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
        apiMocks.getAIAssistLatestAnalysis.mockResolvedValue({
            success: true,
            data: null
        });
        apiMocks.getAIAssistOverview.mockResolvedValue({
            success: true,
            data: { buckets: {} }
        });
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
        apiMocks.postAIAssistFirstMessage.mockResolvedValue(
            firstMessageResponse
        );
        apiMocks.postAIAssistMessage.mockResolvedValue(followUpResponse);
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
            data: { ...conversations[0], status: 'archived' }
        });
        apiMocks.updateAIAssistConversation.mockResolvedValue({
            success: true,
            data: { ...conversations[0], title: 'Abby message review' }
        });
    });

    it('sends quick skill context with follow-up messages', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await openLatestConversation();

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        await user.click(
            screen.getAllByRole('button', { name: 'Review open tasks' })[0]
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

    it('sends new lead-meeting skill context', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await openLatestConversation();

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        await user.click(
            screen.getByRole('button', { name: 'Summarize meetings' })
        );

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.clear(input);
        await user.type(input, 'meeting highlights{Enter}');

        await waitFor(() => {
            expect(apiMocks.postAIAssistMessage).toHaveBeenCalledWith(
                'conv_latest',
                {
                    message: 'meeting highlights',
                    assistContext: {
                        mentionedStudent: {
                            id: 'student_abby',
                            displayName: 'Abby Student'
                        },
                        requestedSkill: 'summarize_lead_meetings'
                    },
                    preferredLanguage: 'en'
                }
            );
        });
    });

    it('clears selected skill after each successful send', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await openLatestConversation();

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        await user.click(
            screen.getAllByRole('button', { name: 'Review open tasks' })[0]
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

    it('shows skill used and student used under the assistant message', async () => {
        render(<AIAssistPage />);

        await openLatestConversation();

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
                        content:
                            '@Abby Student [reflink:1|@Abby Student] #identify_risk check blockers',
                        linkHints: {
                            '1': {
                                entityType: 'student',
                                entityId: 'student_abby'
                            }
                        },
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

        await openLatestConversation();

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: '@Abby Student' })
            ).toBeTruthy();
        });
        expect(screen.getByTestId('ai-assist-chat-panel')).toHaveTextContent(
            '#identify_risk check blockers'
        );
        expect(screen.getByText('Skill used: identify_risk')).toBeTruthy();
        expect(screen.getByText('Student: Abby Student')).toBeTruthy();
    });

    it('shows tool traces as readable collapsed summaries by default', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await openLatestConversation();

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

        await openLatestConversation();

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
});
