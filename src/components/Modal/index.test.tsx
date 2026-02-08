import { render, screen } from '@testing-library/react';
import ModalNew from './index';

describe('ModalNew', () => {
    test('renders without crashing when open', () => {
        const onClose = vi.fn(() => {});
        render(
            <ModalNew onClose={onClose} open={true}>
                <div>Modal content</div>
            </ModalNew>
        );
        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render children when closed', () => {
        const onClose = vi.fn(() => {});
        render(
            <ModalNew onClose={onClose} open={false}>
                <div>Modal content</div>
            </ModalNew>
        );
        expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });
});
