import React, { useRef, useState, useCallback } from 'react';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    is_TaiGer_Agent,
    is_TaiGer_Student,
    is_TaiGer_role
} from '@taiger-common/core';
import { useParams } from 'react-router-dom';

import ComposeEditor from '@components/EditorJs/ComposeEditor';
import type { ComposeEditorRef } from '@components/EditorJs/ComposeEditor';
import type { OutputData } from '@editorjs/editorjs';
import { useAuth } from '@components/AuthProvider';
import { CVMLRL_DOC_PRECHECK_STATUS_E, stringAvatar } from '@utils/contants';
import { TaiGerChatAssistant } from '@/api';
import { appConfig } from '../../config';

export interface CommunicationThreadEditorProps {
    buttonDisabled: boolean;
    editorState: unknown;
    handleClickSave?: (e: React.MouseEvent, editorState: OutputData) => void;
    thread: unknown;
    files?: Array<{ name: string; path?: string }>;
    count?: number;
}

const CommunicationThreadEditor = (props: CommunicationThreadEditorProps) => {
    const { t } = useTranslation();
    const { studentId } = useParams();
    const { handleClickSave } = props;

    const { user } = useAuth();
    const composeRef = useRef<ComposeEditorRef>(null);
    const [hasContent, setHasContent] = useState(false);
    const [streamingData, setStreamingData] = useState({
        data: '',
        isGenerating: false
    });
    const [isSending, setIsSending] = useState(false);

    const handleSend = useCallback(
        (e: React.MouseEvent) => {
            if (isSending) return;
            const content = composeRef.current?.getValue();
            if (!content?.blocks?.length) return;
            setIsSending(true);
            handleClickSave?.(e, content);
            composeRef.current?.reset();
            setHasContent(false);
            setIsSending(false);
        },
        [isSending, handleClickSave]
    );

    const handleClick = () => {
        document.getElementById('file-input')?.click();
    };

    const onSubmit = async () => {
        setStreamingData((prev) => ({ ...prev, isGenerating: true }));
        const response = await TaiGerChatAssistant('abc', studentId);
        const reader = response.body
            ?.pipeThrough(new TextDecoderStream())
            .getReader();
        if (!reader) {
            setStreamingData((prev) => ({ ...prev, isGenerating: false }));
            return;
        }
        let data = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            data += value;
            setStreamingData((prev) => ({ ...prev, data }));
        }
        setStreamingData((prev) => ({ ...prev, data, isGenerating: false }));
    };
    return (
        <>
            <Box
                style={{
                    my: 1,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Avatar
                    {...stringAvatar(`${user.firstname} ${user.lastname}`)}
                    src={user?.pictureUrl}
                />
                <Typography variant="body1">
                    {user.firstname} {user.lastname}
                </Typography>
            </Box>
            <Box
                sx={{
                    py: 4,
                    px: 4,
                    my: 1,
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                }}
            >
                <ComposeEditor
                    ref={composeRef}
                    defaultHeight={0}
                    holder="communication-thread-editor"
                    imageEnable={false}
                    initialValue={
                        props.editorState &&
                        typeof props.editorState === 'object' &&
                        'blocks' in (props.editorState as object)
                            ? (props.editorState as OutputData)
                            : undefined
                    }
                    readOnly={false}
                    thread={
                        props.thread as
                            | { _id: string; student_id: { _id: string } }
                            | undefined
                    }
                    onContentChange={(value) =>
                        setHasContent(
                            Boolean(value?.blocks && value.blocks.length > 0)
                        )
                    }
                />
            </Box>
            <Box>
                {is_TaiGer_role(user)
                    ? props.files?.map((fl, i) => (
                          <Box
                              key={`${fl.name}${i}`}
                              sx={{
                                  wordBreak: 'break-word', // Breaks the word to avoid overflow
                                  overflowWrap: 'break-word' // Add this line
                              }}
                          >
                              <Typography variant="body1">
                                  {fl.name} :
                              </Typography>
                              {props.checkResult?.length
                                  ? Object.keys(props.checkResult[i]).map(
                                        (ky) => (
                                            <Typography
                                                key={
                                                    props.checkResult[i][ky]
                                                        .text
                                                }
                                                sx={{ ml: 2 }}
                                            >
                                                {props.checkResult[i][ky]
                                                    .value === undefined
                                                    ? CVMLRL_DOC_PRECHECK_STATUS_E.WARNING_SYMBOK
                                                    : props.checkResult[i][ky]
                                                            .value
                                                      ? CVMLRL_DOC_PRECHECK_STATUS_E.OK_SYMBOL
                                                      : CVMLRL_DOC_PRECHECK_STATUS_E.NOT_OK_SYMBOL}
                                                {props.checkResult[i][ky].text}
                                                {props.checkResult[i][ky]
                                                    .hasMetadata
                                                    ? props.checkResult[i][ky]
                                                          .metaData
                                                    : null}
                                            </Typography>
                                        )
                                    )
                                  : null}
                          </Box>
                      ))
                    : null}
                {is_TaiGer_Student(user)
                    ? props.files?.map((fl, i) => (
                          <Box key={`${fl.name}${i}`}>
                              <Typography
                                  sx={{
                                      overflowWrap: 'break-word' // Add this line
                                  }}
                                  variant="body1"
                              >
                                  {fl.name}
                              </Typography>
                          </Box>
                      ))
                    : null}
            </Box>
            <Box sx={{ mb: 2 }}>
                <Tooltip
                    placement="top"
                    title={
                        !hasContent || props.buttonDisabled
                            ? t(
                                  'Please write some text to improve the communication and understanding.'
                              )
                            : ''
                    }
                >
                    <span>
                        <Button
                            color="primary"
                            disabled={
                                !hasContent || props.buttonDisabled || isSending
                            }
                            onClick={
                                hasContent && !props.buttonDisabled
                                    ? handleSend
                                    : undefined
                            }
                            startIcon={
                                isSending ? (
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                ) : (
                                    <SendIcon />
                                )
                            }
                            variant={
                                hasContent && !props.buttonDisabled
                                    ? 'contained'
                                    : 'outlined'
                            }
                        >
                            {t('Send', { ns: 'common' })}
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip placement="top" title={t('Attach files')}>
                    <span>
                        <input
                            id="file-input"
                            multiple
                            onChange={(e) => props.onFileChange(e)}
                            style={{ display: 'none' }}
                            type="file"
                        />
                        <IconButton
                            aria-label="attach file"
                            color="primary"
                            component="span"
                            onClick={handleClick}
                        >
                            <AttachFileIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                {appConfig.AIEnable && is_TaiGer_role(user) ? (
                    <IconButton
                        disabled={streamingData.isGenerating}
                        onClick={onSubmit}
                    >
                        {streamingData.isGenerating ? (
                            <CircularProgress size={24} />
                        ) : (
                            <AutoFixHighIcon />
                        )}
                    </IconButton>
                ) : null}
                {is_TaiGer_Agent(user) ? (
                    <Typography variant="body1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {streamingData.data}
                        </ReactMarkdown>
                    </Typography>
                ) : null}
            </Box>
        </>
    );
};

export default CommunicationThreadEditor;
