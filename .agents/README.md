# .agents/ — Skills Infrastructure for Pyahu Scrum

Este diretório contém a infraestrutura de skills que governa todos os agentes autônomos do Pyahu Scrum.

## Estrutura

```
.agents/
├── system-prompt.md    ← Diretrizes obrigatórias injetadas como system prompt para Gemini 3.5 Flash
├── skills/             ← Submodule: repositório mattpocock/skills (referência imutável)
│   ├── .agents/        ← Instalação e invocações das skills originais
│   ├── skills/         ← SKILL.md de cada skill individual
│   └── CONTEXT.md      ← Glossário compartilhado original
└── README.md           ← Este arquivo
```

### Arquivos gerados pelo projeto

- `system-prompt.md` — Mapeamento das skills do submodule para regras executáveis no pipeline Pyahu Scrum. **Este é o único arquivo editável nesta pasta.**

### Diretivas

1. **Nunca editar diretamente** `.agents/skills/` — é um git submodule. Atualizar com `git submodule update --remote`.
2. **Sempre ler** `system-prompt.md` antes de executar qualquer operação de agente.
3. Configurações de domínio (issue tracker, triage labels, glossário) estão em `docs/agents/`.

## Referências

- [mattpocock/skills](https://github.com/mattpocock/skills) — Repositório base das skills
- ADR-003: `docs/adr/003-framework-skills-matt-pocock-agentes-autonomos.md` — Justificativa arquitetural completa
