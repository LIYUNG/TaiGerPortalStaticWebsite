import { Link as LinkDom } from 'react-router-dom';
import { Box, Link, List, ListItem, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

import {
    buildApplicationChecklist,
    type ApplicationChecklistItem
} from '@pages/Utils/applicationChecklist';
import {
    FILE_MISSING_SYMBOL,
    FILE_OK_SYMBOL,
    convertDateUXFriendly
} from '@utils/contants';
import type { Application } from '@/api/types';
import type { IStudentResponse, IUserWithId } from '@taiger-common/model';

interface ApplicationProgressCardBodyProps {
    application: Application;
    student: IStudentResponse;
}

/**
 * The icon is wrapped in its own element on purpose: kept as a bare text node it
 * would fuse with the row label (the symbols are plain strings), so "Submit"
 * would no longer be findable as its own text.
 */
const StateIcon = ({ state }: { state: ApplicationChecklistItem['state'] }) => (
    <Box component="span" sx={{ alignItems: 'center', display: 'inline-flex' }}>
        {state === 'ok' ? FILE_OK_SYMBOL : null}
        {state === 'missing' ? FILE_MISSING_SYMBOL : null}
        {state === 'warning' ? (
            <WarningIcon fontSize="small" sx={{ color: 'error.main' }} />
        ) : null}
    </Box>
);

/**
 * The checklist behind an application's progress bar — one row per outstanding
 * requirement. Rows come from buildApplicationChecklist, the same model the bar
 * sums, so the two can't drift apart.
 */
export default function ApplicationProgressCardBody(
    props: ApplicationProgressCardBodyProps
) {
    const items = buildApplicationChecklist(
        props.student as unknown as IUserWithId,
        props.application
    );

    return (
        <List>
            {items.map((item) => (
                <ListItem key={item.id} title={item.title}>
                    <Typography
                        component="div"
                        sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
                    >
                        <Link
                            color="inherit"
                            component={LinkDom}
                            sx={{
                                alignItems: 'center',
                                display: 'inline-flex',
                                gap: 0.5
                            }}
                            to={item.href}
                            underline="hover"
                        >
                            <StateIcon state={item.state} />
                            {item.label}
                        </Link>
                        {item.detail ? (
                            <Box component="span">{` - ${item.detail}`}</Box>
                        ) : null}
                        {item.updatedAt ? (
                            <Box component="span">
                                {` - ${convertDateUXFriendly(item.updatedAt)}`}
                            </Box>
                        ) : null}
                    </Typography>
                </ListItem>
            ))}
        </List>
    );
}
