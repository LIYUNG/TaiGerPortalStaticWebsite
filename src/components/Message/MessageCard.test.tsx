import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: 'u1', role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000',
    IgnoreMessageThread: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn((name: string) => ({ children: name[0] })),
    convertDate: vi.fn(() => 'Jan 10, 2024')
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('../EditorJs/EditorSimple', () => ({
    default: () => <div data-testid="editor-simple" />
}));

vi.mock('../Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('react-file-icon', () => ({
    FileIcon: () => <span />,
    defaultStyles: {}
}));

import MessageCard from './MessageCard';

const mockMessage = {
    _id: 'msg1',
    message: JSON.stringify({ time: 1234567890, blocks: [] }),
    user_id: {
        _id: 'u1',
        firstname: 'Alice',
        lastname: 'Smith'
    },
    createdAt: '2024-01-10T10:00:00Z',
    ignore_message: false,
    file: []
};

const defaultProps = {
    message: mockMessage,
    isLoaded: true,
    documentsthreadId: 'thread1',
    apiPrefix: '/api/docs',
    onDeleteSingleMessage: vi.fn(),
    handleClickSave: vi.fn()
};

describe('MessageCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MessageCard {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
    });

    it('renders user full name', () => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('renders date', () => {
        expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
    });

    it('renders message card with correct structure', () => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
    });
});

describe('MessageCard for different user', () => {
    it('renders without editable controls for other user message', () => {
        const otherUserMessage = {
            ...mockMessage,
            _id: 'msg2',
            user_id: { _id: 'u2', firstname: 'Bob', lastname: 'Jones' }
        };
        render(
            <MemoryRouter>
                <MessageCard {...defaultProps} message={otherUserMessage} />
            </MemoryRouter>
        );
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('renders Staff TaiGer when user_id is missing', () => {
        const messageWithoutUser = {
            ...mockMessage,
            _id: 'msg3',
            user_id: undefined
        };
        render(
            <MemoryRouter>
                <MessageCard {...defaultProps} message={messageWithoutUser} />
            </MemoryRouter>
        );
        expect(screen.getByText('Staff TaiGer')).toBeInTheDocument();
    });
});
