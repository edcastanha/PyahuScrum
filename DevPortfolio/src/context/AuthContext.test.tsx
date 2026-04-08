import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const Consumer = () => {
  const { logout, profile } = useAuth();

  return (
    <>
      <button onClick={logout}>logout</button>
      <span>{profile?.login ?? 'anonymous'}</span>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('restores and clears session state', async () => {
    window.localStorage.setItem(
      'devportfolio.auth.session',
      JSON.stringify({
        isAuthenticated: true,
        githubLogin: 'edson',
        savedAt: '2026-04-08T00:00:00.000Z',
        profile: {
          login: 'edson',
          id: 123,
          avatar_url: 'https://avatar.test',
          name: 'Edson',
          bio: 'Developer',
          public_repos: 10,
          followers: 5
        }
      })
    );

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('edson')).toBeInTheDocument());

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
    expect(window.localStorage.getItem('devportfolio.auth.session')).toBeNull();
  });
});
