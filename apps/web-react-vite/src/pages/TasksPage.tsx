import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '~/hooks/useTasks';
import { tokenAtom, userAtom } from '~/store/auth';
import type { Task } from '~/types';

const schema = z.object({ title: z.string().min(1), description: z.string().optional() });
type FormData = z.infer<typeof schema>;

const statusStyles: Record<Task['status'], string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

const statusLabel: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

function TaskItem({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="flex-1 text-sm font-medium text-slate-800">{task.title}</span>
      {task.description && (
        <span className="hidden text-xs text-slate-400 sm:block">{task.description}</span>
      )}
      <select
        value={task.status}
        onChange={e => updateTask.mutate({ id: task.id, status: e.target.value as Task['status'] })}
        className={`rounded-full px-3 py-1 text-xs font-semibold outline-none cursor-pointer ${statusStyles[task.status]}`}
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      <button
        type="button"
        onClick={() => deleteTask.mutate(task.id)}
        className="rounded-lg px-3 py-1 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
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

  const todo = tasks?.filter(t => t.status === 'TODO') ?? [];
  const inProgress = tasks?.filter(t => t.status === 'IN_PROGRESS') ?? [];
  const done = tasks?.filter(t => t.status === 'DONE') ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Tasks</h1>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
        >
          <div className="space-y-1">
            <input
              placeholder="Task title"
              {...register('title')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <input
            placeholder="Description (optional)"
            {...register('description')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          <button
            type="submit"
            disabled={createTask.isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {createTask.isPending ? 'Adding…' : 'Add task'}
          </button>
        </form>

        {isLoading ? (
          <p className="text-center text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="space-y-6">
            {[
              { label: 'In Progress', items: inProgress, dot: 'bg-blue-500' },
              { label: 'To Do', items: todo, dot: 'bg-slate-400' },
              { label: 'Done', items: done, dot: 'bg-green-500' },
            ].map(({ label, items, dot }) =>
              items.length > 0 && (
                <section key={label}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label} <span className="ml-1 text-slate-400">({items.length})</span>
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {items.map(task => <TaskItem key={task.id} task={task} />)}
                  </ul>
                </section>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
