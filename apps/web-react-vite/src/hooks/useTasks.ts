import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api';
import type { Task } from '~/types';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get<{ tasks: Task[] }>('/tasks').then(r => r.tasks)
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      api.post<{ task: Task }>('/tasks', data).then(r => r.task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: Partial<Task> & { id: string }) =>
      api.patch<{ task: Task }>(`/tasks/${id}`, data).then(r => r.task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
}
