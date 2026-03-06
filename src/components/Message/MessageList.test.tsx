import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./MessageCard', () => ({
    default: ({ message }: any) => (
        <div data-testid="message-card">{message._id}</div>
    )
}));

import MessageList from './MessageList';

const makeMessage = (id: string) => ({
    _id: id,
    message: JSON.stringify({ time: Date.now(), blocks: [] }),
    createdAt: '2024-01-10T10:00:00Z',
    user_id: { _id: 'u1', firstname: 'Alice', lastname: 'Smith' }
});

const defaultProps = {
    thread: { messages: [] },
    isLoaded: true,
    documentsthreadId: 'thread1',
    apiPrefix: '/api/docs',
    onDeleteSingleMessage: vi.fn(),
    handleClickSave: vi.fn()
};

describe('MessageList with no messages', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MessageList {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders empty state message', () => {
        expect(
            screen.getByText('No messages yet. Start the conversation!')
        ).toBeDefined();
    });
});

describe('MessageList with messages', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MessageList
                    {...defaultProps}
                    thread={{
                        messages: [makeMessage('m1'), makeMessage('m2')]
                    }}
                />
            </MemoryRouter>
        );
    });

    it('renders message cards', () => {
        const cards = screen.getAllByTestId('message-card');
        expect(cards.length).toBeGreaterThan(0);
    });
});

describe('MessageList with many messages', () => {
    it('renders load more button when messages exceed visible count', () => {
        const messages = Array.from({ length: 5 }, (_, i) =>
            makeMessage(`m${i + 1}`)
        );
        render(
            <MemoryRouter>
                <MessageList {...defaultProps} thread={{ messages }} />
            </MemoryRouter>
        );
        expect(screen.getByText(/Load/)).toBeDefined();
    });
});
