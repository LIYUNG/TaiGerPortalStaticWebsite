import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileItem from './FileItem';

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('react-file-icon', () => ({
    FileIcon: () => <div data-testid="file-icon" />,
    defaultStyles: {}
}));

const mockMessage = {
    _id: 'msg1',
    file: [
        {
            name: 'document.pdf',
            path: 'uploads/document.pdf'
        }
    ],
    user_id: {
        _id: 'user1',
        firstname: 'Jane',
        lastname: 'Smith'
    }
};

describe('FileItem', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <FileItem message={mockMessage} />
            </MemoryRouter>
        );
    });

    it('renders the file name', () => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('renders the uploader name', () => {
        expect(screen.getByText(/Jane/i)).toBeInTheDocument();
        expect(screen.getByText(/Smith/i)).toBeInTheDocument();
    });

    it('renders a file icon', () => {
        expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });

    it('renders a download link', () => {
        const link = screen.getByRole('link', {
            name: /Download document.pdf/i
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining('document.pdf')
        );
    });
});
