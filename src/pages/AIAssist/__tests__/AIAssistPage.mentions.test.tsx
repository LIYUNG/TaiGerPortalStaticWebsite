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

describe('AIAssistPage — @mention and #skill', () => {
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

        await openLatestConversation();

        await waitFor(() => {
            expect(screen.getByText('latest persisted answer')).toBeTruthy();
        });

        const input = screen.getByLabelText('Ask TaiGer AI');
        await user.clear(input);
        await user.type(input, '#unknown_skill Review this thread');

        expect(screen.getByText('Unknown skill, using auto mode')).toBeTruthy();
    });
});
