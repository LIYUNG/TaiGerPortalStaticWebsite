import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequirementsSection from './RequirementsSection';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('./RequirementsBlock', () => ({
    default: () => <div>RequirementsBlock content</div>
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: { SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}` }
}));

const thread = { file_type: 'ML' } as any;
const user = { role: 'Agent' } as any;

describe('RequirementsSection', () => {
    const render_ = (extra = {}) =>
        render(
            <MemoryRouter>
                <RequirementsSection
                    isGeneralRL={false}
                    requirementsDialogOpen={false}
                    setRequirementsDialogOpen={vi.fn()}
                    template_obj={null}
                    thread={thread}
                    user={user}
                    {...extra}
                />
            </MemoryRouter>
        );

    it('renders Requirements label', () => {
        render_();
        expect(screen.getAllByText('Requirements').length).toBeGreaterThan(0);
    });

    it('renders Read More button', () => {
        render_();
        expect(screen.getByText('Read More')).toBeInTheDocument();
    });

    it('calls setRequirementsDialogOpen when Read More clicked', () => {
        const setOpen = vi.fn();
        render_({ setRequirementsDialogOpen: setOpen });
        fireEvent.click(screen.getByText('Read More'));
        expect(setOpen).toHaveBeenCalledWith(true);
    });

    it('renders dialog when requirementsDialogOpen is true', () => {
        render_({ requirementsDialogOpen: true });
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});
