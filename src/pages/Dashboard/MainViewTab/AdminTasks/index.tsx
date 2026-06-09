import AssignEssayWriterRow from '../Common/AssignEssayWriterRow';
import AssignAgentRow from '../Common/AssignAgentRow';
import AssignEditorRow from '../Common/AssignEditorRow';
import AssignInterviewTrainerRow from '../Common/AssignInterviewTrainerRow';
import type { TasksOverview } from '@/api/types';

const AdminTasks = ({ tasksOverview }: { tasksOverview: TasksOverview }) => {
    return (
        <>
            <AssignAgentRow tasksOverview={tasksOverview} />
            <AssignEditorRow tasksOverview={tasksOverview} />
            <AssignEssayWriterRow tasksOverview={tasksOverview} />
            <AssignInterviewTrainerRow tasksOverview={tasksOverview} />
        </>
    );
};

export default AdminTasks;
