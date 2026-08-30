# PRD — Elicitação Interativa e Geração de Artefatos (Fatia 3)

**Versão:** 1.0  
**Data:** 2026-08-29  
**Status:** Aprovado para implementação  
**Spec:** `specs/004-elicitacao-interativa/spec.md`

---

## Objetivo do Produto

Transformar o Pyahu Scrum de um gerador automático de artefatos genéricos em um **Tech Lead Virtual interativo**: capaz de fazer as perguntas certas, entender o contexto real do projeto do usuário e entregar documentação técnica de qualidade que o usuário possa usar imediatamente no seu repositório.

## Usuário-alvo

Desenvolvedor solo ou tech lead que tem uma ideia de projeto e precisa de documentação técnica estruturada (spec, ADR, PRD, tickets) como ponto de partida, sem gastar horas escrevendo do zero.

## Problema atual (evidência)

O pipeline atual (Fatia 1+2) gera artefatos com base só em nome e descrição do projeto — sem saber stack, tipo de sistema, restrições, público-alvo ou preferências arquiteturais. O output é genérico e requer retrabalho extenso.

## Proposta de valor desta fatia

- **Antes:** usuário cria projeto → Gemini gera artefatos genéricos → usuário reescreve tudo.
- **Depois:** usuário cria projeto → Gemini faz até 4 rodadas de perguntas → artefatos contextualizados → download ZIP → descompacta no repo → começa a desenvolver.

---

## Critérios de Aceite (produto)

### CA-1 — Formulário simplificado
- O formulário de criação de projeto tem apenas **Nome** e **Descrição**.
- Não há campos de Status ou Progresso na criação.
- Ao salvar, o pipeline é disparado automaticamente.

### CA-2 — Rodadas de elicitação
- Após criar o projeto, o `PipelineStatusModal` exibe os Cards de Elicitação da Rodada 1.
- Cada card tem: texto da pergunta, botões de opção (A, B, C…) e campo de texto livre opcional.
- O botão "Enviar respostas" fica **desabilitado** enquanto algum card da rodada não tiver resposta.
- Ao enviar, o modal atualiza em tempo real com a próxima rodada ou com os artefatos.

### CA-3 — Controle do usuário
- A partir da Rodada 2, aparece o botão **"Gerar agora"** para forçar a geração sem mais rodadas.
- O botão também aparece imediatamente se o Gemini sinalizar `pronto: true`.

### CA-4 — Limite de rodadas
- Após 4 rodadas respondidas, o pipeline gera os artefatos automaticamente, sem nova pergunta.

### CA-5 — Download dos artefatos
- Ao concluir, o modal exibe botão **"Baixar ZIP"**.
- O ZIP contém: `specs/<slug>/spec.md`, `specs/<slug>/prd.md`, `docs/adr/<N>-<slug>.md`, `.scratch/<slug>/tickets/NN-<ticket>.md`.
- Descompactar o ZIP na raiz de qualquer repo não gera conflito com arquivos existentes (prefixos de pasta únicos por slug).

### CA-6 — Histórico persistido
- Cada rodada e suas respostas ficam gravadas no Firestore (`projects/{id}/elicitacao/{rodada}`).
- Recarregar a página não perde o estado da sessão.

### CA-7 — Qualidade dos artefatos
- A spec gerada contém: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope.
- Os tickets são vertical slices com critérios de aceite testáveis.
- As ADRs justificam decisões arquiteturais reais (não genéricas).

---

## Métricas de sucesso (pós-lançamento)

- Usuário consegue descompactar o ZIP e usar os artefatos sem edição manual nos campos de contexto (stack, tipo, restrições) — que foram coletados na elicitação.
- Taxa de geração com pelo menos 2 rodadas completadas > 70% (proxy de que o usuário está engajado com as perguntas).
