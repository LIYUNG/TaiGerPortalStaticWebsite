import { render } from '@testing-library/react';
import { AuthProvider } from './index';

vi.mock('@/api', () => ({
    verify: vi.fn().mockResolvedValue({ data: { success: false } }),
    logout: vi.fn()
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn().mockReturnValue({ data: null, isPending: false })
    };
});

describe('AuthProvider', () => {
    test('renders without crashing', () => {
        const { container } = render(
            <AuthProvider>
                <div>Child</div>
            </AuthProvider>
        );
        expect(container.firstChild).toBeInTheDocument();
    });
});
