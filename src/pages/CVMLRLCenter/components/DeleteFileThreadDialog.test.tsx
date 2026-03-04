import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteFileThreadDialog from './DeleteFileThreadDialog';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('@utils/contants', () => ({
    spinner_style2: {}
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    docName: 'CV_Alice.pdf',
    deleteField: '',
    isLoaded: true,
    onChangeDeleteField: vi.fn(),
    onConfirm: vi.fn()
};

describe('DeleteFileThreadDialog', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the dialog when open', () => {
        render(<DeleteFileThreadDialog {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('shows docName in the content', () => {
        render(<DeleteFileThreadDialog {...defaultProps} />);
        expect(screen.getByText('CV_Alice.pdf')).toBeInTheDocument();
    });

    it('disables confirm button when deleteField is not "delete"', () => {
        render(<DeleteFileThreadDialog {...defaultProps} deleteField="del" />);
        expect(screen.getByText('Yes')).toBeDisabled();
    });

    it('enables confirm button when deleteField is "delete"', () => {
        render(
            <DeleteFileThreadDialog {...defaultProps} deleteField="delete" />
        );
        expect(screen.getByText('Yes')).not.toBeDisabled();
    });

    it('calls onClose when No is clicked', () => {
        const onClose = vi.fn();
        render(<DeleteFileThreadDialog {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('No'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Yes is clicked and deleteField is "delete"', () => {
        const onConfirm = vi.fn();
        render(
            <DeleteFileThreadDialog
                {...defaultProps}
                deleteField="delete"
                onConfirm={onConfirm}
            />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
