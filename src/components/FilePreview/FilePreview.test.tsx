import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('../PDFViewer', () => ({
    default: (_apiFilePath: string, _path: string) => (
        <div data-testid="pdf-viewer">PDF Viewer</div>
    )
}));

import FilePreview from './FilePreview';

describe('FilePreview for non-PDF file', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <FilePreview
                    apiFilePath="/api/files/image.png"
                    path="image.png"
                />
            </MemoryRouter>
        );
    });

    it('renders image preview for non-PDF', () => {
        const img = document.querySelector('img');
        expect(img).toBeDefined();
        expect(img?.getAttribute('alt')).toBe('Preview');
    });

    it('renders download button', () => {
        expect(screen.getByText(/Download/i)).toBeDefined();
    });
});

describe('FilePreview for PDF file', () => {
    it('renders PDFViewer for pdf extension', () => {
        render(
            <MemoryRouter>
                <FilePreview
                    apiFilePath="/api/files/document.pdf"
                    path="document.pdf"
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('pdf-viewer')).toBeDefined();
    });
});

describe('FilePreview with different file types', () => {
    it('renders image preview for jpg', () => {
        render(
            <MemoryRouter>
                <FilePreview
                    apiFilePath="/api/files/photo.jpg"
                    path="photo.jpg"
                />
            </MemoryRouter>
        );
        const img = document.querySelector('img');
        expect(img).toBeDefined();
    });
});
