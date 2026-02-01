import { render, screen } from '@testing-library/react';
import ModalNew from './index';

describe('ModalNew', () => {
    it('renders without crashing when open', () => {
        render(
            <ModalNew onClose={jest.fn()} open={true}>
                <div>Modal content</div>
            </ModalNew>
        );
        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render children when closed', () => {
        render(
            <ModalNew onClose={jest.fn()} open={false}>
                <div>Modal content</div>
            </ModalNew>
        );
        expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });
});
