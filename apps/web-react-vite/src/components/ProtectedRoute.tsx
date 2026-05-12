import { useAtomValue } from 'jotai';
import { Navigate } from 'react-router';
import { isAuthenticatedAtom } from '~/store/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
