import { render, screen } from '@testing-library/react';
import AssignEditors from './index';

vi.mock('../AssignmentWrapper', () => ({
    default: ({ role }: { role: string }) => (
        <div data-testid={`assignment-wrapper-${role}`} />
    )
}));

describe('AssignEditors', () => {
    it('renders AssignmentWrapper with role="editor"', () => {
        render(<AssignEditors />);
        expect(
            screen.getByTestId('assignment-wrapper-editor')
        ).toBeInTheDocument();
    });
});
