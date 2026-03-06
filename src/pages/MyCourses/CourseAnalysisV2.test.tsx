import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/api', () => ({
    analyzedFileV2Download: vi.fn(() => new Promise(() => undefined)),
    WidgetanalyzedFileV2Download: vi.fn(() => new Promise(() => undefined))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent' } })
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    Bayerische_Formel: vi.fn(() => '2.5')
}));

import CourseAnalysisV2 from './CourseAnalysisV2';

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/courses/test-user-id']}>
            <Routes>
                <Route
                    path="/courses/:user_id"
                    element={<CourseAnalysisV2 />}
                />
            </Routes>
        </MemoryRouter>
    );

describe('CourseAnalysisV2', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        renderPage();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('calls the download API on mount', async () => {
        const { analyzedFileV2Download } = await import('@/api');
        renderPage();
        expect(analyzedFileV2Download).toHaveBeenCalledWith('test-user-id');
    });
});
