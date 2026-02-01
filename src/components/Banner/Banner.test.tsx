import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Banner from './Banner';

const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Banner', () => {
    it('renders without crashing', () => {
        renderWithRouter(<Banner text="Test message" />);
        expect(screen.getByText(/Test message/)).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        renderWithRouter(
            <Banner text="Message" title="warning" />
        );
        expect(screen.getByText(/Warning/)).toBeInTheDocument();
    });

    it('renders link when link_name and path provided', () => {
        renderWithRouter(
            <Banner
                link_name="Go here"
                path="/some-path"
                text="Message"
            />
        );
        expect(screen.getByRole('link', { name: /Go here/ })).toHaveAttribute(
            'href',
            '/some-path'
        );
    });
});
