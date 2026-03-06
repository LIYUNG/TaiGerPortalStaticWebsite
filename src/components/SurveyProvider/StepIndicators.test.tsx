import { render, screen } from '@testing-library/react';
import StepIndicators from './StepIndicators';

const steps = ['Step One', 'Step Two', 'Step Three'];

describe('StepIndicators', () => {
    it('renders all step labels', () => {
        render(<StepIndicators currentStep={0} steps={steps} />);
        expect(screen.getByText('Step One')).toBeInTheDocument();
        expect(screen.getByText('Step Two')).toBeInTheDocument();
        expect(screen.getByText('Step Three')).toBeInTheDocument();
    });

    it('renders a progress bar', () => {
        render(<StepIndicators currentStep={1} steps={steps} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders with single step', () => {
        render(<StepIndicators currentStep={0} steps={['Only Step']} />);
        expect(screen.getByText('Only Step')).toBeInTheDocument();
    });
});
