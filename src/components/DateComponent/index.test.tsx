import { render, screen } from '@testing-library/react';
import EventDateComponent from './index';

describe('EventDateComponent', () => {
    it('renders without crashing', async () => {
        render(<EventDateComponent eventDate={new Date('2024-01-15')} />);
        expect(await screen.findByText('Jan')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });
});
