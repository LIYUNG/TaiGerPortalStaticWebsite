import React from 'react';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MessageIcon from '@mui/icons-material/Message';
import i18next from 'i18next';

import { DocumentStatusType } from '@taiger-common/model';

export interface DownloadIconButtonProps {
    showPreview: () => void;
}

export const DownloadIconButton = ({
    showPreview
}: DownloadIconButtonProps) => (
    <Tooltip title={i18next.t('Download', { ns: 'common' })}>
        <IconButton onClick={showPreview}>
            <FileDownloadIcon />
        </IconButton>
    </Tooltip>
);

export interface CommentsIconButtonProps {
    openCommentWindow: (student_id: string, category: string) => void;
    buttonState: { student_id: string };
    category: string;
}

export const CommentsIconButton = ({
    openCommentWindow,
    buttonState,
    category
}: CommentsIconButtonProps) => (
    <Tooltip title={i18next.t('Show Comments', { ns: 'common' })}>
        <IconButton
            onClick={() => openCommentWindow(buttonState.student_id, category)}
        >
            <MessageIcon />
        </IconButton>
    </Tooltip>
);

export interface DeleteIconButtonProps {
    isLoading: boolean;
    onDeleteFileWarningPopUp: (
        e: React.MouseEvent,
        category: string,
        student_id: string,
        docName: string
    ) => void;
    category: string;
    student_id: string;
    docName: string;
}

export const DeleteIconButton = ({
    isLoading,
    onDeleteFileWarningPopUp,
    category,
    student_id,
    docName
}: DeleteIconButtonProps) => (
    <Tooltip title={i18next.t('Delete', { ns: 'common' })}>
        <span>
            <IconButton
                color="error"
                disabled={isLoading}
                onClick={(e) =>
                    onDeleteFileWarningPopUp(e, category, student_id, docName)
                }
                type="submit"
            >
                <DeleteIcon />
            </IconButton>
        </span>
    </Tooltip>
);

export interface UploadIconButtonProps {
    isLoading: boolean;
    buttonState: { student_id: string };
    handleGeneralDocSubmit: (
        e: React.ChangeEvent<HTMLInputElement>,
        category: string,
        student_id: string
    ) => void;
    category: string;
}

export const UploadIconButton = ({
    isLoading,
    buttonState,
    handleGeneralDocSubmit,
    category
}: UploadIconButtonProps) => {
    return isLoading ? (
        <CircularProgress size={24} />
    ) : (
        <Tooltip title={i18next.t('Upload', { ns: 'common' })}>
            <label>
                <IconButton
                    component="span"
                    sx={{ border: 1, borderColor: 'divider' }}
                >
                    <CloudUploadIcon />
                </IconButton>
                <input
                    hidden
                    onChange={(e) =>
                        handleGeneralDocSubmit(
                            e,
                            category,
                            buttonState.student_id
                        )
                    }
                    type="file"
                />
            </label>
        </Tooltip>
    );
};

export interface SetNotNeededIconButtonProps {
    onUpdateProfileDocStatus: (
        e: React.MouseEvent,
        category: string,
        student_id: string,
        status: DocumentStatusType
    ) => void;
    category: string;
    buttonState: { student_id: string };
}

export const SetNotNeededIconButton = ({
    onUpdateProfileDocStatus,
    category,
    buttonState
}: SetNotNeededIconButtonProps) => (
    <Tooltip title={i18next.t('Set Not Needed', { ns: 'common' })}>
        <IconButton
            color="secondary"
            onClick={(e) =>
                onUpdateProfileDocStatus(
                    e,
                    category,
                    buttonState.student_id,
                    DocumentStatusType.NotNeeded
                )
            }
        >
            <NotInterestedIcon />
        </IconButton>
    </Tooltip>
);

export interface SetNeededIconButtonProps {
    onUpdateProfileDocStatus: (
        e: React.MouseEvent,
        category: string,
        student_id: string,
        status: DocumentStatusType
    ) => void;
    category: string;
    buttonState: { student_id: string };
}

export const SetNeededIconButton = ({
    onUpdateProfileDocStatus,
    category,
    buttonState
}: SetNeededIconButtonProps) => (
    <Tooltip title={i18next.t('Set Needed', { ns: 'common' })}>
        <IconButton
            color="secondary"
            onClick={(e) =>
                onUpdateProfileDocStatus(
                    e,
                    category,
                    buttonState.student_id,
                    DocumentStatusType.Missing
                )
            }
        >
            <AssignmentTurnedInIcon />
        </IconButton>
    </Tooltip>
);
