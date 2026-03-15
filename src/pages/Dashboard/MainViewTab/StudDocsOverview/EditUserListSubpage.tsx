/**
 * Shared dialog for editing a user list (agents, editors, essay writers, or interview trainers).
 * Used by: EditAgentsSubpage, EditEditorsSubpage, EditEssayWritersSubpage, EditInterviewTrainersSubpage.
 * - agent / editor: student entity, getUsersQuery(role), student.agents | student.editors
 * - essay_writer: essayDocumentThread, getEssayWritersQuery() or static editors, outsourced_user_id
 * - interview_trainer: interview entity, getEssayWritersQuery(), trainer_id
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import SaveIcon from '@mui/icons-material/Save';
import { Role } from '@taiger-common/core';
import type { IStudentResponse, IUserWithId } from '@taiger-common/model';

import { getUsersQuery, getEssayWritersQuery } from '@/api/query';
import { FILE_TYPE_E } from '../../../Utils/util_functions';

export type EditUserListVariant =
    | 'agent'
    | 'editor'
    | 'essay_writer'
    | 'interview_trainer';

export interface EssayDocumentThreadForWriters {
    file_type: string;
    outsourced_user_id?: Array<{ _id: string }>;
    program_id?: {
        school?: string;
        program_name?: string;
        degree?: string;
        semester?: string;
    };
    student_id?: { firstname?: string; lastname?: string };
    _id: string;
    [key: string]: unknown;
}

export interface InterviewForTrainers {
    _id: string;
    trainer_id?: Array<{ _id: string }>;
    program_id?: {
        school?: string;
        program_name?: string;
        degree?: string;
        semester?: string;
    };
    student_id?: {
        _id?: string;
        firstname?: string;
        lastname?: string;
    };
    [key: string]: unknown;
}

const VARIANT_CONFIG: Record<
    'agent' | 'editor',
    {
        role: string;
        titleKey: string;
        listLabelKey: string;
        emptyLabelKey: string;
        studentField: 'agents' | 'editors';
        dialogMaxWidth?: 'sm' | 'md' | 'lg';
        titleSuffix?: string;
    }
> = {
    agent: {
        role: Role.Agent,
        titleKey: 'Agent for',
        listLabelKey: 'Agent',
        emptyLabelKey: 'No Agent',
        studentField: 'agents',
        dialogMaxWidth: 'sm',
        titleSuffix: ' to'
    },
    editor: {
        role: Role.Editor,
        titleKey: 'Editor for',
        listLabelKey: 'Editor',
        emptyLabelKey: 'No Editor',
        studentField: 'editors',
        dialogMaxWidth: undefined
    }
};

export type EditUserListSubpageProps =
    | {
          variant: 'agent' | 'editor';
          onHide: () => void;
          show: boolean;
          student: IStudentResponse;
          submitUpdateList: (
              e: React.SyntheticEvent,
              updateList: Record<string, boolean>,
              entityId: string
          ) => void;
      }
    | {
          variant: 'essay_writer';
          onHide: () => void;
          show: boolean;
          actor: string;
          essayDocumentThread: EssayDocumentThreadForWriters;
          editors?: IUserWithId[];
          isSubmitting?: boolean;
          submitUpdateList: (
              e: React.SyntheticEvent,
              updateList: Record<string, boolean>,
              entityId: string
          ) => void;
      }
    | {
          variant: 'interview_trainer';
          onHide: () => void;
          show: boolean;
          actor: string;
          interview: InterviewForTrainers;
          isSubmitting?: boolean;
          submitUpdateList: (
              e: React.SyntheticEvent,
              updateList: Record<string, boolean>,
              entityId: string
          ) => void;
      };

const EditUserListSubpage = (props: EditUserListSubpageProps) => {
    const { t } = useTranslation();
    const { variant, submitUpdateList, onHide, show } = props;

    const isEssayWriter = variant === 'essay_writer';
    const isInterviewTrainer = variant === 'interview_trainer';
    const isStudentVariant = variant === 'agent' || variant === 'editor';
    const config = isStudentVariant ? VARIANT_CONFIG[variant] : undefined;

    const useEssayWritersFetch = isEssayWriter && [
        FILE_TYPE_E.essay_required
    ].includes(props.essayDocumentThread.file_type);

    const queryOptions = useMemo(() => {
        if (variant === 'essay_writer') {
            if (useEssayWritersFetch) return getEssayWritersQuery();
            return {
                queryKey: ['essay-writers-static'],
                queryFn: async () => [] as IUserWithId[],
                enabled: false
            };
        }
        if (variant === 'interview_trainer') return getEssayWritersQuery();
        return getUsersQuery(
            queryString.stringify({
                role: VARIANT_CONFIG[variant].role,
                archiv: false
            })
        );
    }, [variant, useEssayWritersFetch]);

    const { data: usersDataFromQuery, isLoading } = useQuery(queryOptions);

    const editorsForEssay =
        isEssayWriter && 'editors' in props ? props.editors : undefined;
    const staticEssayWriters = useMemo(
        () => (isEssayWriter ? (editorsForEssay ?? []) : []),
        [isEssayWriter, editorsForEssay]
    );

    const users = useMemo(() => {
        if (isEssayWriter) {
            return useEssayWritersFetch
                ? ((usersDataFromQuery ?? []) as IUserWithId[])
                : (staticEssayWriters as IUserWithId[]);
        }
        return (usersDataFromQuery ?? []) as IUserWithId[];
    }, [
        isEssayWriter,
        useEssayWritersFetch,
        usersDataFromQuery,
        staticEssayWriters
    ]);

    const entityId = useMemo(() => {
        if (isEssayWriter) return props.essayDocumentThread._id;
        if (isInterviewTrainer) return props.interview._id;
        const s = props.student;
        return typeof s._id === 'string'
            ? s._id
            : (s._id as { toString(): string }).toString();
    }, [isEssayWriter, isInterviewTrainer, props]);

    const currentList = useMemo(() => {
        if (isEssayWriter) return props.essayDocumentThread.outsourced_user_id;
        if (isInterviewTrainer) return props.interview.trainer_id;
        return (props.student[config!.studentField] ?? undefined) as
            | { _id: string }[]
            | undefined;
    }, [isEssayWriter, isInterviewTrainer, props, config]);

    const initialUpdateList = useMemo(() => {
        return users.reduce<Record<string, boolean>>(
            (prev, { _id }) => ({
                ...prev,
                [_id]: currentList
                    ? currentList.findIndex(
                          (u: { _id: string }) => u._id === _id
                      ) > -1
                    : false
            }),
            {}
        );
    }, [users, currentList]);

    const [updateList, setUpdateList] =
        useState<Record<string, boolean>>(initialUpdateList);

    useEffect(() => {
        setUpdateList(initialUpdateList);
    }, [initialUpdateList]);

    const handleChange = (e: React.SyntheticEvent) => {
        const { value } = e.target as HTMLInputElement & { value: string };
        setUpdateList((prev) => ({
            ...prev,
            [value]: !prev[value]
        }));
    };

    const isLoadingState =
        isEssayWriter && !useEssayWritersFetch ? false : isLoading;
    const title = isEssayWriter ? (
        <>
            {props.actor} for {props.essayDocumentThread.file_type}-
            {props.essayDocumentThread.program_id?.school}-
            {props.essayDocumentThread.program_id?.program_name}{' '}
            {props.essayDocumentThread.program_id?.degree}{' '}
            {props.essayDocumentThread.program_id?.semester}{' '}
            {props.essayDocumentThread.student_id?.firstname}{' '}
            {props.essayDocumentThread.student_id?.lastname}
        </>
    ) : isInterviewTrainer ? (
        <>
            {props.actor} for {props.interview.program_id?.school}-
            {props.interview.program_id?.program_name}{' '}
            {props.interview.program_id?.degree}{' '}
            {props.interview.program_id?.semester}{' '}
            {props.interview.student_id?.firstname}{' '}
            {props.interview.student_id?.lastname}
        </>
    ) : (
        <>
            {t(config!.titleKey, { ns: 'common' })} {props.student.firstname}{' '}
            - {props.student.lastname}
            {config!.titleSuffix ?? ''}
        </>
    );

    const listLabelKey = isEssayWriter
        ? null
        : isInterviewTrainer
          ? 'Interview Trainer'
          : config!.listLabelKey;
    const emptyLabelKey = isEssayWriter
        ? 'No Essay Writer'
        : isInterviewTrainer
          ? 'No Interview Trainer Students'
          : config!.emptyLabelKey;
    const isSubmitting =
        (isEssayWriter || isInterviewTrainer) && 'isSubmitting' in props
            ? props.isSubmitting
            : false;
    const showSaveIcon = isEssayWriter || isInterviewTrainer;
    const showExtraTableCell =
        variant === 'editor' ||
        variant === 'essay_writer' ||
        variant === 'interview_trainer';

    return (
        <Dialog
            aria-labelledby="contained-modal-title-vcenter"
            maxWidth={config?.dialogMaxWidth}
            onClose={onHide}
            open={show}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {!isLoadingState ? (
                    <>
                        {listLabelKey != null && (
                            <Typography
                                variant={
                                    variant === 'editor' ||
                                    variant === 'interview_trainer'
                                        ? 'h6'
                                        : 'body1'
                                }
                            >
                                {t(listLabelKey, { ns: 'common' })}:{' '}
                            </Typography>
                        )}
                        <Table size="small">
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map(
                                        (user: IUserWithId, i: number) => (
                                            <TableRow key={i + 1}>
                                                <TableCell>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={
                                                                    updateList[
                                                                        user._id
                                                                    ] ?? false
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                value={user._id}
                                                            />
                                                        }
                                                        label={`${user.lastname} ${user.firstname}`}
                                                    />
                                                </TableCell>
                                                {showExtraTableCell ? (
                                                    <TableCell />
                                                ) : null}
                                            </TableRow>
                                        )
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="h6">
                                                {t(emptyLabelKey)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Box sx={{ mt: variant === 'agent' ? 2 : 0 }}>
                            <Button
                                color="primary"
                                disabled={isSubmitting}
                                onClick={(e) =>
                                    submitUpdateList(e, updateList, entityId)
                                }
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={24} />
                                    ) : showSaveIcon ? (
                                        <SaveIcon />
                                    ) : undefined
                                }
                                sx={variant === 'agent' ? { mr: 2 } : undefined}
                                variant="contained"
                            >
                                {t('Update', { ns: 'common' })}
                            </Button>
                            <Button
                                color={
                                    variant === 'agent'
                                        ? 'secondary'
                                        : undefined
                                }
                                onClick={onHide}
                                variant="outlined"
                            >
                                {t('Cancel', { ns: 'common' })}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <CircularProgress size={24} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditUserListSubpage;
