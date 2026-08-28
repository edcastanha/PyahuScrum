# 09: Frontend: realinhar telas visíveis pro MVP atual

**What to build:** O menu e as rotas mostram só Login, Dashboard e Projetos — as únicas telas relevantes pro fluxo de demo do Agent Orchestrator agora. User Stories e Documentation saem da navegação e não são mais alcançáveis, sem apagar o código-fonte delas.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A sidebar não lista mais os links pra User Stories nem Documentation
- [ ] As rotas `/user-stories` e `/documentation` não renderizam mais essas páginas (redirecionam, junto com o catch-all já existente)
- [ ] Login, Dashboard e Projetos continuam funcionando exatamente como antes
- [ ] Os arquivos de código das páginas removidas da navegação continuam no repositório, intactos, só desconectados do roteamento
- [ ] Typecheck limpo e a suíte de testes existente continua passando
