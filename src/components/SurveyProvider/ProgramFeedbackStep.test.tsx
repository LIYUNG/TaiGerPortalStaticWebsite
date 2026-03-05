import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ProgramFeedbackStep from './ProgramFeedbackStep';

describe('ProgramFeedbackStep', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        render(
            <ProgramFeedbackStep
                onChange={onChange}
                values={{ interviewQuestions: '' }}
            />
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText(/Program Feedback/i)).toBeDefined();
    });

    it('renders the textarea with placeholder', () => {
        expect(
            screen.getByPlaceholderText(
                /Please write down the questions that were asked/
            )
        ).toBeDefined();
    });

    it('renders required asterisk', () => {
        expect(screen.getByText(/Which questions were asked/)).toBeDefined();
    });
});

describe('ProgramFeedbackStep with initial value', () => {
    it('renders with a pre-filled value', () => {
        render(
            <ProgramFeedbackStep
                onChange={vi.fn()}
                values={{ interviewQuestions: 'Tell me about yourself' }}
            />
        );
        const textarea = screen.getByDisplayValue('Tell me about yourself');
        expect(textarea).toBeDefined();
    });

    it('renders disabled state', () => {
        render(
            <ProgramFeedbackStep
                disabled={true}
                onChange={vi.fn()}
                values={{ interviewQuestions: '' }}
            />
        );
        expect(screen.getByText(/Program Feedback/i)).toBeDefined();
    });
});
