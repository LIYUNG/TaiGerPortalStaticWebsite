import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
    beforeEach(() => {
        render(<Footer />);
    });

    it('renders without crashing', () => {
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('shows copyright and TaiGer link', () => {
        expect(screen.getByText(/Copyright/)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /TaiGer Consultancy/ })
        ).toBeInTheDocument();
    });
});
