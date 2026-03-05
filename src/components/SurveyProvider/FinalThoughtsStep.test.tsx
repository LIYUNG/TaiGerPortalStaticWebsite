import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import FinalThoughtsStep from './FinalThoughtsStep';

describe('FinalThoughtsStep', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        render(
            <FinalThoughtsStep
                onChange={onChange}
                values={{ interviewFeedback: '' }}
            />
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText(/Final Thoughts/i)).toBeDefined();
    });

    it('renders the textarea with placeholder', () => {
        expect(
            screen.getByPlaceholderText(
                /Please share any additional feedback about the interview training/
            )
        ).toBeDefined();
    });

    it('renders subtitle text', () => {
        expect(screen.getByText(/additional feedback or comments/)).toBeDefined();
    });
});

describe('FinalThoughtsStep with initial value', () => {
    it('renders with a pre-filled value', () => {
        render(
            <FinalThoughtsStep
                onChange={vi.fn()}
                values={{ interviewFeedback: 'Great training!' }}
            />
        );
        const textarea = screen.getByDisplayValue('Great training!');
        expect(textarea).toBeDefined();
    });

    it('renders disabled state', () => {
        render(
            <FinalThoughtsStep
                disabled={true}
                onChange={vi.fn()}
                values={{ interviewFeedback: '' }}
            />
        );
        expect(screen.getByText(/Final Thoughts/i)).toBeDefined();
    });
});
