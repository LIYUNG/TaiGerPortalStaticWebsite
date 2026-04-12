import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const apiMocks = vi.hoisted(() => ({
    createAIAssistConversation: vi.fn(),
    getAIAssistConversation: vi.fn(),
    getAIAssistConversations: vi.fn(),
    postAIAssistMessage: vi.fn()
}));

vi.mock('@/api', () => apiMocks);

import AIAssistPage from './AIAssistPage';

const conversations = [
    {
        id: 'conv_latest',
        title: 'Latest risk review',
        status: 'active',
        createdAt: '2026-04-12T10:00:00.000Z',
        updatedAt: '2026-04-12T10:05:00.000Z'
    },
    {
        id: 'conv_older',
        title: 'Older student summary',
        status: 'active',
        createdAt: '2026-04-11T10:00:00.000Z',
        updatedAt: '2026-04-11T10:05:00.000Z'
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
                content: 'latest persisted answer'
            }
        ],
        trace: [
            {
                id: 'trace_latest',
                conversationId: 'conv_latest',
                assistantMessageId: 'msg_latest_assistant',
                toolName: 'search_accessible_students',
                status: 'success',
                durationMs: 12
            }
        ]
    },
    conv_older: {
        conversation: conversations[1],
        messages: [
            {
                id: 'msg_older_user',
                conversationId: 'conv_older',
                role: 'user',
                content: 'Summarize Ada'
            },
            {
                id: 'msg_older_assistant',
                conversationId: 'conv_older',
                role: 'assistant',
                content: 'older persisted answer'
            }
        ],
        trace: []
    }
};

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
        apiMocks.createAIAssistConversation.mockResolvedValue({
            success: true,
            data: {
                id: 'conv_new',
                title: 'New AI Assist conversation'
            }
        });
        apiMocks.postAIAssistMessage.mockResolvedValue({
            success: true,
            data: {
                answer: 'mocked AI Assist answer',
                userMessage: {
                    id: 'msg_user',
                    role: 'user',
                    content: 'Find my students'
                },
                assistantMessage: {
                    id: 'msg_assistant',
                    role: 'assistant',
                    content: 'mocked AI Assist answer'
                },
                trace: [
                    {
                        id: 'trace_1',
                        toolName: 'search_accessible_students',
                        status: 'success',
                        durationMs: 12,
                        arguments: { query: 'Find my students' },
                        result: {
                            data: [{ name: 'Ada Lovelace' }]
                        }
                    }
                ]
            }
        });
    });

    it('renders the empty state and prompt input when there are no conversations', async () => {
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });
        render(<AIAssistPage />);

        expect(screen.getByRole('heading', { name: 'AI Assist' })).toBeTruthy();
        await waitFor(() => {
            expect(screen.getByText('Start with a question')).toBeTruthy();
        });
        expect(
            screen.getAllByText('Summarize a student').length
        ).toBeGreaterThan(0);
        expect(screen.getByLabelText('Ask AI Assist')).toBeTruthy();
    });

    it('loads the newest persisted conversation on refresh', async () => {
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });
        expect(screen.getByText('Latest risk review')).toBeTruthy();
        expect(screen.getByText('search_accessible_students')).toBeTruthy();
        expect(apiMocks.getAIAssistConversation).toHaveBeenCalledWith(
            'conv_latest'
        );
    });

    it('switches between persisted conversations', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });
        await user.click(
            screen.getByRole('button', { name: 'Older student summary' })
        );

        await waitFor(() => {
            expect(screen.getByText('older persisted answer')).toBeTruthy();
        });
        expect(screen.queryByText('latest persisted answer')).toBeNull();
        expect(apiMocks.getAIAssistConversation).toHaveBeenCalledWith(
            'conv_older'
        );
    });

    it('sends a message and renders answer with tool trace', async () => {
        const user = userEvent.setup();
        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });
        await user.clear(screen.getByLabelText('Ask AI Assist'));
        await user.type(
            screen.getByLabelText('Ask AI Assist'),
            'Find my students'
        );
        await user.click(screen.getByRole('button', { name: 'Ask' }));

        await waitFor(() => {
            expect(screen.getByText('mocked AI Assist answer')).toBeTruthy();
        });
        expect(apiMocks.postAIAssistMessage).toHaveBeenCalledWith(
            'conv_latest',
            {
                message: 'Find my students'
            }
        );
        expect(screen.getByText('search_accessible_students')).toBeTruthy();
        expect(screen.getByText(/success/)).toBeTruthy();
    });
});
