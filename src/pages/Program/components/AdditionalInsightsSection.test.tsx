import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdditionalInsightsSection from './AdditionalInsightsSection';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => vi.fn() };
});

const t = (key: string) => key;

describe('AdditionalInsightsSection', () => {
    it('does not render when all arrays are empty/undefined', () => {
        const { container } = render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[]}
                    bySchoolType={[]}
                    topContributors={[]}
                    totalPrograms={1000}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders Top Program Subjects when bySubject is non-empty', () => {
        render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[
                        { subject: 'Computer Science', count: 200 },
                        { subject: 'Engineering', count: 150 }
                    ]}
                    bySchoolType={[]}
                    topContributors={[]}
                    totalPrograms={1000}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Top Program Subjects')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('renders School Type Distribution when bySchoolType is non-empty', () => {
        render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[]}
                    bySchoolType={[
                        {
                            schoolType: 'University',
                            count: 50,
                            isPrivateSchool: false,
                            isPartnerSchool: true
                        }
                    ]}
                    topContributors={[]}
                    totalPrograms={1000}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText('School Type Distribution')
        ).toBeInTheDocument();
        expect(screen.getByText('University')).toBeInTheDocument();
    });

    it('renders subject items with progress bars', () => {
        const { container } = render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[
                        { subject: 'Physics', count: 100 },
                        { subject: 'Chemistry', count: 80 }
                    ]}
                    totalPrograms={1000}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Physics')).toBeInTheDocument();
        const progressBars = container.querySelectorAll('[role="progressbar"]');
        expect(progressBars.length).toBeGreaterThan(0);
    });

    it('renders Additional Insights heading when at least one section has data', () => {
        render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[{ subject: 'Math', count: 50 }]}
                    totalPrograms={500}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Additional Insights')).toBeInTheDocument();
    });

    it('renders Top Contributors when topContributors is non-empty', () => {
        render(
            <MemoryRouter>
                <AdditionalInsightsSection
                    bySubject={[]}
                    bySchoolType={[]}
                    topContributors={[
                        {
                            contributor: 'Alice',
                            lastUpdate: '2024-01-01',
                            updateCount: 10
                        }
                    ]}
                    totalPrograms={1000}
                    t={t}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Top Contributors')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });
});
