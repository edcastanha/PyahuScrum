# 02: Credenciais do Vertex AI provisionadas (via skill wizard)

**What to build:** Um caminho guiado (via skill `wizard`) para provisionar e configurar as credenciais do Vertex AI (Gemini) contra o projeto GCP "Pyahu Scrum" já existente (billing configurado), para que o Agent Orchestrator consiga chamar o Gemini de verdade nas demos, sem nenhum segredo commitado no repositório.

**Blocked by:** None (can start immediately). Só bloqueia a verificação manual/demo com Gemini real do ticket 04 — não bloqueia os testes automatizados, que sempre usam um fake.

**Status:** ready-for-agent

- [ ] Existe um passo guiado (wizard) que leva o usuário a gerar/obter credenciais válidas do Vertex AI a partir do projeto GCP "Pyahu Scrum"
- [ ] As credenciais são carregadas via variável de ambiente/arquivo local ignorado pelo git, nunca commitadas
- [ ] Uma chamada de smoke-test ao Vertex AI (fora dos testes automatizados) confirma que a credencial funciona
- [ ] O procedimento fica documentado o suficiente para ser refeito caso a credencial expire ou seja rotacionada
