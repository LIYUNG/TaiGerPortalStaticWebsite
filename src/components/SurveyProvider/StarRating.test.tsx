import React from 'react';
import { render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
    it('renders without crashing', () => {
        render(<StarRating onRatingChange={jest.fn()} />);
        expect(screen.getAllByRole('button').length).toBe(5);
    });

    it('calls onRatingChange when a star is clicked', () => {
        const onRatingChange = jest.fn();
        render(<StarRating onRatingChange={onRatingChange} />);
        screen.getAllByRole('button')[2].click();
        expect(onRatingChange).toHaveBeenCalledWith(3);
    });

    it('shows current rating when rating prop is provided', () => {
        render(<StarRating onRatingChange={jest.fn()} rating={4} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBe(5);
    });
});
