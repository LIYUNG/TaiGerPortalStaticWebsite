import { render, screen, fireEvent } from '@testing-library/react';
import AddUserModal from './AddUserModal';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

vi.mock('@taiger-common/core', () => ({
    Role: {
        Student: 'Student',
        Agent: 'Agent',
        Editor: 'Editor',
        External: 'External'
    }
}));

const defaultProps = {
    addUserModalState: true,
    cloaseAddUserModal: vi.fn(),
    AddUserSubmit: vi.fn()
};

describe('AddUserModal', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the dialog when open', () => {
        render(<AddUserModal {...defaultProps} />);
        expect(screen.getByText('Add New User')).toBeInTheDocument();
    });

    it('renders form fields for user information', () => {
        render(<AddUserModal {...defaultProps} />);
        expect(screen.getByPlaceholderText('Shiao-Ming')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Chen')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('chung.ming.wang@gmail.com')
        ).toBeInTheDocument();
    });

    it('calls cloaseAddUserModal when Cancel is clicked', () => {
        const cloaseAddUserModal = vi.fn();
        render(
            <AddUserModal
                {...defaultProps}
                cloaseAddUserModal={cloaseAddUserModal}
            />
        );
        fireEvent.click(screen.getByText('Cancel'));
        expect(cloaseAddUserModal).toHaveBeenCalledTimes(1);
    });
});
