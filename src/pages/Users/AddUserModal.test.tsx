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
    beforeEach(() => {
        vi.clearAllMocks();
        render(<AddUserModal {...defaultProps} />);
    });

    it('renders the dialog when open', () => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
    });

    it('renders form fields for user information', () => {
        expect(screen.getByPlaceholderText('Shiao-Ming')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Chen')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('chung.ming.wang@gmail.com')
        ).toBeInTheDocument();
    });
});

describe('AddUserModal — cancel', () => {
    it('calls cloaseAddUserModal when Cancel is clicked', () => {
        vi.clearAllMocks();
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
