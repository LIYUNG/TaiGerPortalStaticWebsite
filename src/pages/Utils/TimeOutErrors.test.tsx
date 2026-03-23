import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TimeOutErrors from './TimeOutErrors';

describe('TimeOutErrors', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <TimeOutErrors />
            </MemoryRouter>
        );
        expect(screen.getByText(/time out/i)).toBeInTheDocument();
    });

    it('shows login again message', () => {
        render(
            <MemoryRouter>
                <TimeOutErrors />
            </MemoryRouter>
        );
        expect(screen.getByText(/login again/i)).toBeInTheDocument();
    });
});
