import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import GuestDashboard from './GuestDashboard';

describe('GuestDashboard', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <GuestDashboard />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('renders welcome text', () => {
        render(
            <MemoryRouter>
                <GuestDashboard />
            </MemoryRouter>
        );
        expect(screen.getByText('Welcome to Taiger!')).toBeTruthy();
    });
});
