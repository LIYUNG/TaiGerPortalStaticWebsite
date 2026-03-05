import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@taiger-common/core', () => ({
    isProgramAdmitted: vi.fn(() => false),
    isProgramDecided: vi.fn(() => false),
    isProgramSubmitted: vi.fn(() => false),
    isProgramWithdraw: vi.fn(() => false),
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false),
    is_TaiGer_Guest: vi.fn(() => false)
}));

import ApplicationProgress from './ApplicationProgress';

const renderWithTable = (student: { applications?: unknown[] }) =>
    render(
        <MemoryRouter>
            <table>
                <tbody>
                    <ApplicationProgress student={student as any} />
                </tbody>
            </table>
        </MemoryRouter>
    );

describe('ApplicationProgress', () => {
    it('renders without crashing when student has no applications', () => {
        renderWithTable({ applications: [] });
        expect(document.body).toBeTruthy();
    });

    it('shows no university row when applications array is empty', () => {
        renderWithTable({ applications: [] });
        expect(screen.getByText('No University')).toBeTruthy();
    });

    it('renders without crashing when applications is undefined', () => {
        renderWithTable({});
        expect(document.body).toBeTruthy();
    });
});
