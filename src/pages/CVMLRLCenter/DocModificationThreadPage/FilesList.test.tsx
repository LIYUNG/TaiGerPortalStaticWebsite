import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FilesList from './FilesList';

vi.mock('./FileItem', () => ({
    default: ({ message }: { message: { file: { name: string }[] } }) => (
        <div data-testid="file-item">{message.file[0]?.name}</div>
    )
}));

const threadWithFiles = {
    _id: 'thread1',
    messages: [
        {
            _id: 'msg1',
            file: [{ name: 'cv.pdf', path: 'uploads/cv.pdf' }],
            user_id: { _id: 'u1', firstname: 'Alice', lastname: 'Bob' }
        },
        {
            _id: 'msg2',
            file: [],
            user_id: { _id: 'u2', firstname: 'Bob', lastname: 'Alice' }
        }
    ]
};

const threadWithNoMessages = { _id: 'thread2', messages: [] };

describe('FilesList', () => {
    it('renders FileItem for messages with files', () => {
        render(
            <MemoryRouter>
                <FilesList thread={threadWithFiles} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('file-item')).toBeInTheDocument();
        expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    });

    it('renders no files message when thread has no messages', () => {
        render(
            <MemoryRouter>
                <FilesList thread={threadWithNoMessages} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No messages found/i)).toBeInTheDocument();
    });

    it('renders no files uploaded message when messages have no files', () => {
        const threadNoFiles = {
            _id: 'thread3',
            messages: [{ _id: 'msg3', file: [], user_id: null }]
        };
        render(
            <MemoryRouter>
                <FilesList thread={threadNoFiles} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No files have been uploaded yet/i)).toBeInTheDocument();
    });

    it('renders null thread shows no messages text', () => {
        render(
            <MemoryRouter>
                <FilesList thread={null} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No messages found/i)).toBeInTheDocument();
    });
});
