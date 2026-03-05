import { render, screen } from '@testing-library/react';
import Reactivation from './Reactivation';

vi.mock('@/api', () => ({
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

describe('Reactivation', () => {
    it('renders the not-activated message and Resend button initially', () => {
        render(<Reactivation email="test@example.com" />);
        expect(
            screen.getByText('Account is not activated')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /resend/i })
        ).toBeInTheDocument();
    });

    it('renders without crashing when email is undefined', () => {
        render(<Reactivation email={undefined} />);
        expect(
            screen.getByRole('button', { name: /resend/i })
        ).toBeInTheDocument();
    });
});
