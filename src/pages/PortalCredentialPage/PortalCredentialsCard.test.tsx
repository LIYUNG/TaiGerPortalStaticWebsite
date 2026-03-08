import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PortalCredentialsCard from './PortalCredentialsCard';

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/', CV_ML_RL_DOCS_LINK: '/docs' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({ default: () => <div>Modal</div> }));
vi.mock('@components/Loading/Loading', () => ({ default: () => <div>Loading</div> }));
vi.mock('../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));
vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@/api', () => ({
    getPortalCredentials: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: { applications: [], student: { firstname: 'Alice', lastname: 'Wang' } }
            },
            status: 200
        })
    ),
    postPortalCredentials: vi.fn()
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('PortalCredentialsCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <PortalCredentialsCard student_id="student1" showTitle={false} />
            </MemoryRouter>
        );
    });

    it('renders loading state initially', () => {
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });
});

describe('PortalCredentialsCard - loaded state', () => {
    it('renders card content after loading', async () => {
        render(
            <MemoryRouter>
                <PortalCredentialsCard student_id="student1" showTitle={false} />
            </MemoryRouter>
        );
        const updateBtn = await screen.findByText(/update/i);
        expect(updateBtn).toBeInTheDocument();
    });
});
