export interface ParsedBlocker {
    title: string;
    rootCause: string;
    since: string;
    waitingOn: string;
}

export interface ParsedRisk {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    text: string;
}

export interface ParsedAction {
    target: string;
    urgency: string;
    text: string;
}

export interface ParsedAnalysis {
    health: string | null;
    blockers: ParsedBlocker[];
    risks: ParsedRisk[];
    actions: ParsedAction[];
    analysis: string;
    isStructured: boolean;
}

const extractSection = (text: string, header: string, nextHeader: string): string => {
    const start = text.indexOf(`**${header}:**`);
    if (start === -1) return '';
    const contentStart = start + `**${header}:**`.length;
    const nextStart = nextHeader ? text.indexOf(`**${nextHeader}:**`, contentStart) : -1;
    return (nextStart === -1 ? text.slice(contentStart) : text.slice(contentStart, nextStart)).trim();
};

const parseBullets = (section: string): string[] =>
    section
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('-'));

export const parseAnalysisOutput = (text: string): ParsedAnalysis => {
    const noStructure: ParsedAnalysis = {
        health: null,
        blockers: [],
        risks: [],
        actions: [],
        analysis: text,
        isStructured: false
    };

    if (!text || !text.includes('**HEALTH:**')) {
        return noStructure;
    }

    const healthMatch = text.match(/\*\*HEALTH:\*\*\s*([^\n]+)/);
    const health = healthMatch ? healthMatch[1].trim() : null;

    const blockersSection = extractSection(text, 'BLOCKERS', 'RISKS');
    const blockers: ParsedBlocker[] = parseBullets(blockersSection)
        .filter((l) => l.includes('[BLOCKER]') || l.includes('|'))
        .map((line) => {
            const content = line.replace(/^-\s*\[BLOCKER\]\s*/, '').trim();
            const parts = content.split(' | ');
            return {
                title: parts[0]?.trim() || content,
                rootCause:
                    parts
                        .find((p) => p.startsWith('ROOT CAUSE:'))
                        ?.replace('ROOT CAUSE:', '')
                        .trim() || '',
                since:
                    parts
                        .find((p) => p.startsWith('SINCE:'))
                        ?.replace('SINCE:', '')
                        .trim() || '',
                waitingOn:
                    parts
                        .find((p) => p.startsWith('WAITING ON:'))
                        ?.replace('WAITING ON:', '')
                        .trim() || ''
            };
        });

    const risksSection = extractSection(text, 'RISKS', 'ACTIONS');
    const risks: ParsedRisk[] = parseBullets(risksSection)
        .filter((l) => l.includes('[RISK:'))
        .map((line) => {
            const m = line.match(/\[RISK:(HIGH|MEDIUM|LOW)\]/);
            const severity = (m?.[1] as 'HIGH' | 'MEDIUM' | 'LOW') ?? 'MEDIUM';
            const riskText = line.replace(/^-\s*\[RISK:(HIGH|MEDIUM|LOW)\]\s*/, '').trim();
            return { severity, text: riskText };
        });

    const actionsSection = extractSection(text, 'ACTIONS', 'ANALYSIS');
    const actions: ParsedAction[] = parseBullets(actionsSection)
        .filter((l) => l.includes('[ACTION:'))
        .map((line) => {
            const m = line.match(/\[ACTION:(\w+):(\w+)\]\s*(.*)/);
            return {
                target: m?.[1] ?? 'TEAM',
                urgency: m?.[2] ?? 'NORMAL',
                text: m?.[3]?.trim() ?? line.replace(/^-\s*/, '').trim()
            };
        });

    const analysisSection = extractSection(text, 'ANALYSIS', '');

    const isStructured = Boolean(health) && (blockers.length > 0 || risks.length > 0 || actions.length > 0);

    return { health, blockers, risks, actions, analysis: analysisSection || text, isStructured };
};
