import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './index';

jest.mock('../../api/index', () => ({
    verify: jest.fn().mockResolvedValue({ data: { success: false } }),
    logout: jest.fn()
}));

describe('AuthProvider', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <AuthProvider>
                <div>Child</div>
            </AuthProvider>
        );
        // Before verify() resolves, Loading is shown; after, children or Loading
        expect(container.firstChild).toBeInTheDocument();
        expect(screen.getByText(/loading|Child/)).toBeInTheDocument();
    });
});
