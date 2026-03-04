import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InstructionsSection from './InstructionsSection';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('./DescriptionBlock', () => ({
    default: () => <div>DescriptionBlock content</div>
}));

const thread = { file_type: 'ML' } as any;

describe('InstructionsSection', () => {
    it('renders Instructions label', () => {
        render(
            <InstructionsSection
                documentsthreadId="tid1"
                instructionsDialogOpen={false}
                setInstructionsDialogOpen={vi.fn()}
                template_obj={null}
                thread={thread}
            />
        );
        expect(screen.getAllByText('Instructions').length).toBeGreaterThan(0);
    });

    it('renders Read More button', () => {
        render(
            <InstructionsSection
                documentsthreadId="tid1"
                instructionsDialogOpen={false}
                setInstructionsDialogOpen={vi.fn()}
                template_obj={null}
                thread={thread}
            />
        );
        expect(screen.getByText('Read More')).toBeInTheDocument();
    });

    it('calls setInstructionsDialogOpen when Read More clicked', () => {
        const setOpen = vi.fn();
        render(
            <InstructionsSection
                documentsthreadId="tid1"
                instructionsDialogOpen={false}
                setInstructionsDialogOpen={setOpen}
                template_obj={null}
                thread={thread}
            />
        );
        fireEvent.click(screen.getByText('Read More'));
        expect(setOpen).toHaveBeenCalledWith(true);
    });

    it('renders dialog when instructionsDialogOpen is true', () => {
        render(
            <InstructionsSection
                documentsthreadId="tid1"
                instructionsDialogOpen={true}
                setInstructionsDialogOpen={vi.fn()}
                template_obj={null}
                thread={thread}
            />
        );
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});
