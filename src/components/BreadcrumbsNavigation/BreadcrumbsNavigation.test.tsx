import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BreadcrumbsNavigation } from './BreadcrumbsNavigation';

const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

describe('BreadcrumbsNavigation', () => {
    it('renders without crashing', () => {
        renderWithRouter(
            <BreadcrumbsNavigation items={[{ label: 'Home', link: '/' }]} />
        );
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders last item as text only', () => {
        renderWithRouter(
            <BreadcrumbsNavigation
                items={[
                    { label: 'Home', link: '/' },
                    { label: 'Current', link: '/current' }
                ]}
            />
        );
        expect(screen.getByText('Current')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
            'href',
            '/'
        );
    });
});
