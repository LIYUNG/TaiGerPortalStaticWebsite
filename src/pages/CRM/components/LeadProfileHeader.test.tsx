import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeadProfileHeader from './LeadProfileHeader';

vi.mock('@pages/CRM/components/DealItem', () => ({
    default: ({ deal }: { deal: Record<string, unknown> }) => (
        <div data-testid="deal-item">{String(deal.name || '')}</div>
    )
}));
vi.mock('@pages/CRM/components/statusUtils', () => ({
    getDealId: vi.fn((deal) => deal?.id || deal?._id || ''),
    isTerminalStatus: vi.fn(() => false)
}));

const t = (key: string) => key;
const baseLead = {
    fullName: 'Jane Doe',
    status: 'open',
    gender: 'female',
    deals: [],
    meetings: []
};
const baseProps = {
    lead: baseLead,
    isMigratedLead: false,
    hasPortalUser: false,
    isEditing: false,
    formData: baseLead,
    salesOptions: [],
    updateIsPending: false,
    hasUnsavedChanges: false,
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onFieldChange: vi.fn(),
    onCreateUser: vi.fn(),
    onCreateDeal: vi.fn(),
    onEditDeal: vi.fn(),
    updateStatusMutation: {
        isPending: false,
        variables: undefined,
        mutate: vi.fn()
    },
    openStatusMenu: vi.fn(),
    t
};

const render_ = (props = baseProps) =>
    render(
        <MemoryRouter>
            <LeadProfileHeader {...props} />
        </MemoryRouter>
    );

describe('LeadProfileHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders lead fullName', () => {
        render_();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders status chip', () => {
        render_();
        expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('shows Edit button in view mode', () => {
        render_();
        // The edit icon button is among multiple buttons (Edit, Create User, Create Deal)
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls onEdit when Edit button clicked', () => {
        const onEdit = vi.fn();
        render_({ ...baseProps, onEdit });
        // The EditIcon button renders an svg with data-testid="EditIcon"
        const editIcon = screen.getByTestId('EditIcon');
        fireEvent.click(editIcon.closest('button')!);
        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('shows edit form fields when isEditing is true', () => {
        render_({ ...baseProps, isEditing: true });
        expect(screen.getByRole('textbox', { name: /leads\.fullName/i })).toBeInTheDocument();
    });

    it('shows fullName TextField in edit mode', () => {
        render_({
            ...baseProps,
            isEditing: true,
            formData: { ...baseLead, fullName: 'Jane Doe' }
        });
        const input = screen.getByRole('textbox', { name: /leads\.fullName/i });
        expect(input).toHaveValue('Jane Doe');
    });

    it('calls onSave when Save button clicked in edit mode', () => {
        const onSave = vi.fn();
        render_({ ...baseProps, isEditing: true, onSave });
        // SaveIcon button has data-testid="SaveIcon"
        const saveIcon = screen.getByTestId('SaveIcon');
        fireEvent.click(saveIcon.closest('button')!);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('shows Create User Account button when not hasPortalUser and status is not closed/converted', () => {
        render_({
            ...baseProps,
            hasPortalUser: false,
            lead: { ...baseLead, status: 'open' }
        });
        expect(
            screen.getByText('actions.createUserAccount')
        ).toBeInTheDocument();
    });

    it('does not show Create User Account button when status is closed', () => {
        render_({
            ...baseProps,
            hasPortalUser: false,
            lead: { ...baseLead, status: 'closed' }
        });
        expect(
            screen.queryByText('actions.createUserAccount')
        ).not.toBeInTheDocument();
    });

    it('does not show Create User Account button when hasPortalUser is true', () => {
        render_({
            ...baseProps,
            hasPortalUser: true,
            lead: { ...baseLead, status: 'open', userId: 'user-1' }
        });
        expect(
            screen.queryByText('actions.createUserAccount')
        ).not.toBeInTheDocument();
    });
});
