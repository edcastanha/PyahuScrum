import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';

var mockNavigate = jest.fn();
var mockLoginWithGithub = jest.fn().mockRejectedValue(new Error('404'));
var mockClearError = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('../../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    loginWithGithub: mockLoginWithGithub,
    isLoggingIn: false,
    errorMessage: 'Usuário não encontrado no GitHub.',
    clearError: mockClearError,
    profile: null
  })
}));

describe('LoginPage error states', () => {
  it('shows an error message', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/username do github/i), {
      target: { value: 'unknown-user' }
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form') as HTMLFormElement);

    expect(screen.getByRole('alert')).toHaveTextContent(/usuário não encontrado/i);
  });
});
