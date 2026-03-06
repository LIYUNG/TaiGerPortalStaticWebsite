import { render, screen, fireEvent } from '@testing-library/react';
import UsersListSubpage from './UsersListSubpage';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

const defaultProps = {
    show: true,
    setModalHide: vi.fn(),
    firstname: 'Carol',
    lastname: 'White',
    selected_user_role: 'Student',
    handleChange2: vi.fn(),
    onSubmit2: vi.fn()
};

describe('UsersListSubpage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        render(<UsersListSubpage {...defaultProps} />);
    });

    it('renders the dialog when open', () => {
        // The Assign button is rendered in DialogActions
        expect(
            screen.getByRole('button', { name: /Assign/i })
        ).toBeInTheDocument();
    });

    it('shows user name in the dialog title', () => {
        // Title text is split across nodes: "Assign Carol - White as"
        const heading = screen.getByRole('heading');
        expect(heading.textContent).toContain('Carol');
        expect(heading.textContent).toContain('White');
    });
});

describe('UsersListSubpage — submit', () => {
    it('calls onSubmit2 when Assign button is clicked', () => {
        vi.clearAllMocks();
        const onSubmit2 = vi.fn();
        render(<UsersListSubpage {...defaultProps} onSubmit2={onSubmit2} />);
        fireEvent.click(screen.getByText('Assign'));
        expect(onSubmit2).toHaveBeenCalledTimes(1);
    });
});
