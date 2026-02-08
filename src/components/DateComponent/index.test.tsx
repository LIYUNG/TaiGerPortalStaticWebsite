import React from 'react';
import { render, screen } from '@testing-library/react';
import EventDateComponent from './index';

describe('EventDateComponent', () => {
    it('renders without crashing', () => {
        render(<EventDateComponent eventDate={new Date('2024-01-15')} />);
        expect(screen.getByText('Jan')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });
});
