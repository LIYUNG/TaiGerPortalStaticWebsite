import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TooManyRequestsError from './TooManyRequestsError';

describe('TooManyRequestsError', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <TooManyRequestsError />
            </MemoryRouter>
        );
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });

    it('shows try later message', () => {
        render(
            <MemoryRouter>
                <TooManyRequestsError />
            </MemoryRouter>
        );
        expect(screen.getByText(/try later/i)).toBeInTheDocument();
    });
});
