/**
 * Shared dialog for editing a user list (agents, editors, essay writers, or interview trainers).
 * Used by: NoAgentsStudentsCard, NoEditorsStudentsCard, StudentBriefOverview, StudentsAgentEditor, StudentsTable.
 * - agent / editor: student entity, getUsersQuery(role), student.agents | student.editors
 * - essay_writer: essayDocumentThread, getUsersQuery(ESSAY_WRITERS_QUERY_STRING) or static editors, outsourced_user_id
 * - interview_trainer: interview entity, getUsersQuery(ESSAY_WRITERS_QUERY_STRING), trainer_id
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

import { getUsersQuery } from '@/api/query';
import { ESSAY_WRITERS_QUERY_STRING } from '@/api/queryStrings';

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

/** Program/student snippet for entity-style titles */
interface EntityTitleParts {
    programId?: {
        school?: string;
        program_name?: string;
        degree?: string;
        semester?: string;
    };
    studentId?: { firstname?: string; lastname?: string };
}

/** Single source of truth for variant-specific labels and data */
const VARIANT_CONFIG = {
    agent: {
        role: Role.Agent,
        titleKey: 'Agent for',
        listLabelKey: 'Agent',
        emptyLabelKey: 'No Agent',
        studentField: 'agents' as const,
        titleSuffix: ' to'
    },
    editor: {
        role: Role.Editor,
        titleKey: 'Editor for',
        listLabelKey: 'Editor',
        emptyLabelKey: 'No Editor',
        studentField: 'editors' as const,
        titleSuffix: undefined
    },
    essay_writer: {
        listLabelKey: null as string | null,
        emptyLabelKey: 'No Essay Writer'
    },
    interview_trainer: {
        listLabelKey: 'Interview Trainer',
        emptyLabelKey: 'No Interview Trainer Students'
    }
} as const;

function getEntityTitleParts(entity: {
    program_id?: EntityTitleParts['programId'];
    student_id?: EntityTitleParts['studentId'];
}): EntityTitleParts {
    return {
        programId: entity.program_id,
        studentId: entity.student_id
    };
}

function formatEntityTitleLine(
    parts: EntityTitleParts,
    fileType?: string
): React.ReactNode {
    const { programId, studentId } = parts;
    const school = programId?.school;
    const programName = programId?.program_name;
    const degree = programId?.degree;
    const semester = programId?.semester;
    const first = studentId?.firstname;
    const last = studentId?.lastname;
    const prefix = fileType != null ? `${fileType}-` : '';
    return (
        <>
            {prefix}
            {school}-{programName} {degree} {semester} {first} {last}
        </>
    );
}

/** Presentational table for the user checklist (or empty state) */
function UserListTable({
    users,
    updateList,
    onCheckboxChange,
    listLabelKey,
    emptyLabelKey,
    t
}: {
    users: IUserWithId[];
    updateList: Record<string, boolean>;
    onCheckboxChange: (e: React.SyntheticEvent) => void;
    listLabelKey: string | null;
    emptyLabelKey: string;
    t: (key: string, opts?: { ns?: string }) => string;
}) {
    return (
        <>
            {listLabelKey != null && (
                <Typography variant="h6">
                    {t(listLabelKey, { ns: 'common' })}:{' '}
                </Typography>
            )}
            <Table size="small">
                <TableBody>
                    {users.length > 0 ? (
                        users.map((user, i) => (
                            <TableRow key={user._id ?? i}>
                                <TableCell>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    updateList[user._id] ??
                                                    false
                                                }
                                                onChange={onCheckboxChange}
                                                value={user._id}
                                            />
                                        }
                                        label={`${user.lastname} ${user.firstname}`}
                                    />
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        ))
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
        </>
    );
}

