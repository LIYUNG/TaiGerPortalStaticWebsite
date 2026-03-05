import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: () => false
}));

import DocumentsListItems from './DocumentsListItems';

const mockDocument = { _id: 'doc1', title: 'My Test Document' };
const mockOpenDelete = vi.fn();

describe('DocumentsListItems', () => {
    it('renders the document title as a link', () => {
        render(
            <MemoryRouter>
                <DocumentsListItems
                    document={mockDocument}
                    idx={1}
                    path="/docs/search"
                    openDeleteDocModalWindow={mockOpenDelete}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('My Test Document')).toBeInTheDocument();
    });

    it('renders the link with correct href', () => {
        render(
            <MemoryRouter>
                <DocumentsListItems
                    document={mockDocument}
                    idx={1}
                    path="/docs/search"
                    openDeleteDocModalWindow={mockOpenDelete}
                />
            </MemoryRouter>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/docs/search/doc1');
    });

    it('renders the index number', () => {
        render(
            <MemoryRouter>
                <DocumentsListItems
                    document={mockDocument}
                    idx={3}
                    path="/docs/search"
                    openDeleteDocModalWindow={mockOpenDelete}
                />
            </MemoryRouter>
        );
        // idx is rendered as a bare text node; use getAllByText which accepts partial match
        expect(screen.getByText((content) => content.includes('3'))).toBeInTheDocument();
    });
});
