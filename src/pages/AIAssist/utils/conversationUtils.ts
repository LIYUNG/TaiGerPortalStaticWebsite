import type {
    AIAssistConversation,
    AIAssistMessage,
    AIAssistSkillTrace,
    AIAssistStreamProgressEvent,
    AIAssistToolCall
} from '@/api/types';

export const SOURCE_LABELS: Record<string, string> = {
    find_students: 'Students',
    get_student_overview: 'Student profile',
    get_communications: 'Communications',
    get_document_threads: 'Document threads',
    get_thread_messages: 'Thread history',
    get_my_overview: 'Portfolio overview',
    find_upcoming_deadlines: 'Upcoming deadlines',
    get_support_tickets: 'Support tickets',
    get_program: 'Program requirements',
    get_crm_lead: 'CRM / Meetings',
    read_document: 'Document content',
    search_accessible_students: 'Search students'
};

export const KNOWN_SKILLS: { id: string; label: string }[] = [
    { id: 'identify_risk', label: 'Find application risks' },
    { id: 'review_open_tasks', label: 'Review open tasks' },
    { id: 'summarize_lead_meetings', label: 'Summarize meetings' }
];

export const mergeTrace = (
    previousTrace: AIAssistToolCall[],
    nextTrace: AIAssistToolCall[]
): AIAssistToolCall[] => {
    const mergedTrace = [...previousTrace];
    const knownIds = new Set(previousTrace.map((toolCall) => toolCall.id));

    nextTrace.forEach((toolCall) => {
        if (!knownIds.has(toolCall.id)) {
            mergedTrace.push(toolCall);
            knownIds.add(toolCall.id);
        }
    });

    return mergedTrace;
};

export const getNextConversation = (
    activeConversationId: string,
    conversations: AIAssistConversation[]
): AIAssistConversation | null => {
    const activeIndex = conversations.findIndex(
        (conversation) => conversation.id === activeConversationId
    );
    const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== activeConversationId
    );

    if (remainingConversations.length === 0) {
        return null;
    }

    if (activeIndex === -1) {
        return remainingConversations[0];
    }

    return (
        remainingConversations[activeIndex] ??
        remainingConversations[activeIndex - 1] ??
        remainingConversations[0]
    );
};

export const withResponseSkillTrace = (
    message: AIAssistMessage,
    skillTrace?: AIAssistSkillTrace
): AIAssistMessage => ({
    ...message,
    skillTrace: message.skillTrace ?? skillTrace ?? null
});

export const getToolDisplayName = (toolName: string): string =>
    SOURCE_LABELS[toolName] ||
    toolName
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export const resolveCurrentProgressStatus = (
    event: AIAssistStreamProgressEvent
): string | null => {
    if (event.type === 'status') {
        if (event.phase === 'mode') {
            if (event.mode === 'intent_first') {
                return 'Intent routing...';
            }

            if (event.mode === 'skill') {
                return 'Planning skill workflow...';
            }

            if (
                event.mode === 'legacy_tool_loop' ||
                event.mode === 'chat_fallback'
            ) {
                return 'Thinking...';
            }
        }

        if (event.phase === 'intent_routing') {
            return 'Intent routing...';
        }

        if (event.phase === 'entity_resolution') {
            return 'Resolving student...';
        }

        if (event.phase === 'completed') {
            return null;
        }
    }

    if (event.type === 'thinking') {
        if (event.phase === 'intent_routing') {
            return 'Intent routing...';
        }

        if (event.phase === 'entity_resolution') {
            return 'Resolving student...';
        }

        if (event.phase === 'answer_composer') {
            return 'Composing answer...';
        }

        return 'Thinking...';
    }

    if (event.type === 'tool_start') {
        return `Tool calling: ${getToolDisplayName(event.toolName || 'tool')}...`;
    }

    if (event.type === 'tool_done') {
        return 'Thinking...';
    }

    return null;
};
