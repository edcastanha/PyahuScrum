# ADR-003: Adoção do Framework 'Skills' de Matt Pocock para Agentes Autônomos

**Status:** Aceito

**Data:** 2026-08-27

## Contexto

O Pyahu Scrum orquestra agentes de IA para traduzir requisitos de negócio em especificações técnicas e tickets. Inicialmente, o LLM gerava artefatos baseados em heurísticas genéricas de desenvolvimento. No entanto, para que o sistema atue como um verdadeiro *Taskmaster* e entregue código e documentação em nível de senioridade, o agente precisa ser restrito por padrões de engenharia modernos, testáveis e focados em tipagem forte (TypeScript).

## Decisão

Adotamos o repositório [mattpocock/skills](https://github.com/mattpocock/skills) como a base de conhecimento e matriz de competência obrigatória para todos os agentes do sistema. As diretrizes foram extraídas e injetadas no diretório `.agents/`, servindo como *system prompt* estrito e validadores de *Function Calling* para o Gemini 3.5 Flash.

## Justificativa

1. **Tipagem Forte como Padrão:** O ecossistema Matt Pocock é construído sobre Zod, TypeScript e patterns de type safety — exatamente o rigor que o Pyahu Scrum exige nos tickets e na base `frontend/`.
2. **Validação Funcional, Não Declarativa:** Skills substituem heurísticas vagas por regras executáveis e verificáveis (`z.validate`, `@ai-sdk/zod`), garantindo que artefatos gerados passam por checkpoints objetivos antes de sair dos agentes.
3. **Ecosistema Consolidado:** A comunidade Matt Pocock já possui centenas de skills cobrindo React, Next.js, tRPC, testing, performance e acessibilidade. Podemos compos tar skills específicas sem reinventar a roda.
4. **Alinhamento com Arquitetura Existente:** O frontend (`DevPortfolio`) já usa React + TypeScript + create-react-app. As skills fornecem diretrizes nativamente compatíveis com essa stack.

## Alternativas Consideradas

- **Prompt engineering manual para cada tarefa:** descartado por ser intratável na escala — não há limite prático para cobrir todos os cenários apenas com prompts textuais.
- **Repositório próprio de regras (custom agent rules):** viável a longo prazo, mas representa duplicação de esforço contra uma base de conhecimento já madura e mantida pela comunidade.
- **Uso exclusivo de MCP tools para validação:** complementa as skills, mas não resolve a camada de conhecimento semântico (patterns, anti-patterns, conventions) que as skills oferecem.

## Consequências

### Positivas

- Agentes agora geram tickets com critérios de aceite focados em *Type Safety* e padrões de projeto consolidados.
- A interface do `PortifolioInterativo` e os processos de backend ganham uma validação autônoma de qualidade de código.
- Redução drástica de artefatos subqualificados — skills agem como filtros em tempo real durante a geração.
- Capacidade de estender o sistema com novas skills conforme a stack evolui (e.g., mobile, GraphQL, etc.).

### Negativas / Riscos

- Artefatos legados (ADRs e Tasks geradas anteriormente) estão fora de conformidade com o novo rigor técnico.
- Dependência de repositório externo: mudanças breaking nas skills podem exigir adaptações pontuais no `.agents/`.
- Curva de aprendizado para membros da equipe que não estão familiarizados com o modelo de skills ZOD-based.

### Mitigação

Um fluxo em background será acionado para que os próprios agentes auditem e reescrevam os documentos legados, elevando-os ao novo padrão de *skills* sem travar o uso diário do sistema. O repositório `mattpocock/skills` será clonado como git submodule sob `.agents/skills/`, garantindo versionamento fixo e auditabilidade.

## Referências

- Repositório base: https://github.com/mattpocock/skills
- Documentação: https://www.skill.com
- Estrutura criada: `.agents/skills/` (submodule), `.agents/system-prompt.md` (prompt injetado)
