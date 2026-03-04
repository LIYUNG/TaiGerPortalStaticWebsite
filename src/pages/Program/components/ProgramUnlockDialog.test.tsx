import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramUnlockDialog from './ProgramUnlockDialog';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
            <a href={to}>{children}</a>
        )
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@store/constant', () => ({
    default: {
        PROGRAM_EDIT: (id: string) => `/program/${id}/edit`
    }
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    isRefreshing: false,
    programId: 'prog123',
    onConfirmUnlock: vi.fn()
};

describe('ProgramUnlockDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dialog title when open', () => {
        render(<ProgramUnlockDialog {...defaultProps} />);
        expect(
            screen.getByText('Unlock Program Manually')
        ).toBeInTheDocument();
    });

    it('renders warning content', () => {
        render(<ProgramUnlockDialog {...defaultProps} />);
        expect(
            screen.getByText('Important: Verify Program Information')
        ).toBeInTheDocument();
    });

    it('renders Cancel, Edit, and Confirm Unlock buttons', () => {
        render(<ProgramUnlockDialog {...defaultProps} />);
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Confirm Unlock')).toBeInTheDocument();
    });

    it('calls onClose when Cancel is clicked', () => {
        const onClose = vi.fn();
        render(<ProgramUnlockDialog {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirmUnlock and onClose when Confirm Unlock is clicked', () => {
        const onClose = vi.fn();
        const onConfirmUnlock = vi.fn();
        render(
            <ProgramUnlockDialog
                {...defaultProps}
                onClose={onClose}
                onConfirmUnlock={onConfirmUnlock}
            />
        );
        fireEvent.click(screen.getByText('Confirm Unlock'));
        expect(onConfirmUnlock).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows Unlocking... when isRefreshing', () => {
        render(<ProgramUnlockDialog {...defaultProps} isRefreshing={true} />);
        expect(screen.getByText('Unlocking...')).toBeInTheDocument();
    });

    it('disables Confirm Unlock button when isRefreshing', () => {
        render(<ProgramUnlockDialog {...defaultProps} isRefreshing={true} />);
        expect(screen.getByText('Unlocking...')).toBeDisabled();
    });
});
