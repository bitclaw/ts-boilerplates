export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};
