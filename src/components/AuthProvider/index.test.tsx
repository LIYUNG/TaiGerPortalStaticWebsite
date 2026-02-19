import { render, screen } from '@testing-library/react';
import { AuthProvider } from './index';

vi.mock('@/api', () => ({
    verify: vi.fn().mockResolvedValue({ data: { success: false } }),
    logout: vi.fn()
}));

describe('AuthProvider', () => {
    test('renders without crashing', () => {
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
