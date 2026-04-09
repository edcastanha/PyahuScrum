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
3. Garantir refresh de perfil a cada novo acesso autenticado.
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
3. Reacessar rota interna para validar refresh do perfil.
4. Remover sessão local e confirmar redirecionamento para login.

## 4) Critérios de pronto

- Regras de fallback validadas.
- Redirecionamento sem sessão validado.
- Testes automatizados relevantes passando.
- Documentação da feature mantida em sincronia.