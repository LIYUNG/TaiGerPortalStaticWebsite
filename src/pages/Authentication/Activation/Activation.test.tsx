import { render, screen } from '@testing-library/react';
import Activation from './Activation';

vi.mock('@/api', () => ({
    activation: vi.fn(() => new Promise(() => {})), // never resolves — stays in initial pending state
    resendActivation: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@components/AuthWrapper', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    )
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

describe('Activation', () => {
    beforeEach(() => {
        // Simulate URL query params for email and token
        Object.defineProperty(window, 'location', {
            value: { search: '?email=test%40example.com&token=abc123' },
            writable: true
        });
    });

    it('renders the Link Expired state initially (before API resolves)', () => {
        render(<Activation />);
        expect(screen.getByText('Link Expired')).toBeInTheDocument();
    });

    it('renders the Resend button in the initial state', () => {
        render(<Activation />);
        expect(
            screen.getByRole('button', { name: /resend/i })
        ).toBeInTheDocument();
    });
});
