import { Button, Stack } from '@mui/material';

interface SkillBarProps {
    skills: { id: string; label: string }[];
    selectedSkillId: string | null;
    onSkillClick: (skillId: string) => void;
}

export const SkillBar = ({
    skills,
    selectedSkillId,
    onSkillClick
}: SkillBarProps): JSX.Element => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {skills.map((skill) => (
            <Button
                key={skill.id}
                onClick={() => onSkillClick(skill.id)}
                size="small"
                variant={
                    selectedSkillId === skill.id ? 'contained' : 'outlined'
                }
            >
                {skill.label}
            </Button>
        ))}
    </Stack>
);
