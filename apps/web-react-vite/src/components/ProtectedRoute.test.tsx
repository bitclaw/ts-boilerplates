import { render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    render(
      <Provider>
        <MemoryRouter initialEntries={['/']}>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByText('Protected content')).toBeNull();
  });
});
