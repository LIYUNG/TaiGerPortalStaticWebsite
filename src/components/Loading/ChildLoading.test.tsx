import { render, screen } from '@testing-library/react';
import ChildLoading from './ChildLoading';

describe('ChildLoading', () => {
    it('renders without crashing', () => {
        render(<ChildLoading />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows loading text', () => {
        render(<ChildLoading />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
