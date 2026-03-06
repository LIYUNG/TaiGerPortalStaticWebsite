import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading (full variant)', () => {
    beforeEach(() => {
        render(<Loading />);
    });

    it('renders without crashing', () => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows loading text', () => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});

describe('Loading (child variant)', () => {
    beforeEach(() => {
        render(<Loading variant="child" />);
    });

    it('renders without crashing', () => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows loading text', () => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
