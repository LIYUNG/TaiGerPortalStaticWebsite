import { Button, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_AdminAgent } from '@taiger-common/core';

import EditorNew from '@components/EditorJs/EditorNew';
import { convertDate } from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import { OutputData } from '@editorjs/editorjs';

export interface DocPageViewProps {
    editorState: OutputData;
    handleClickEditToggle: () => void;
    handleClickSave: () => void;
    author?: string;
}

const DocPageView = (props: DocPageViewProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    return (
        <Card sx={{ p: 2 }}>
            <EditorNew
                editorState={props.editorState}
                handleClickEditToggle={props.handleClickEditToggle}
                handleClickSave={props.handleClickSave}
                readOnly={true}
            />
            {is_TaiGer_AdminAgent(user) ? (
                <>
                    <Typography>
                        {t('Updated at')} {convertDate(props.editorState.time)}
                    </Typography>
                    <Typography>
                        {t('Updated by')} {props.author ? props.author : '-'}
                    </Typography>
                </>
            ) : null}
            {is_TaiGer_AdminAgent(user) ? (
                <Button
                    color="secondary"
                    onClick={() => props.handleClickEditToggle()}
                    size="small"
                    variant="contained"
                >
                    {t('Edit', { ns: 'common' })}
                </Button>
            ) : null}
        </Card>
    );
};
export default DocPageView;
