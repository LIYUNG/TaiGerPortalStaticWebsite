import { render, screen } from '@testing-library/react';
import ChildLoading from './ChildLoading';

describe('ChildLoading', () => {
    beforeEach(() => {
        render(<ChildLoading />);
    });

    it('renders without crashing', () => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows loading text', () => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
