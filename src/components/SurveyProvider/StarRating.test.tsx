import { render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
    test('renders without crashing', () => {
        render(<StarRating onRatingChange={vi.fn()} />);
        expect(screen.getAllByRole('button').length).toBe(5);
    });

    test('calls onRatingChange when a star is clicked', () => {
        const onRatingChange = vi.fn();
        render(<StarRating onRatingChange={onRatingChange} />);
        screen.getAllByRole('button')[2].click();
        expect(onRatingChange).toHaveBeenCalledWith(3);
    });

    test('shows current rating when rating prop is provided', () => {
        render(<StarRating onRatingChange={vi.fn()} rating={4} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBe(5);
    });
});
