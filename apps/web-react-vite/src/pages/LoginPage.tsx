import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { api } from '~/lib/api';
import { tokenAtom, userAtom, type AuthUser } from '~/store/auth';

const schema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<{ user: AuthUser; token: string }>('/auth/login', data);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      navigate('/');
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Login failed' });
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        {errors.root && <p>{errors.root.message}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
