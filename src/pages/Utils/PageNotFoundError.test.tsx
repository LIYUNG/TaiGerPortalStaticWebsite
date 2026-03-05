import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageNotFoundError from './PageNotFoundError';

describe('PageNotFoundError', () => {
    it('renders without crashing', () => {
        render(<MemoryRouter><PageNotFoundError /></MemoryRouter>);
        expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('renders heading text', () => {
        render(<MemoryRouter><PageNotFoundError /></MemoryRouter>);
        expect(screen.getByRole('heading')).toBeInTheDocument();
    });
});
