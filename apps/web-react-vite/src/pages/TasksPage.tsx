import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '~/hooks/useTasks';
import { tokenAtom, userAtom } from '~/store/auth';
import type { Task } from '~/types';

const schema = z.object({ title: z.string().min(1), description: z.string().optional() });
type FormData = z.infer<typeof schema>;

function TaskItem({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  return (
    <li>
      <span>{task.title}</span>
      <select
        value={task.status}
        onChange={e =>
          updateTask.mutate({ id: task.id, status: e.target.value as Task['status'] })
        }
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      <button type="button" onClick={() => deleteTask.mutate(task.id)}>
        Delete
      </button>
    </li>
  );
}

export function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    createTask.mutate(data, { onSuccess: () => reset() });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <div>
      <header>
        <h1>Tasks</h1>
        <button type="button" onClick={logout}>Logout</button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Task title" {...register('title')} />
        {errors.title && <p>{errors.title.message}</p>}
        <input placeholder="Description (optional)" {...register('description')} />
        <button type="submit" disabled={createTask.isPending}>Add task</button>
      </form>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {tasks?.map(task => <TaskItem key={task.id} task={task} />)}
        </ul>
      )}
    </div>
  );
}
