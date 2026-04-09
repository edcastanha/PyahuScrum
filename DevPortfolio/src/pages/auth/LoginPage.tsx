import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { loginWithGithub, isLoggingIn, errorMessage, clearError, profile } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    try {
      await loginWithGithub(username);
      navigate('/dashboard', { replace: true });
    } catch {
      // error already mapped in context
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Entrar com GitHub</h1>
        <p className={styles.subtitle}>Use seu username público para acessar o portfólio.</p>

        <label htmlFor="github-username" className={styles.srOnly}>Username do GitHub</label>
        <input
          id="github-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="seu-username"
          aria-label="Username do GitHub"
          className={styles.field}
        />

        <button type="submit" disabled={isLoggingIn} className={styles.button}>
          {isLoggingIn ? 'Entrando...' : 'Entrar'}
        </button>

        {errorMessage ? <p role="alert" className={styles.error}>{errorMessage}</p> : null}
        {profile ? <p className={styles.success}>Bem-vindo, {profile.login}</p> : null}
      </form>
    </div>
  );
};

export default LoginPage;
