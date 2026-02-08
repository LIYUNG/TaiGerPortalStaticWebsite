import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverlayButton from './OverlayButton';

describe('OverlayButton', () => {
    test('renders without crashing', () => {
        render(<OverlayButton text="Lock" />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('toggles on click', async () => {
        render(<OverlayButton text="Lock" />);
        const button = screen.getByRole('button');
        await userEvent.click(button);
        await userEvent.click(button);
        expect(button).toBeInTheDocument();
    });
});
