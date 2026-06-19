import {
    fireEvent,
    render as rtlRender,
    screen,
    waitFor,
    within
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

describe('AIAssistPage — student picker', () => {
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
});
