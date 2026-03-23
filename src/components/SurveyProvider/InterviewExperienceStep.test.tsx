import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./StarRating', () => ({
    default: ({ rating, onRatingChange }: any) => (
        <div
            data-testid="star-rating"
            data-rating={rating}
            onClick={() => onRatingChange && onRatingChange(5)}
        >
            StarRating
        </div>
    )
}));

import InterviewExperienceStep from './InterviewExperienceStep';

describe('InterviewExperienceStep', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        render(
            <InterviewExperienceStep
                onChange={onChange}
                values={{
                    interviewRating: '',
                    informationClarity: '',
                    trainerFriendliness: ''
                }}
            />
        );
    });

    it('renders without crashing', () => {
        expect(
            screen.getByRole('heading', { name: /Interview Experience/i })
        ).toBeInTheDocument();
    });

    it('renders three star rating components', () => {
        const ratings = screen.getAllByTestId('star-rating');
        expect(ratings.length).toBe(3);
    });

    it('renders description text', () => {
        expect(
            screen.getByText(/rate your interview experience/)
        ).toBeDefined();
    });
});

describe('InterviewExperienceStep with values', () => {
    it('renders with pre-filled values', () => {
        render(
            <InterviewExperienceStep
                onChange={vi.fn()}
                values={{
                    interviewRating: '4',
                    informationClarity: '5',
                    trainerFriendliness: '3'
                }}
            />
        );
        const ratings = screen.getAllByTestId('star-rating');
        expect(ratings[0].getAttribute('data-rating')).toBe('4');
    });

    it('renders disabled state', () => {
        render(
            <InterviewExperienceStep
                disabled={true}
                onChange={vi.fn()}
                values={{}}
            />
        );
        expect(
            screen.getByRole('heading', { name: /Interview Experience/i })
        ).toBeInTheDocument();
    });
});
