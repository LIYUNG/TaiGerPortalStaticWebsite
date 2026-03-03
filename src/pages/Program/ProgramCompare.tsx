import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {
    Restore as RestoreIcon,
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { updateProgram, reviewProgramChangeRequests } from '@/api';
import { programField2Label, sortProgramFields } from '@utils/contants';

const IGNORE_KEYS = ['_id', 'updatedAt', 'whoupdated', 'createdAt', '__v'];

const getAllKeys = (
    original: Record<string, unknown>,
    incoming: Record<string, unknown>
) => {
    const originalKeys = Object.keys(original);
    const updatedKeys = Object.keys(incoming);
    return [...new Set([...originalKeys, ...updatedKeys])].sort(
        sortProgramFields
    );
};

const getDiffKeys = (
    original: Record<string, unknown>,
    incoming: Record<string, unknown>
) => {
    const allKeys = getAllKeys(original, incoming);
    const modifiedKeys = [];
    const originalKey = [];

    allKeys.forEach((key) => {
        if (IGNORE_KEYS.includes(key)) return;
        const originalValue = original?.[key];
        const incomingValue = incoming?.[key];

        if (
            incomingValue &&
            JSON.stringify(originalValue) !== JSON.stringify(incomingValue)
        ) {
            modifiedKeys.push(key);
        } else {
            originalKey.push(key);
        }
    });

    return { modifiedKeys, originalKey };
};

interface DiffRowProps {
    fieldName: string;
    original: unknown;
    incoming: unknown;
    updateField: (
        fieldName: string,
        value: unknown,
        shouldRemove?: boolean
    ) => void;
    isAccepted: boolean;
    showToggleButton?: boolean;
    [key: string]: unknown;
}

const DiffRow = ({
    fieldName,
    original,
    incoming,
    updateField,
    isAccepted,
    showToggleButton = false,
    ...rowProps
}: DiffRowProps) => {
    const { t } = useTranslation();

    const toggleAccept = () => {
        if (isAccepted) {
            updateField(fieldName, null, true);
        } else {
            updateField(fieldName, incoming);
        }
    };

    return (
        <TableRow
            hover
            {...rowProps}
            sx={!showToggleButton ? { bgcolor: 'grey.300' } : {}}
        >
            <TableCell>
                <Typography variant="body1">
                    {t(programField2Label?.[fieldName] || fieldName, {
                        ns: 'common'
                    })}
                </Typography>
            </TableCell>
            <TableCell
                sx={
                    isAccepted && showToggleButton
                        ? { bgcolor: 'error.light' }
                        : {}
                }
            >
                <Typography variant="body1">
                    {JSON.stringify(original)}
                </Typography>
            </TableCell>
            <TableCell>
                {showToggleButton ? (
                    <Button onClick={toggleAccept}>
                        {isAccepted ? <RestoreIcon /> : <ArrowBackIcon />}
                    </Button>
                ) : null}
            </TableCell>
            <TableCell
                sx={
                    !isAccepted && showToggleButton
                        ? { bgcolor: 'success.light' }
                        : {}
                }
            >
                <Typography variant="body1">
                    {JSON.stringify(incoming)}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

interface DiffTableContentProps {
    originalProgram: Record<string, unknown>;
    incomingProgram: Record<string, unknown>;
    showOnlyModified?: boolean;
    delta: Record<string, unknown>;
    setDelta: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

const DiffTableContent = ({
    originalProgram,
    incomingProgram,
    showOnlyModified = false,
    delta,
    setDelta
}: DiffTableContentProps) => {
    const [hideUnaltered, setHideUnaltered] = useState(showOnlyModified);

    const updateField = (
        fieldName: string,
        value: unknown,
        shouldRemove = false
    ) => {
        if (shouldRemove) {
            setDelta((prevDelta) => {
                delete prevDelta[fieldName];
                return { ...prevDelta };
            });
        } else {
            setDelta((prevDelta) => {
                return { ...prevDelta, [fieldName]: value };
            });
        }
    };

    const { modifiedKeys, originalKey } = getDiffKeys(
        originalProgram,
        incomingProgram
    );

    return (
        <>
            {[...modifiedKeys, ...originalKey].map((key) => {
                if (IGNORE_KEYS.includes(key)) {
                    return;
                }
                const isModified = modifiedKeys.includes(key);
                if (hideUnaltered && !isModified) {
                    return null;
                }

                return (
                    <DiffRow
                        fieldName={key}
                        incoming={incomingProgram?.[key]}
                        isAccepted={key in delta}
                        key={key}
                        original={originalProgram?.[key]}
                        showToggleButton={isModified}
                        updateField={updateField}
                    />
                );
            })}
            <TableRow
                onClick={() => {
                    setHideUnaltered(!hideUnaltered);
                }}
                sx={{ cursor: 'pointer' }}
            >
                <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                    {hideUnaltered ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </TableCell>
            </TableRow>
        </>
    );
};

interface ProgramCompareProps {
    originalProgram: Record<string, unknown>;
    incomingChanges: Record<string, any>;
    submitCallBack?: () => void;
}

const ProgramCompare = ({
    originalProgram,
    incomingChanges,
    submitCallBack
}: ProgramCompareProps) => {
    const { t } = useTranslation('common');
    const [delta, setDelta] = useState<Record<string, unknown>>({});
    const incomingProgram = incomingChanges?.programChanges || {};

    const acceptAllChanges = () => {
        const { modifiedKeys } = getDiffKeys(originalProgram, incomingProgram);
        const modifiedDelta = Object.keys(incomingProgram)
            .filter((key) => modifiedKeys.includes(key))
            .reduce((obj: Record<string, unknown>, key: string) => {
                obj[key] = incomingProgram[key];
                return obj;
            }, {});
        setDelta(modifiedDelta);
    };

    const submitChanges = async () => {
        const program = updateProgram({
            _id: originalProgram._id,
            ...delta,
            changeRequestId: incomingChanges._id
        });
        const changeRequest = reviewProgramChangeRequests(incomingChanges._id);
        await Promise.all([program, changeRequest]);
        if (typeof submitCallBack === 'function') {
            submitCallBack();
        }
    };

    return (
        <Box>
            <Button
                color="secondary"
                onClick={() => {
                    setDelta({});
                }}
                style={{ width: '50%' }}
            >
                {t('Reject All', { ns: 'common' })}
            </Button>
            <Button
                color="primary"
                onClick={acceptAllChanges}
                style={{ width: '50%' }}
            >
                {t('Accept All', { ns: 'common' })}
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t('Field', { ns: 'common' })}
                            </TableCell>
                            <TableCell style={{ width: '45%' }}>
                                {t('Original')}
                            </TableCell>
                            <TableCell />
                            <TableCell style={{ width: '45%' }}>
                                {t('Changed to')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <DiffTableContent
                            delta={delta}
                            incomingProgram={incomingProgram}
                            originalProgram={originalProgram}
                            setDelta={setDelta}
                            showOnlyModified={true}
                        />
                    </TableBody>
                </Table>
            </TableContainer>
            <Button
                color="primary"
                disabled={Object.keys(delta).length === 0}
                onClick={submitChanges}
            >
                {t('Submit', { ns: 'common' })}
            </Button>
        </Box>
    );
};

export default ProgramCompare;
