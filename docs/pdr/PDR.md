# Plano de Desenvolvimento da Release (PDR) - Fase Atual

**Projeto:** Portfólio Interativo

**Escopo:** Frontend-only no diretório `DevPortfolio`

**Data:** 2026-04-08

## 1. Objetivo da Release

Entregar a base funcional da aplicação com uma home de login, autenticação via API pública do GitHub, sessão local persistida no navegador e rotas internas protegidas. Esta release não inclui backend dedicado nem persistência em MongoDB.

## 2. Resultado Esperado

Ao final desta fase, o usuário deverá conseguir:

- acessar a home como tela de login;
- informar um username público válido do GitHub;
- entrar na aplicação e manter a sessão após refresh;
- sair da aplicação com limpeza da sessão local;
- receber mensagens claras para usuário inexistente, rate limit e falhas de rede.

## 3. Decisões que Guiam a Release

- O frontend é a unidade principal desta fase.
- A autenticação é baseada em consulta ao endpoint `https://api.github.com/users/{username}`.
- A persistência de sessão será local, usando `localStorage`.
- Rotas internas devem exigir autenticação.
- O comportamento deve permanecer evolutivo para uma futura integração com backend sem alterar a intenção da experiência atual.

## 4. Marcos de Entrega

### Marco 1: Base de Acesso

- Tela de login como entrada da aplicação.
- Consulta ao GitHub para validar username.
- Feedback de erro para cenários conhecidos.

### Marco 2: Sessão e Proteção

- Armazenamento local da sessão.
- Roteamento protegido para áreas internas.
- Logout com limpeza da sessão.

### Marco 3: Consolidação

- Testes automatizados do fluxo principal.
- Validação da experiência em container via Docker Compose.
- Documentação alinhada com a implementação atual.

## 5. Critérios de Conclusão

- O fluxo de login funciona com usuário GitHub válido.
- A sessão é restaurada após recarregar a página.
- Rotas internas não ficam acessíveis sem autenticação.
- O logout encerra a sessão local.
- Os principais testes da feature passam no ambiente de validação.

## 6. Riscos e Dependências

- Dependência da disponibilidade da API pública do GitHub.
- Possibilidade de rate limit em testes ou uso repetido.
- Dependência do comportamento do navegador para `localStorage`.
- Necessidade de manter compatibilidade com a estrutura atual do frontend.

## 7. Fora de Escopo

- Backend dedicado para autenticação.
- OAuth server-side.
- Persistência em MongoDB.
- Sincronização de sessão entre dispositivos.

## 8. Próxima Evolução

Depois desta release, o projeto pode incorporar backend, autenticação mais robusta e persistência centralizada sem abandonar a base de navegação e experiência já validada nesta fase.
