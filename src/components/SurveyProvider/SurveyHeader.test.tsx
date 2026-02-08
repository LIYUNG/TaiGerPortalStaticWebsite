import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurveyHeader from './SurveyHeader';

const renderWithRouter = (ui: React.ReactElement) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SurveyHeader', () => {
    test('renders without crashing', () => {
        renderWithRouter(<SurveyHeader title="Survey" />);
        expect(screen.getByText('Survey')).toBeInTheDocument();
    });

    test('renders subtitle when provided', () => {
        renderWithRouter(
            <SurveyHeader subtitle="Subtitle text" title="Survey" />
        );
        expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });
});
