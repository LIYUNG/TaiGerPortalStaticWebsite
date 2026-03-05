import { render, screen, fireEvent } from '@testing-library/react';
import UserDeleteWarning from './UserDeleteWarning';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

const defaultProps = {
    deleteUserWarning: true,
    setModalHideDDelete: vi.fn(),
    firstname: 'Bob',
    lastname: 'Jones',
    delete_field: '',
    onChangeDeleteField: vi.fn(),
    selected_user_id: 'u2',
    handleDeleteUser: vi.fn()
};

describe('UserDeleteWarning', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the dialog when open', () => {
        render(<UserDeleteWarning {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('shows the user full name in the content', () => {
        render(<UserDeleteWarning {...defaultProps} />);
        // The name is split across text nodes inside <b>; match the <b> element's full text
        expect(
            screen.getByText(
                (_, el) =>
                    el?.tagName === 'B' && el.textContent === 'Bob - Jones'
            )
        ).toBeInTheDocument();
    });

    it('calls handleDeleteUser when delete_field is "delete" and Yes is clicked', () => {
        const handleDeleteUser = vi.fn();
        render(
            <UserDeleteWarning
                {...defaultProps}
                delete_field="delete"
                handleDeleteUser={handleDeleteUser}
            />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(handleDeleteUser).toHaveBeenCalledWith('u2');
    });
});
