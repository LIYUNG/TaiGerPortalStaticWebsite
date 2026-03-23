import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyDocLinkEditDialog from './SurveyDocLinkEditDialog';

const tFn = (k: string) => k;

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    surveyLink: 'https://example.com/doc',
    onChangeURL: vi.fn(),
    docName: 'Grading System',
    saving: false,
    t: tFn
};

describe('SurveyDocLinkEditDialog', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SurveyDocLinkEditDialog {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders dialog title', () => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('renders text field with doc name label', () => {
        expect(
            screen.getByLabelText(/documentation link for grading system/i)
        ).toBeInTheDocument();
    });

    it('renders save button', () => {
        expect(
            screen.getByRole('button', { name: /save/i })
        ).toBeInTheDocument();
    });

    it('shows current survey link value', () => {
        const input = screen.getByLabelText(
            /documentation link for grading system/i
        ) as HTMLInputElement;
        expect(input.value).toBe('https://example.com/doc');
    });
});
