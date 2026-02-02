import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
    it('renders without crashing', () => {
        render(<Footer />);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('shows copyright and TaiGer link', () => {
        render(<Footer />);
        expect(screen.getByText(/Copyright/)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /TaiGer Consultancy/ })
        ).toBeInTheDocument();
    });
});
