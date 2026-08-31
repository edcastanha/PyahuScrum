# ADR-006: Pipeline de Elicitação Interativa com Histórico no Firestore

**Data:** 2026-08-29  
**Status:** Aceito  
**Contexto:** Specs `specs/004-elicitacao-interativa/spec.md` · ADR-004 · ADR-005

---

## Contexto

O pipeline atual (Fatias 1 e 2) faz uma única chamada ao Gemini com a ideia bruta do usuário e gera artefatos sem contexto suficiente. A solução é adicionar uma Sessão de Elicitação de até 4 rodadas. Três questões arquiteturais centrais precisavam de decisão:

1. Onde persiste o histórico entre rodadas?
2. Como o Gemini recebe o contexto acumulado de cada rodada?
3. Como o Agent Orchestrator sabe quando parar de perguntar?

---

## Decisão

### 1. Histórico persiste no Firestore como subcoleção

O Firestore já é o barramento de estado do projeto (ADR-004). Cada Rodada de Elicitação é gravada em `projects/{id}/elicitacao/{rodada}` com a estrutura:

```json
{
  "rodada": 1,
  "perguntas": [...],
  "respostas": [...],
  "pronto": false,
  "timestamp": "..."
}
```

**Alternativa rejeitada:** manter o histórico em memória no processo do backend (RabbitMQ consumer). Rejeitada porque: o consumer pode reiniciar (falha transitória), o histórico seria perdido, e o Portfólio Interativo não conseguiria recuperar o estado via `onSnapshot`.

### 2. Contexto acumulado: montado pelo backend a cada chamada

A cada rodada, o Agent Orchestrator lê **todas** as rodadas anteriores do Firestore e monta um prompt único com o histórico completo antes de chamar o Gemini. O Gemini não mantém estado entre chamadas — cada chamada é stateless no lado da API.

**Alternativa rejeitada:** usar a API de chat com `history[]` do Gemini SDK (multiturn nativo). Rejeitada porque: o ADR-005 decidiu que o Agent Orchestrator usa `generate_content` simples (mais testável, sem dependência de sessão de chat do SDK). Manter consistência com a decisão existente.

### 3. Critério de parada: Gemini sinaliza + usuário pode forçar

O JSON de resposta do Gemini inclui `pronto: boolean`. Quando `true`, o frontend mostra o botão "Gerar agora" e o próximo `POST /projects/{id}/respostas` dispara a geração, não mais uma rodada. O usuário pode também forçar via botão "Gerar agora" a partir da Rodada 2, mesmo com `pronto: false`. Após 4 rodadas, o backend força a geração independente de `pronto`.

**Alternativa rejeitada:** lógica de parada só no backend (sem sinalização para o frontend). Rejeitada porque: viola o princípio HITL — o usuário perde o controle de quando avançar.

---

## Consequências

**Positivas:**
- Histórico durável mesmo com restart do consumer.
- Frontend pode recuperar estado de qualquer rodada via `onSnapshot`.
- Testável com Gemini fake (sem chamada real).
- Compatível com o padrão RabbitMQ → consumer existente (só adiciona endpoint novo).

**Negativas / Riscos:**
- Cada rodada lê o histórico completo do Firestore (N leituras por projeto por rodada) — custo aceitável para projetos com até 4 rodadas, mas a monitorar se o uso escalar.
- Prompt cresce a cada rodada com o histórico acumulado — testado dentro do context window do Gemini 2.5 Flash (1M tokens). Improvável ser problema em 4 rodadas.
- O JSON de resposta do Gemini com `pronto` e `perguntas` exige `RESPOSTA_INVALIDA` como fallback se o modelo desviar do formato — já coberto pelo `failure_reason` existente.
