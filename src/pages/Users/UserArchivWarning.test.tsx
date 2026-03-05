import { render, screen, fireEvent } from '@testing-library/react';
import UserArchivWarning from './UserArchivWarning';

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

const defaultProps = {
    archivUserWarning: true,
    setModalArchivHide: vi.fn(),
    firstname: 'Alice',
    lastname: 'Smith',
    selected_user_id: 'u1',
    updateUserArchivStatus: vi.fn()
};

describe('UserArchivWarning', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the dialog when open', () => {
        render(<UserArchivWarning {...defaultProps} />);
        expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('shows the user full name in the content', () => {
        render(<UserArchivWarning {...defaultProps} />);
        // The name is split across text nodes inside <b>; use a substring matcher on the container
        expect(
            screen.getByText(
                (_, el) =>
                    el?.tagName === 'B' && el.textContent === 'Alice - Smith'
            )
        ).toBeInTheDocument();
    });

    it('calls updateUserArchivStatus with correct args when Yes is clicked', () => {
        const updateUserArchivStatus = vi.fn();
        render(
            <UserArchivWarning
                {...defaultProps}
                archiv={false}
                updateUserArchivStatus={updateUserArchivStatus}
            />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(updateUserArchivStatus).toHaveBeenCalledWith({
            user_id: 'u1',
            isArchived: true
        });
    });
});
