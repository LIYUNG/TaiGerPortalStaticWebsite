import { render, screen } from '@testing-library/react';
import { GoogleLoginButton } from './GoolgeSignInButton';

describe('GoogleLoginButton (GoolgeSignInButton)', () => {
    it('renders without crashing', () => {
        render(<GoogleLoginButton />);
        expect(
            screen.getByRole('button', { name: /Continue with Google/i })
        ).toBeInTheDocument();
    });
});
