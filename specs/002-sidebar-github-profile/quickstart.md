# Quickstart - Exibição de Perfil Autenticado no Sidebar

## 1) Pré-requisitos

- Repositório em `/home/edson/REPOS/PortifolioInterativo`
- Dependências do frontend instaladas (ou via container)
- Sessão de login funcional no fluxo atual

## 2) Implementar a feature

1. Ajustar projeção de perfil no sidebar para consumir sessão autenticada.
2. Aplicar regras de fallback:
   - nome: primeiro nome -> login -> "Usuário"
   - localização: valor do perfil -> "Localização não informada"
   - avatar: imagem -> iniciais (até 2 caracteres)
3. Garantir refresh de perfil em mudança de pathname protegido e em reload, sem refresh em re-renderizações internas.
4. Garantir redirecionamento para login quando sessão/autenticação estiver ausente.

## 3) Validar localmente

### Execução de testes (container)

```bash
cd /home/edson/REPOS/PortifolioInterativo/DevPortfolio
docker compose -f ../infra/docker-compose.yml run --rm frontend npm test -- --watchAll=false --runInBand
```

### Verificação manual

1. Login com usuário GitHub válido.
2. Navegar para rota interna e confirmar resumo do sidebar.
3. Navegar entre rotas protegidas para validar refresh por mudança de pathname.
4. Forçar re-renderização interna sem trocar rota e validar ausência de refresh adicional.
5. Remover sessão local e confirmar redirecionamento para login.

## 4) Critérios de pronto

- Regras de fallback validadas.
- Redirecionamento sem sessão validado.
- Testes automatizados relevantes passando.
- Documentação da feature mantida em sincronia.

## 5) Evidências de validação manual (2026-04-08)

- Cenário: login com usuário válido e renderização do resumo no sidebar.
   - Evidência: componente consome `buildSidebarProfileSummary(profile, githubLogin)` e renderiza `displayName`, `displayLocation` e avatar em `Sidebar`.
- Cenário: fallback de nome (`name` -> `login` -> "Usuário").
   - Evidência: regra implementada em `profileSummary.ts` com derivação do primeiro nome e fallback em cadeia.
- Cenário: fallback de localização para "Localização não informada".
   - Evidência: regra implementada em `profileSummary.ts` e renderizada no subtítulo do sidebar.
- Cenário: fallback de avatar para iniciais em ausência/falha da imagem.
   - Evidência: `avatarSource` com `onError` em `Sidebar` e fallback para `avatarFallback`.
- Cenário: refresh por mudança de pathname/reload sem refresh por re-render interno.
   - Evidência: efeito em `Sidebar` dependente de `location.pathname`; regra formal e contrato refletidos em spec/contract.
- Cenário: redirecionamento para login sem sessão/autenticação.
   - Evidência: `ProtectedRoute` exige `isAuthenticated` e `githubLogin`; caso contrário, redireciona para `/`.
- Validação automatizada de suporte:
   - Evidência: suíte executada via Docker Compose com 6/6 suites e 9/9 testes passando.