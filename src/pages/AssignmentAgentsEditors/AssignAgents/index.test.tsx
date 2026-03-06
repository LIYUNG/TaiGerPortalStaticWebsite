import { render, screen } from '@testing-library/react';
import AssignAgents from './index';

vi.mock('../AssignmentWrapper', () => ({
    default: ({ role }: { role: string }) => (
        <div data-testid={`assignment-wrapper-${role}`} />
    )
}));

describe('AssignAgents', () => {
    it('renders AssignmentWrapper with role="agent"', () => {
        render(<AssignAgents />);
        expect(
            screen.getByTestId('assignment-wrapper-agent')
        ).toBeInTheDocument();
    });
});
