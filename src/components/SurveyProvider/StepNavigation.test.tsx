import { render, screen, fireEvent } from '@testing-library/react';
import StepNavigation from './StepNavigation';

const defaultProps = {
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onSaveDraft: vi.fn(),
    onOpenModal: vi.fn()
};

describe('StepNavigation', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders Previous, Save and Next buttons', () => {
        render(<StepNavigation {...defaultProps} />);
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Save and continue later')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('disables Previous on step 0', () => {
        render(<StepNavigation {...defaultProps} currentStep={0} />);
        expect(screen.getByText('Previous')).toBeDisabled();
    });

    it('enables Previous when not on first step', () => {
        render(<StepNavigation {...defaultProps} currentStep={1} />);
        expect(screen.getByText('Previous')).not.toBeDisabled();
    });

    it('shows Submit feedback button on last step', () => {
        render(
            <StepNavigation
                {...defaultProps}
                isLastStep={true}
                isValid={true}
            />
        );
        expect(screen.getByText('Submit feedback')).toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('calls onNext when Next is clicked', () => {
        const onNext = vi.fn();
        render(<StepNavigation {...defaultProps} onNext={onNext} />);
        fireEvent.click(screen.getByText('Next'));
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPrevious when Previous is clicked', () => {
        const onPrevious = vi.fn();
        render(
            <StepNavigation
                {...defaultProps}
                currentStep={1}
                onPrevious={onPrevious}
            />
        );
        fireEvent.click(screen.getByText('Previous'));
        expect(onPrevious).toHaveBeenCalledTimes(1);
    });
});
