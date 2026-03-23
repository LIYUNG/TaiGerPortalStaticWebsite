import { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramUnlockDialog from './ProgramUnlockDialog';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    const React = require('react');
    return {
        ...actual,
        Link: React.forwardRef(function LinkMock(
            props: {
                children?: ReactNode;
                to?: string;
                [key: string]: unknown;
            },
            ref: React.Ref<HTMLAnchorElement>
        ) {
            const {
                children,
                to,
                focusRipple,
                focusVisibleClassName,
                centerRipple,
                disableRipple,
                ...rest
            } = props;
            return (
                <a ref={ref} href={to ?? '#'} {...rest}>
                    {children}
                </a>
            );
        })
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
        render(<ProgramUnlockDialog {...defaultProps} />);
    });

    it('renders dialog title when open', () => {
        expect(screen.getByText('Unlock Program Manually')).toBeInTheDocument();
    });

    it('renders warning content', () => {
        expect(
            screen.getByText('Important: Verify Program Information')
        ).toBeInTheDocument();
    });

    it('renders Cancel, Edit, and Confirm Unlock buttons', () => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Confirm Unlock')).toBeInTheDocument();
    });
});

describe('ProgramUnlockDialog – Cancel button', () => {
    it('calls onClose when Cancel is clicked', () => {
        const onClose = vi.fn();
        render(<ProgramUnlockDialog {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

describe('ProgramUnlockDialog – Confirm Unlock button', () => {
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
});

describe('ProgramUnlockDialog – isRefreshing=true', () => {
    beforeEach(() => {
        render(<ProgramUnlockDialog {...defaultProps} isRefreshing={true} />);
    });

    it('shows Unlocking... when isRefreshing', () => {
        expect(screen.getByText('Unlocking...')).toBeInTheDocument();
    });

    it('disables Confirm Unlock button when isRefreshing', () => {
        expect(screen.getByText('Unlocking...')).toBeDisabled();
    });
});