export type EditUserListSubpageProps =
    | {
          variant: 'agent' | 'editor';
          onHide: () => void;
          show: boolean;
          student: IStudentResponse;
          submitUpdateList: (
              e: React.MouseEvent<HTMLElement>,
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
          isSubmitting?: boolean;
          submitUpdateList: (
              e: React.MouseEvent<HTMLElement>,
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
              e: React.MouseEvent<HTMLElement>,
              updateList: Record<string, boolean>,
              entityId: string
          ) => void;
      };

/** Encapsulates query, derived lists, and checkbox state for the dialog */
function useEditUserListState(props: EditUserListSubpageProps) {
    const { variant } = props;
    const isEssayWriter = variant === 'essay_writer';
    const isInterviewTrainer = variant === 'interview_trainer';
    const isStudentVariant = variant === 'agent' || variant === 'editor';
    const studentConfig = isStudentVariant
        ? VARIANT_CONFIG[variant]
        : undefined;

    const queryOptions = useMemo(() => {
        const queryStringForVariant =
            variant === 'agent' || variant === 'editor'
                ? queryString.stringify({
                      role: VARIANT_CONFIG[variant].role,
                      archiv: false
                  })
                : ESSAY_WRITERS_QUERY_STRING;
        return getUsersQuery(queryStringForVariant);
    }, [variant]);

    const { data: usersDataFromQuery, isLoading } = useQuery(queryOptions);

    const users = useMemo(
        () => (usersDataFromQuery ?? []) as IUserWithId[],
        [usersDataFromQuery]
    );

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
        return (props.student[studentConfig!.studentField] ?? undefined) as
            | { _id: string }[]
            | undefined;
    }, [isEssayWriter, isInterviewTrainer, props, studentConfig]);

    const initialUpdateList = useMemo(
        () =>
            users.reduce<Record<string, boolean>>(
                (prev, { _id }) => ({
                    ...prev,
                    [_id]: currentList
                        ? currentList.findIndex(
                              (u: { _id: string }) => u._id === _id
                          ) > -1
                        : false
                }),
                {}
            ),
        [users, currentList]
    );

    const [updateList, setUpdateList] =
        useState<Record<string, boolean>>(initialUpdateList);

    useEffect(() => {
        setUpdateList(initialUpdateList);
    }, [initialUpdateList]);

    const handleChange = (e: React.SyntheticEvent) => {
        const { value } = e.target as HTMLInputElement & { value: string };
        setUpdateList((prev) => ({ ...prev, [value]: !prev[value] }));
    };

    const isSubmitting =
        (isEssayWriter || isInterviewTrainer) && 'isSubmitting' in props
            ? props.isSubmitting
            : false;

    return {
        users,
        entityId,
        updateList,
        handleChange,
        isLoadingState: isLoading,
        isSubmitting
    };
}

/** Build dialog title from props and variant config */
function buildTitle(
    props: EditUserListSubpageProps,
    t: (key: string, opts?: { ns?: string }) => string
): React.ReactNode {
    const { variant } = props;
    if (variant === 'agent' || variant === 'editor') {
        const config = VARIANT_CONFIG[variant];
        return (
            <>
                {t(config.titleKey, { ns: 'common' })} {props.student.firstname}{' '}
                - {props.student.lastname}
                {config.titleSuffix ?? ''}
            </>
        );
    }
    if (variant === 'essay_writer') {
        const { actor, essayDocumentThread } = props;
        const parts = getEntityTitleParts(essayDocumentThread);
        return (
            <>
                {actor} for{' '}
                {formatEntityTitleLine(parts, essayDocumentThread.file_type)}
            </>
        );
    }
    if (variant === 'interview_trainer') {
        const { actor, interview } = props;
        const parts = getEntityTitleParts(interview);
        return (
            <>
                {actor} for {formatEntityTitleLine(parts)}
            </>
        );
    }
    return null;
}

const EditUserListSubpage = (props: EditUserListSubpageProps) => {
    const { t } = useTranslation();
    const { variant, submitUpdateList, onHide, show } = props;

    const state = useEditUserListState(props);
    const {
        users,
        entityId,
        updateList,
        handleChange,
        isLoadingState,
        isSubmitting
    } = state;

    const display = VARIANT_CONFIG[variant];
    const title = buildTitle(props, t);

    return (
        <Dialog
            aria-labelledby="contained-modal-title-vcenter"
            maxWidth="sm"
            onClose={onHide}
            open={show}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {!isLoadingState ? (
                    <>
                        <UserListTable
                            users={users}
                            updateList={updateList}
                            onCheckboxChange={handleChange}
                            listLabelKey={display.listLabelKey}
                            emptyLabelKey={display.emptyLabelKey}
                            t={t}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button
                                color="primary"
                                disabled={isSubmitting}
                                onClick={(e) =>
                                    submitUpdateList(e, updateList, entityId)
                                }
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <SaveIcon />
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {t('Update', { ns: 'common' })}
                            </Button>
                            <Button
                                color="secondary"
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
