import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import EditableCard from './EditableCard';

const defaultProps = {
    title: 'Education',
    isEditing: false,
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    viewContent: <div data-testid="view-content">View Mode Content</div>,
    editContent: <div data-testid="edit-content">Edit Mode Content</div>
};

describe('EditableCard - view mode', () => {
    beforeEach(() => {
        render(<EditableCard {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the card title', () => {
        expect(screen.getByText('Education')).toBeTruthy();
    });

    it('renders view content in view mode', () => {
        expect(screen.getByTestId('view-content')).toBeTruthy();
    });

    it('does not render edit content in view mode', () => {
        expect(screen.queryByTestId('edit-content')).toBeNull();
    });
});

describe('EditableCard - edit mode', () => {
    beforeEach(() => {
        render(<EditableCard {...defaultProps} isEditing={true} />);
    });

    it('renders edit content in edit mode', () => {
        expect(screen.getByTestId('edit-content')).toBeTruthy();
    });

    it('renders save and cancel buttons in edit mode', () => {
        expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    });
});
