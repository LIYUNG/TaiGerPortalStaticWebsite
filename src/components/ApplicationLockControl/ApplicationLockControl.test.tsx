import { render, screen } from '@testing-library/react';
import ApplicationLockControl from './ApplicationLockControl';
import { useAuth } from '../AuthProvider';
import { useSnackBar } from '../../contexts/use-snack-bar';

jest.mock('../AuthProvider', () => ({
    useAuth: jest.fn()
}));
jest.mock('../../contexts/use-snack-bar', () => ({
    useSnackBar: jest.fn()
}));
jest.mock('../../api/index', () => ({
    refreshApplication: jest.fn()
}));

describe('ApplicationLockControl', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ user: null });
        (useSnackBar as jest.Mock).mockReturnValue({
            setMessage: jest.fn(),
            setSeverity: jest.fn(),
            setOpenSnackbar: jest.fn()
        });
    });

    it('returns null when application is missing', () => {
        const { container } = render(
            <ApplicationLockControl application={null as unknown as never} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('returns null when application has no programId', () => {
        const { container } = render(
            <ApplicationLockControl
                application={{ programId: undefined } as never}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders chip when application and programId provided', () => {
        render(
            <ApplicationLockControl
                application={{
                    programId: { country: 'de', _id: 'p1' },
                    _id: 'a1'
                } as never}
            />
        );
        expect(screen.getByText(/Locked|Unlocked/)).toBeInTheDocument();
    });
});
