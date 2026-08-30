# Spec — Elicitação Interativa e Geração de Artefatos (Fatia 3)

**Task:** t_elicitacao_interativa  
**Status:** Pronta para TDD  
**Versão:** 1.0  
**Origem:** Sessão de grill-with-docs (2026-08-29) · CONTEXT.md · ADR-004 · ADR-005 · `.agents/system-prompt.md`

---

## Problem Statement

O pipeline atual do Pyahu Scrum traduz uma ideia bruta em artefatos em **uma única chamada ao Gemini**, sem nenhuma troca com o usuário. O resultado é genérico: sem stack real, sem restrições reais, sem preferências reais. O usuário recebe um README e tickets que precisam ser reescritos do zero.

Além disso, o formulário de criação de projeto coleta `status` e `progresso` manualmente — campos que perdem o sentido quando o pipeline gerencia o ciclo de vida do projeto automaticamente.

## Solution

Substituir a chamada única por uma **Sessão de Elicitação** de até 4 rodadas: o Agent Orchestrator gera perguntas estruturadas (múltipla escolha + texto livre), o usuário responde via Cards de Elicitação no `PipelineStatusModal`, e só após contexto suficiente (sinalizado pelo Gemini ou forçado pelo usuário) os Artefatos Gerados são produzidos e entregues como ZIP com a estrutura canônica do repo.

O formulário de criação perde `status` e `progresso` — o status passa a refletir o estado do pipeline automaticamente.

## User Stories

1. Como usuário, quero criar um projeto com apenas nome e descrição da ideia, para não precisar preencher campos sem sentido no início.
2. Como usuário, quero receber perguntas de elicitação após criar o projeto, para que o Agent Orchestrator entenda meu contexto antes de gerar documentação.
3. Como usuário, quero responder cada pergunta com uma opção de múltipla escolha e/ou texto livre, para fornecer contexto rico sem precisar escrever do zero.
4. Como usuário, quero ver o botão "Enviar respostas" habilitado só quando responder todos os cards da rodada, para não enviar respostas incompletas acidentalmente.
5. Como usuário, quero poder forçar a geração dos artefatos antes de completar todas as rodadas, para ter controle sobre quando o processo avança.
6. Como usuário, quero baixar um ZIP com spec, ADR(s), PRD e tickets ao final, para descompactar no meu repositório sem fricção.
7. Como Agent Orchestrator, quero receber o conteúdo de `.agents/system-prompt.md` como system instruction em toda chamada ao Gemini, para aplicar as Skills e o rigor de qualidade em todas as rodadas, não só na primeira.
8. Como Agent Orchestrator, quero persistir o histórico completo da Sessão de Elicitação no Firestore, para manter contexto entre rodadas sem reenviar tudo no body da requisição.
9. Como Agent Orchestrator, quero sinalizar `pronto: true` quando avaliar que tenho contexto suficiente, para que o frontend mostre o botão "Gerar agora" ao usuário.
10. Como Agent Orchestrator, quero gerar os Artefatos na estrutura canônica (`specs/<slug>/`, `docs/adr/`, `.scratch/<slug>/tickets/`), para que o ZIP seja descompactável direto na raiz do repo do usuário.

## Implementation Decisions

### Formulário de Criação (frontend)
- Remover `status` e `progresso` do `ProjectForm` e da entidade `Project`.
- `status` passa a ser campo somente-leitura derivado do pipeline (mapeado de `ProjectStatus` do backend).
- `Project.id` muda de `number` (localStorage `Date.now()`) para `string` (ID do Firestore).

### Sessão de Elicitação (backend)
- Novo endpoint: `POST /projects/{id}/respostas` — recebe `{rodada: number, respostas: [{pergunta_id, opcao?, texto?}]}`.
- O Agent Orchestrator mantém histórico em `Firestore: projects/{id}/elicitacao/{rodada}`.
- Fluxo de rodada:
  1. Recebe respostas → salva no Firestore.
  2. Monta prompt com: system instruction (`.agents/system-prompt.md`) + ideia original + histórico completo de rodadas anteriores.
  3. Chama Gemini. Resposta esperada:
     ```json
     {
       "pronto": false,
       "perguntas": [
         {
           "id": "q1",
           "texto": "Qual a stack de backend?",
           "opcoes": ["Python/FastAPI", "Node/Express", "Java/Spring", "Outro"],
           "permite_texto": true
         }
       ]
     }
     ```
     — ou, quando `pronto: true`:
     ```json
     { "pronto": true, "perguntas": [] }
     ```
  4. Atualiza Firestore: `status: ELICITANDO`, `rodada_atual`, `perguntas` da nova rodada.
  5. Se `pronto: true` ou `rodada >= 4`: chama geração dos artefatos.
- Primeira chamada (sem respostas ainda): `POST /projects` já dispara a Rodada 1.

### Geração de Artefatos (backend)
- `generate_artifacts()` recebe histórico completo da Sessão de Elicitação.
- Prompt atualizado: gera `spec.md`, `prd.md`, `adrs: [string]`, `tickets: [string]` (não mais `readme`).
- Salva no Firestore: `status: CONCLUIDO`, `artefatos: {spec, prd, adrs[], tickets[]}`.
- Endpoint novo: `GET /projects/{id}/download` — monta ZIP em memória com a estrutura canônica e retorna `application/zip`.

### Cards de Elicitação (frontend)
- `PipelineStatusModal` detecta `status === 'ELICITANDO'` via `onSnapshot` e renderiza os Cards de Elicitação.
- Cada Card de Elicitação: pergunta + opções como botões de seleção (multi ou single) + `<textarea>` opcional.
- Estado de resposta mantido localmente no componente. Botão "Enviar respostas" ativa quando todos os cards têm pelo menos opção selecionada ou texto não vazio.
- Botão "Gerar agora" aparece sempre que `pronto: true` vem do backend (ou a partir da rodada 2).
- Estado `CONCLUIDO`: exibe botão "Baixar ZIP" que chama `GET /projects/{id}/download`.

### Status do Pipeline (ambos)
- Novo estado `ELICITANDO` adicionado ao `ProjectStatus` enum no backend e ao `STATUS_LABELS` no frontend.
- `CONCLUIDO` passa a incluir `artefatos` em vez de `readme`.

## Testing Decisions

- **Backend (unitário):** prompt de elicitação gerado corretamente com histórico; `pronto: true` após 4 rodadas independente do Gemini; ZIP gerado com estrutura canônica (sem chamada real ao Gemini — fake injetado).
- **Backend (integração):** fluxo ponta a ponta com Gemini fake: `POST /projects` → Firestore com `ELICITANDO` + perguntas → `POST /projects/{id}/respostas` × N → Firestore com `CONCLUIDO` + artefatos → `GET /projects/{id}/download` retorna ZIP.
- **Frontend (unitário):** Card de Elicitação com todas as variantes (só opções, só texto, ambos); botão "Enviar" desabilitado com card não respondido; botão habilitado com todos respondidos.
- **Frontend (integração):** `PipelineStatusModal` com Firestore fake alternando entre `ELICITANDO` e `CONCLUIDO`.
- Nenhum teste bate no Gemini real (custo + não-determinismo).

## Out of Scope

- RAG (Recuperação de Histórico por embeddings) — previsto na ADR-004, ainda Fatia 4.
- Push direto via GitHub API para o repo do usuário — ZIP é suficiente nesta fatia.
- Múltiplas seleções por card (multi-select) — single-select + texto livre cobre o caso de uso.
- Internacionalização do output (artefatos sempre em PT-BR nesta fatia).
