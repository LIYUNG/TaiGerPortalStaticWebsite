export const conversations = [
    {
        id: 'conv_latest',
        title: 'Latest risk review',
        status: 'active',
        studentId: 'student_abby',
        studentDisplayName: 'Abby Student',
        createdAt: '2026-04-12T10:00:00.000Z',
        updatedAt: '2026-04-12T10:05:00.000Z'
    }
];

export const conversationDetails: Record<
    string,
    {
        conversation: (typeof conversations)[0];
        messages: unknown[];
        trace: unknown[];
    }
> = {
    conv_latest: {
        conversation: conversations[0],
        messages: [
            {
                id: 'msg_latest_user',
                conversationId: 'conv_latest',
                role: 'user',
                content: 'Find application risks'
            },
            {
                id: 'msg_latest_assistant',
                conversationId: 'conv_latest',
                role: 'assistant',
                content: 'latest persisted answer',
                skillTrace: {
                    requestedSkill: 'identify_risk',
                    resolvedSkill: 'identify_risk',
                    mode: 'skill',
                    student: {
                        id: 'student_abby',
                        displayName: 'Abby Student'
                    },
                    status: 'completed',
                    steps: []
                }
            }
        ],
        trace: [
            {
                id: 'trace_latest',
                conversationId: 'conv_latest',
                assistantMessageId: 'msg_latest_assistant',
                toolName: 'search_accessible_students',
                status: 'success',
                durationMs: 12,
                arguments: { query: 'Abby' },
                result: { data: [{ id: 'student_abby', name: 'Abby Student' }] }
            }
        ]
    }
};

export const pickerStudents = [
    {
        id: 'student_abby',
        name: 'Abby Student',
        chineseName: '學生艾比',
        email: 'abby@example.com',
        applyingProgramCount: 3
    },
    {
        id: 'student_ada',
        name: 'Ada Lovelace',
        chineseName: '洛芙蕾絲',
        email: 'ada@example.com',
        applyingProgramCount: 2
    }
];

export const firstMessageResponse = {
    success: true,
    data: {
        conversation: {
            id: 'conv_new',
            title: 'New AI Assist conversation',
            status: 'active',
            studentId: 'student_abby',
            studentDisplayName: 'Abby Student'
        },
        answer: 'mocked AI Assist answer',
        userMessage: {
            id: 'msg_user',
            conversationId: 'conv_new',
            role: 'user',
            content: 'Review this student'
        },
        assistantMessage: {
            id: 'msg_assistant',
            conversationId: 'conv_new',
            role: 'assistant',
            content: 'mocked AI Assist answer'
        },
        skillTrace: {
            requestedSkill: 'identify_risk',
            resolvedSkill: 'identify_risk',
            mode: 'skill',
            student: { id: 'student_abby', displayName: 'Abby Student' },
            status: 'completed',
            steps: []
        },
        trace: [
            {
                id: 'trace_first',
                conversationId: 'conv_new',
                assistantMessageId: 'msg_assistant',
                toolName: 'get_student_summary',
                status: 'success',
                durationMs: 16
            }
        ]
    }
};

export const followUpResponse = {
    success: true,
    data: {
        answer: 'follow-up answer',
        userMessage: {
            id: 'msg_follow_up_user',
            conversationId: 'conv_latest',
            role: 'user',
            content: 'Any new risks?'
        },
        assistantMessage: {
            id: 'msg_follow_up_assistant',
            conversationId: 'conv_latest',
            role: 'assistant',
            content: 'follow-up answer'
        },
        skillTrace: {
            requestedSkill: 'review_open_tasks',
            resolvedSkill: 'review_open_tasks',
            mode: 'skill',
            student: { id: 'student_abby', displayName: 'Abby Student' },
            status: 'completed',
            steps: []
        },
        trace: [
            {
                id: 'trace_follow_up',
                conversationId: 'conv_latest',
                assistantMessageId: 'msg_follow_up_assistant',
                toolName: 'get_student_applications',
                status: 'success',
                durationMs: 10
            }
        ]
    }
};
