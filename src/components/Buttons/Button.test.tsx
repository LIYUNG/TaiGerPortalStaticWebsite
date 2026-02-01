import { render, screen } from '@testing-library/react';
import {
    DownloadIconButton,
    CommentsIconButton,
    DeleteIconButton,
    SetNotNeededIconButton,
    SetNeededIconButton
} from './Button';

describe('Buttons', () => {
    it('DownloadIconButton renders and is clickable', () => {
        const showPreview = jest.fn();
        render(<DownloadIconButton showPreview={showPreview} />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        button.click();
        expect(showPreview).toHaveBeenCalled();
    });

    it('CommentsIconButton renders and calls openCommentWindow on click', () => {
        const openCommentWindow = jest.fn();
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

    it('DeleteIconButton renders and is disabled when isLoading', () => {
        render(
            <DeleteIconButton
                category="cv"
                docName="doc.pdf"
                isLoading={true}
                onDeleteFileWarningPopUp={jest.fn()}
                student_id="s1"
            />
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('SetNotNeededIconButton renders', () => {
        render(
            <SetNotNeededIconButton
                buttonState={{ student_id: 's1' }}
                category="cv"
                onUpdateProfileDocStatus={jest.fn()}
            />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('SetNeededIconButton renders', () => {
        render(
            <SetNeededIconButton
                buttonState={{ student_id: 's1' }}
                category="cv"
                onUpdateProfileDocStatus={jest.fn()}
            />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
