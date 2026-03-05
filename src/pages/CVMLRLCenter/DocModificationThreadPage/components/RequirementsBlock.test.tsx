import React from 'react';
import { render, screen } from '@testing-library/react';
import RequirementsBlock from './RequirementsBlock';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('../../../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

vi.mock('../../../Utils/util_functions', () => ({
    getRequirement: vi.fn(() => 'Special requirement text')
}));

describe('RequirementsBlock', () => {
    it('renders requirement text when program_id exists', () => {
        const thread = { program_id: { _id: 'p1' }, file_type: 'ML' } as any;
        render(<RequirementsBlock isGeneralRL={false} thread={thread} />);
        expect(
            screen.getByText('Special requirement text')
        ).toBeInTheDocument();
    });

    it('renders CV requirements when file_type is CV', () => {
        const thread = { file_type: 'CV' } as any;
        render(<RequirementsBlock isGeneralRL={false} thread={thread} />);
        expect(screen.getAllByText(/cv-requirements-1/).length).toBeGreaterThan(
            0
        );
    });

    it('renders RL requirements when isGeneralRL is true', () => {
        const thread = { file_type: 'RL' } as any;
        render(<RequirementsBlock isGeneralRL={true} thread={thread} />);
        expect(screen.getByText('rl-requirements-1')).toBeInTheDocument();
    });

    it('renders fallback "No" when no special case', () => {
        const thread = { file_type: 'Essay' } as any;
        render(<RequirementsBlock isGeneralRL={false} thread={thread} />);
        expect(screen.getByText('No')).toBeInTheDocument();
    });
});
