import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthenticatedError from './UnauthenticatedError';

describe('UnauthenticatedError', () => {
    it('renders without crashing', () => {
        render(<MemoryRouter><UnauthenticatedError /></MemoryRouter>);
        expect(screen.getByText(/session is expired/i)).toBeInTheDocument();
    });

    it('shows login again prompt', () => {
        render(<MemoryRouter><UnauthenticatedError /></MemoryRouter>);
        expect(screen.getByText(/login again/i)).toBeInTheDocument();
    });
});
