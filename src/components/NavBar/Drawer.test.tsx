import { render, screen } from '@testing-library/react';
import { CustomDrawer } from './Drawer';
import { useAuth } from '@components/AuthProvider/index';
import type { AuthContextValue } from '@/api/types';
import { BrowserRouter } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';

vi.mock('@components/AuthProvider/index', () => ({
    useAuth: vi.fn()
}));

describe('CustomDrawer Component', () => {
    const mockProps = {
        open: true,
        ismobile: false,
        handleDrawerClose: vi.fn(() => {}),
        theme: { direction: 'ltr' } as unknown as Theme
    };

    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: 'Student',
                _id: '639baebf8b84944b872cf648',
                firstname: 'test',
                lastname: 'student'
            },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);
    });

    test('renders the correct menu items For Student', () => {
        render(
            <BrowserRouter>
                <CustomDrawer {...mockProps} />
            </BrowserRouter>
        );
        // Add assertions to check menu items
        expect(screen.getByTestId('navbar_drawer_component')).toHaveTextContent(
            'Dashboard'
        );
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('Program List');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('User List');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('My Students');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('All Students');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('Tools');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('Public Docs');
        expect(
            screen.getByTestId('navbar_drawer_component')
        ).not.toHaveTextContent('Internal Docs');
    });
});
