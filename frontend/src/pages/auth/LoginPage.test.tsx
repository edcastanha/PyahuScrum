import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';

var mockNavigate = jest.fn();
var mockLoginWithGithub = jest.fn().mockResolvedValue(undefined);

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('../../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    loginWithGithub: mockLoginWithGithub,
    isLoggingIn: false,
    errorMessage: null,
    clearError: jest.fn(),
    profile: null
  })
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLoginWithGithub.mockClear();
  });

  it('submits the github username', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/username do github/i), {
      target: { value: 'edson' }
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form') as HTMLFormElement);

    expect(mockLoginWithGithub).toHaveBeenCalledWith('edson');
  });
});
