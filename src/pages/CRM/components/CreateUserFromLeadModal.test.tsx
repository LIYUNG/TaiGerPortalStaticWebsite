import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/api', () => ({
    addUser: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@tanstack/react-form', () => ({
    useForm: vi.fn(() => ({
        Field: ({
            children
        }: {
            children: (field: unknown) => React.ReactNode;
        }) =>
            children({
                name: 'field',
                state: { value: '', meta: { errors: [] } },
                handleChange: vi.fn(),
                handleBlur: vi.fn()
            }),
        Subscribe: ({
            children
        }: {
            children: (...args: unknown[]) => React.ReactNode;
        }) => children('', '', ''),
        handleSubmit: vi.fn(),
        reset: vi.fn()
    }))
}));

import CreateUserFromLeadModal from './CreateUserFromLeadModal';

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    lead: {
        fullName: 'Alice Smith',
        email: 'alice@example.com',
        bachelorGPA: '3.5/4.0'
    },
    onSuccess: vi.fn()
};

describe('CreateUserFromLeadModal', () => {
    beforeEach(() => {
        render(<CreateUserFromLeadModal {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders dialog title', () => {
        expect(
            screen.getByText('actions.createUserAccountFromLead')
        ).toBeTruthy();
    });

    it('renders cancel button', () => {
        expect(screen.getByText('actions.cancel')).toBeTruthy();
    });

    it('renders submit button', () => {
        expect(screen.getByText('actions.createUserAccount')).toBeTruthy();
    });
});
