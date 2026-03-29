import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DownloadPage from './DownloadPage';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/', CV_ML_RL_DOCS_LINK: '/docs' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div>Modal</div>
}));
vi.mock('./EditDownloadFiles', () => ({
    default: () => (
        <div data-testid="edit-download-files">EditDownloadFiles</div>
    )
}));

vi.mock('@/api', () => ({
    getTemplates: vi.fn(() =>
        Promise.resolve({
            data: { success: true, data: [] },
            status: 200
        })
    ),
    deleteTemplateFile: vi.fn(),
    uploadtemplate: vi.fn()
}));

vi.mock('@utils/contants', () => ({
    templatelist: [{ prop: 'cv', name: 'CV Template' }]
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

describe('DownloadPage', () => {
    it('initially shows loading spinner', () => {
        render(
            <MemoryRouter>
                <DownloadPage />
            </MemoryRouter>
        );
        // CircularProgress is shown while loading
        const spinner = document.querySelector('[role="progressbar"]');
        expect(spinner).toBeTruthy();
    });

    it('renders download center after loading', async () => {
        render(
            <MemoryRouter>
                <DownloadPage />
            </MemoryRouter>
        );
        const editFiles = await screen.findByTestId('edit-download-files');
        expect(editFiles).toBeInTheDocument();
    });

    it('renders breadcrumb company name after loading', async () => {
        render(
            <MemoryRouter>
                <DownloadPage />
            </MemoryRouter>
        );
        expect(await screen.findByText('TaiGer')).toBeInTheDocument();
    });
});
