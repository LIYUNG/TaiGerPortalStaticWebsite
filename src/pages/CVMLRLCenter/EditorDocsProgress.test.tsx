import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditorDocsProgress from './EditorDocsProgress';

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => true)
}));

vi.mock('./ManualFiles', () => ({
    default: () => <div data-testid="manual-files" />
}));

vi.mock('./components/ApplicationAccordionList', () => ({
    default: () => <div data-testid="application-accordion-list" />
}));

vi.mock('./components/DeleteFileThreadDialog', () => ({
    default: () => <div data-testid="delete-file-thread-dialog" />
}));

vi.mock('./components/SetAsFinalFileDialog', () => ({
    default: () => <div data-testid="set-as-final-file-dialog" />
}));

vi.mock('./components/RequirementsModal', () => ({
    default: () => <div data-testid="requirements-modal" />
}));

vi.mock('./components/SetProgramStatusDialog', () => ({
    default: () => <div data-testid="set-program-status-dialog" />
}));

vi.mock('../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false })),
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false }))
}));

vi.mock('@/api', () => ({
    deleteGenralFileThread: vi.fn(),
    deleteProgramSpecificFileThread: vi.fn(),
    SetFileAsFinal: vi.fn(),
    initGeneralMessageThread: vi.fn(),
    initApplicationMessageThread: vi.fn(),
    updateStudentApplication: vi.fn()
}));

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

const mockStudent = {
    _id: 'student1',
    firstname: 'John',
    applications: [],
    generaldocs_threads: []
};

describe('EditorDocsProgress', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EditorDocsProgress student={mockStudent} />
            </MemoryRouter>
        );
    });

    it('renders ManualFiles component', async () => {
        expect(await screen.findByTestId('manual-files')).toBeInTheDocument();
    });

    it('renders ApplicationAccordionList components', async () => {
        const lists = await screen.findAllByTestId(
            'application-accordion-list'
        );
        expect(lists.length).toBeGreaterThan(0);
    });

    it('renders dialogs', async () => {
        expect(
            await screen.findByTestId('delete-file-thread-dialog')
        ).toBeInTheDocument();
        expect(
            await screen.findByTestId('set-as-final-file-dialog')
        ).toBeInTheDocument();
    });

    it('renders set program status dialog', async () => {
        expect(
            await screen.findByTestId('set-program-status-dialog')
        ).toBeInTheDocument();
    });
});
