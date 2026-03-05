import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramCorrectnessReminderDialog from './ProgramCorrectnessReminderDialog';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

const defaultProps = {
    open: true,
    onClose: vi.fn()
};

describe('ProgramCorrectnessReminderDialog', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders when open', () => {
        render(<ProgramCorrectnessReminderDialog {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('shows company name in content', () => {
        render(<ProgramCorrectnessReminderDialog {...defaultProps} />);
        expect(screen.getAllByText(/TaiGer/).length).toBeGreaterThan(0);
    });

    it('calls onClose when Accept is clicked', () => {
        const onClose = vi.fn();
        render(
            <ProgramCorrectnessReminderDialog
                {...defaultProps}
                onClose={onClose}
            />
        );
        fireEvent.click(screen.getByText('Accept'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when closed', () => {
        render(
            <ProgramCorrectnessReminderDialog {...defaultProps} open={false} />
        );
        expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    });
});
