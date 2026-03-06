import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DistributionAnalysisSection from './DistributionAnalysisSection';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => vi.fn() };
});

const t = (key: string) => key;

const defaultProps = {
    byCountry: [
        { country: 'Germany', count: 500 },
        { country: 'USA', count: 300 }
    ],
    byDegree: [
        { degree: 'Master', count: 700 },
        { degree: 'Bachelor', count: 200 }
    ],
    byLanguage: [
        { language: 'English', count: 800 },
        { language: 'German', count: 400 }
    ],
    totalPrograms: 1000,
    t
};

describe('DistributionAnalysisSection', () => {
    let container: HTMLElement;

    beforeEach(() => {
        ({ container } = render(
            <MemoryRouter>
                <DistributionAnalysisSection {...defaultProps} />
            </MemoryRouter>
        ));
    });

    it('renders Distribution Analysis heading', () => {
        expect(screen.getByText('Distribution Analysis')).toBeInTheDocument();
    });

    it('renders Programs by Country card', () => {
        expect(screen.getByText('Programs by Country')).toBeInTheDocument();
    });

    it('renders Programs by Degree card', () => {
        expect(screen.getByText('Programs by Degree')).toBeInTheDocument();
    });

    it('renders Programs by Language card', () => {
        expect(screen.getByText('Programs by Language')).toBeInTheDocument();
    });

    it('renders country items in the list', () => {
        expect(screen.getByText('Germany')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('renders LinearProgress bars for country items', () => {
        const progressBars = container.querySelectorAll('[role="progressbar"]');
        expect(progressBars.length).toBeGreaterThan(0);
    });

    it('renders degree items in the list', () => {
        expect(screen.getByText('Master')).toBeInTheDocument();
        expect(screen.getByText('Bachelor')).toBeInTheDocument();
    });

    it('renders language items in the list', () => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('German')).toBeInTheDocument();
    });
});
