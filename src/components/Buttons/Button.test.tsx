import type React from 'react';
import { render, screen } from '@testing-library/react';
import { DocumentStatusType } from '@taiger-common/core';
import {
    DownloadIconButton,
    CommentsIconButton,
    DeleteIconButton,
    SetNotNeededIconButton,
    SetNeededIconButton
} from './Button';

/* Unused callback params are intentional in vi.fn() for signature matching */
/* eslint-disable @typescript-eslint/no-unused-vars */
describe('Buttons', () => {
    test('DownloadIconButton renders and is clickable', () => {
        const showPreview = vi.fn(() => {});
        render(<DownloadIconButton showPreview={showPreview} />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        button.click();
        expect(showPreview).toHaveBeenCalled();
    });

    test('CommentsIconButton renders and calls openCommentWindow on click', () => {
        const openCommentWindow = vi.fn((_studentId: string, _category: string) => {});
        render(
            <CommentsIconButton
                buttonState={{ student_id: 's1' }}
                category="cv"
                openCommentWindow={openCommentWindow}
            />
        );
        screen.getByRole('button').click();
        expect(openCommentWindow).toHaveBeenCalledWith('s1', 'cv');
    });

    test('DeleteIconButton renders and is disabled when isLoading', () => {
        const onDeleteFileWarningPopUp = vi.fn(
            (_e: React.MouseEvent, _category: string, _studentId: string, _docName: string) => {}
        );
        render(
            <DeleteIconButton
                category="cv"
                docName="doc.pdf"
                isLoading={true}
                onDeleteFileWarningPopUp={onDeleteFileWarningPopUp}
                student_id="s1"
            />
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });

    test('SetNotNeededIconButton renders', () => {
        const onUpdateProfileDocStatus = vi.fn(
            (
                _e: React.MouseEvent,
                _category: string,
                _studentId: string,
                _status: DocumentStatusType
            ) => {}
        );
        render(
            <SetNotNeededIconButton
                buttonState={{ student_id: 's1' }}
                category="cv"
                onUpdateProfileDocStatus={onUpdateProfileDocStatus}
            />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('SetNeededIconButton renders', () => {
        const onUpdateProfileDocStatus = vi.fn(
            (
                _e: React.MouseEvent,
                _category: string,
                _studentId: string,
                _status: DocumentStatusType
            ) => {}
        );
        render(
            <SetNeededIconButton
                buttonState={{ student_id: 's1' }}
                category="cv"
                onUpdateProfileDocStatus={onUpdateProfileDocStatus}
            />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
