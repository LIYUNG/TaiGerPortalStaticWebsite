import { render, screen } from '@testing-library/react';
import type { AuthContextValue } from '@/api/types';
import ApplicationLockControl from './ApplicationLockControl';
import { useAuth } from '../AuthProvider';
import { useSnackBar } from '@contexts/use-snack-bar';

vi.mock('../AuthProvider', () => ({
    useAuth: vi.fn()
}));
vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: vi.fn()
}));
vi.mock('@api/index', () => ({
    refreshApplication: vi.fn()
}));

describe('ApplicationLockControl', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);
        vi.mocked(useSnackBar).mockReturnValue({
            setMessage: vi.fn(() => {}),
            setSeverity: vi.fn(() => {}),
            setOpenSnackbar: vi.fn(() => {})
        });
    });

    test('returns null when application is missing', () => {
        const { container } = render(
            <ApplicationLockControl application={null as unknown as never} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('returns null when application has no programId', () => {
        const { container } = render(
            <ApplicationLockControl
                application={{ programId: undefined } as never}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders chip when application and programId provided', () => {
        render(
            <ApplicationLockControl
                application={
                    {
                        programId: { country: 'de', _id: 'p1' },
                        _id: 'a1'
                    } as never
                }
            />
        );
        expect(screen.getByText(/Locked|Unlocked/)).toBeInTheDocument();
    });
});
