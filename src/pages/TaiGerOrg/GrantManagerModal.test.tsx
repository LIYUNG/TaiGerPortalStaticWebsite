import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import GrantManagerModal from './GrantManagerModal';

const defaultProps = {
    firstname: 'Alice',
    lastname: 'Smith',
    managerModalShow: true,
    setManagerModalHide: vi.fn(),
    onUpdatePermissions: vi.fn()
};

describe('GrantManagerModal', () => {
    beforeEach(() => {
        render(<GrantManagerModal {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the dialog title with name', () => {
        expect(screen.getByText(/Alice/)).toBeTruthy();
        expect(screen.getByText(/Smith/)).toBeTruthy();
    });

    it('renders confirm and cancel buttons', () => {
        expect(screen.getByText('Confirm')).toBeTruthy();
        expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('renders manager type select', () => {
        expect(screen.getByText('Configure Manager Type')).toBeTruthy();
    });
});
