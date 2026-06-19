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

describe('AIAssistPage — conversation management', () => {
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
