import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GuestMainView from './GuestMainView';

describe('GuestMainView', () => {
    it('renders welcome heading', () => {
        render(<GuestMainView />);
        expect(screen.getByText('Welcome to Taiger!')).toBeInTheDocument();
    });

    it('renders welcome message text', () => {
        render(<GuestMainView />);
        expect(
            screen.getByText(/I hope you will enjoy the journey/)
        ).toBeInTheDocument();
    });

    it('renders a Card container', () => {
        const { container } = render(<GuestMainView />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
