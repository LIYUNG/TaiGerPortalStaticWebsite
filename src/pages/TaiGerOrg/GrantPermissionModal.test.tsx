import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import GrantPermissionModal from './GrantPermissionModal';

const defaultProps = {
    firstname: 'Alice',
    lastname: 'Smith',
    modalShow: true,
    setModalHide: vi.fn(),
    onUpdatePermissions: vi.fn(),
    user_permissions: []
};

describe('GrantPermissionModal', () => {
    beforeEach(() => {
        render(<GrantPermissionModal {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the dialog title with name', () => {
        expect(screen.getByText(/Alice/)).toBeTruthy();
        expect(screen.getByText(/Smith/)).toBeTruthy();
    });

    it('renders update and cancel buttons', () => {
        expect(screen.getByText('Update')).toBeTruthy();
        expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('renders permissions table headers', () => {
        expect(screen.getByText('Permission')).toBeTruthy();
        expect(screen.getByText('Check')).toBeTruthy();
    });
});
