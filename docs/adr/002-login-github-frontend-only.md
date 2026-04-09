# ADR-002: Login via API Pública do GitHub no Frontend

**Status:** Aceito

**Data:** 2026-04-08

## Contexto

O cenário atual do projeto foi redefinido para uma entrega **frontend-only** no diretório `DevPortfolio`. Nesta fase, não haverá backend dedicado, OAuth server-side nem persistência em MongoDB. O objetivo imediato é permitir que a home funcione como tela de login usando dados públicos do GitHub.

## Decisão

A autenticação inicial será implementada no frontend por meio da consulta ao endpoint público `https://api.github.com/users/{username}`. A sessão autenticada será mantida localmente no navegador com `localStorage`, e as rotas internas da aplicação serão protegidas com redirecionamento para a tela de login quando não houver sessão ativa.

## Justificativa

1. O escopo atual exige uma solução simples, rápida de validar e compatível com a base já existente em React + TypeScript.
2. O uso da API pública do GitHub reduz a necessidade de infraestrutura adicional nesta fase.
3. A persistência local permite manter a experiência de login após refresh sem introduzir dependências de backend.
4. A proteção de rotas garante uma separação clara entre a área autenticada e a tela inicial de acesso.
5. O fluxo pode evoluir depois para um backend real sem quebrar a experiência atual, desde que a sessão e o roteamento preservem a mesma intenção de uso.

## Alternativas Consideradas

- **OAuth server-side com backend próprio:** descartado nesta fase por aumentar o custo de implementação e exigir infraestrutura não necessária para o objetivo atual.
- **Persistência em MongoDB para sessão/autenticação:** descartada por não fazer parte do escopo atual e por depender de backend.
- **Sessão apenas em memória:** descartada por não sobreviver a refresh e degradar a usabilidade.

## Consequências

### Positivas

- Implementação mais rápida e simples.
- Menor complexidade operacional.
- Experiência inicial consistente com login e logout já no frontend.
- Base adequada para evolução incremental do projeto.

### Negativas / Riscos

- A autenticação não representa um login seguro de produção.
- A dependência da API pública do GitHub pode sofrer com rate limit ou indisponibilidade temporária.
- A sessão local não é compartilhada entre dispositivos ou navegadores.

## Observações

Este ADR complementa a decisão de tecnologia registrada no ADR-001 e documenta o comportamento arquitetural específico da fase atual.
