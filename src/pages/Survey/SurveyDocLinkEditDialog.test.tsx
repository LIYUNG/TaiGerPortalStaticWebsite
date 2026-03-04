import { render, screen, fireEvent } from '@testing-library/react';
import SurveyDocLinkEditDialog from './components/SurveyDocLinkEditDialog';

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    surveyLink: 'https://example.com/doc',
    onChangeURL: vi.fn(),
    docName: 'Grading System',
    saving: false,
    t: (key: string) => key
};

describe('SurveyDocLinkEditDialog', () => {
    it('renders when open', () => {
        render(<SurveyDocLinkEditDialog {...defaultProps} />);
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Save' })
        ).toBeInTheDocument();
    });

    it('shows survey link in text field', () => {
        render(<SurveyDocLinkEditDialog {...defaultProps} />);
        expect(
            screen.getByDisplayValue('https://example.com/doc')
        ).toBeInTheDocument();
    });

    it('calls onSave when Save is clicked', () => {
        const onSave = vi.fn();
        render(<SurveyDocLinkEditDialog {...defaultProps} onSave={onSave} />);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('disables Save button when saving is true', () => {
        render(<SurveyDocLinkEditDialog {...defaultProps} saving={true} />);
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
});
