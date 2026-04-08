export type AuthErrorType = 'not-found' | 'rate-limit' | 'network' | 'unknown';

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

export function mapAuthError(error: unknown): AuthError {
  if (error instanceof Error && error.message.toLowerCase().includes('404')) {
    return { type: 'not-found', message: 'Usuário não encontrado no GitHub.' };
  }

  if (error instanceof Error && error.message.toLowerCase().includes('403')) {
    return { type: 'rate-limit', message: 'Limite da API do GitHub atingido. Tente novamente mais tarde.' };
  }

  if (error instanceof TypeError) {
    return { type: 'network', message: 'Falha de rede. Verifique sua conexão e tente novamente.' };
  }

  return { type: 'unknown', message: 'Não foi possível concluir o login. Tente novamente.' };
}
