import {
    fireEvent,
    render as rtlRender,
    screen,
    waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

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
    const result = rtlRender(
        <MemoryRouter initialEntries={['/ai-assist']}>{ui}</MemoryRouter>,
        options
    );
    const chatHistoryButton = screen.queryByRole('button', {
        name: 'Chat / History'
    });
    if (chatHistoryButton) {
        fireEvent.click(chatHistoryButton);
    }
    return result;
};

describe('AIAssistPage — empty state', () => {
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

    it('renders the guided empty state when there are no conversations', async () => {
        apiMocks.getAIAssistConversations.mockResolvedValue({
            success: true,
            data: []
        });

        render(<AIAssistPage />);

        await waitFor(() => {
            expect(screen.getByText('Your overview')).toBeTruthy();
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
        // Held on an object so TypeScript does not narrow the deferred resolver
        // away: it is only assigned inside the Promise executor callback.
        const deferred: {
            resolve?: (value: {
                success: boolean;
                data: typeof conversations;
            }) => void;
        } = {};

        apiMocks.getAIAssistConversations.mockReturnValueOnce(
            new Promise((resolve) => {
                deferred.resolve = resolve;
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

        deferred.resolve?.({ success: true, data: conversations });

        await waitFor(() => {
            expect(input).toHaveValue('Need help');
        });
        expect(apiMocks.getAIAssistConversation).not.toHaveBeenCalled();
        expect(screen.queryByText('latest persisted answer')).toBeNull();
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
});
