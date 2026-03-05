import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenericCardContent } from './GenericCard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

const simpleConfig = {
    fields: [
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' }
    ]
};

const gridConfig = {
    layout: 'grid',
    sections: [
        {
            title: 'High School',
            gridSize: 6,
            fields: [
                { key: 'highschoolName', label: 'School Name', type: 'text' }
            ]
        }
    ],
    fields: []
};

const leadData = {
    email: 'alice@example.com',
    phone: '123-456-7890',
    highschoolName: 'Lincoln High'
};

describe('GenericCardContent - view mode', () => {
    beforeEach(() => {
        render(
            <GenericCardContent
                config={simpleConfig}
                formData={{}}
                isEditing={false}
                lead={leadData}
                onFieldChange={vi.fn()}
            />
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders field labels', () => {
        expect(screen.getByText('Email')).toBeTruthy();
        expect(screen.getByText('Phone')).toBeTruthy();
    });

    it('renders field values', () => {
        expect(screen.getByText('alice@example.com')).toBeTruthy();
    });
});

describe('GenericCardContent - grid layout', () => {
    beforeEach(() => {
        render(
            <GenericCardContent
                config={gridConfig}
                formData={{}}
                isEditing={false}
                lead={leadData}
                onFieldChange={vi.fn()}
            />
        );
    });

    it('renders section title', () => {
        expect(screen.getByText('High School')).toBeTruthy();
    });

    it('renders field in section', () => {
        expect(screen.getByText('School Name')).toBeTruthy();
    });
});

describe('GenericCardContent - edit mode', () => {
    beforeEach(() => {
        render(
            <GenericCardContent
                config={simpleConfig}
                formData={{ email: 'alice@example.com', phone: '123' }}
                isEditing={true}
                lead={leadData}
                onFieldChange={vi.fn()}
            />
        );
    });

    it('renders text fields in edit mode', () => {
        const inputs = document.querySelectorAll('input, textarea');
        expect(inputs.length).toBeGreaterThan(0);
    });
});
