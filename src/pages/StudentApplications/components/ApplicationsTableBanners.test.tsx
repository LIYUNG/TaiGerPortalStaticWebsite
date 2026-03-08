import { render, screen } from '@testing-library/react';
import ApplicationsTableBanners from './ApplicationsTableBanners';

vi.mock('@store/constant', () => ({
    default: { BASE_DOCUMENTS_LINK: '/docs' }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

describe('ApplicationsTableBanners', () => {
    beforeEach(() => {
        render(<ApplicationsTableBanners />);
    });

    it('renders three banners', () => {
        expect(screen.getByTestId('banner-primary')).toBeInTheDocument();
        expect(screen.getByTestId('banner-secondary')).toBeInTheDocument();
        expect(screen.getByTestId('banner-danger')).toBeInTheDocument();
    });

    it('renders primary info banner with company name', () => {
        expect(screen.getByTestId('banner-primary').textContent).toContain(
            'TaiGer'
        );
    });

    it('renders secondary warning banner', () => {
        expect(screen.getByTestId('banner-secondary').textContent).toContain(
            'Decided'
        );
    });

    it('renders danger warning banner', () => {
        expect(screen.getByTestId('banner-danger').textContent).toContain(
            'Submitted'
        );
    });
});
