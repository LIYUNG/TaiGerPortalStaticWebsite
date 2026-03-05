import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthorizedError from './UnauthorizedError';

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

describe('UnauthorizedError', () => {
    it('renders without crashing', () => {
        render(<MemoryRouter><UnauthorizedError /></MemoryRouter>);
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });

    it('shows company name', () => {
        render(<MemoryRouter><UnauthorizedError /></MemoryRouter>);
        expect(screen.getByText(/TaiGer/)).toBeInTheDocument();
    });
});
