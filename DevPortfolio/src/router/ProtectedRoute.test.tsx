import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

var mockNavigate = jest.fn();
var mockAuthState = { isAuthenticated: false, isHydrated: true, githubLogin: null };

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Navigate: ({ to }: { to: string }) => <span>redirect:{to}</span>,
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => mockAuthState
}));

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users', () => {
    mockAuthState = { isAuthenticated: false, isHydrated: true, githubLogin: null };
    render(
      <ProtectedRoute>
        <div>protected</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('redirect:/')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockAuthState = { isAuthenticated: true, isHydrated: true, githubLogin: 'edson' };
    render(
      <ProtectedRoute>
        <div>protected</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
  });
});
