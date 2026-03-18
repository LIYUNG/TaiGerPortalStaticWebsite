import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResourceLockedError from './ResourceLockedError';

describe('ResourceLockedError', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <ResourceLockedError />
            </MemoryRouter>
        );
        expect(screen.getByText(/locked/i)).toBeInTheDocument();
    });

    it('shows resource locked message', () => {
        render(
            <MemoryRouter>
                <ResourceLockedError />
            </MemoryRouter>
        );
        expect(screen.getByText(/resource is locked/i)).toBeInTheDocument();
    });
});
