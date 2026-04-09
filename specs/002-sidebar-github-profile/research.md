# Research - Exibição de Perfil Autenticado no Sidebar

## Decisão 1: Regra de nome no resumo de perfil

- Decision: Exibir primeiro nome de `name`; fallback para `login`; fallback final para "Usuário".
- Rationale: Mantém personalização quando disponível e garante identificação estável em perfis incompletos.
- Alternatives considered:
  - Mostrar `name` completo (rejeitado: pode poluir layout em nomes longos).
  - Mostrar somente `login` (rejeitado: perde personalização quando `name` existe).

## Decisão 2: Regra de localização no subtítulo

- Decision: Exibir localização completa do perfil; fallback para "Localização não informada".
- Rationale: Preserva contexto do usuário sem deixar campo vazio.
- Alternatives considered:
  - Normalizar para país/região (rejeitado: exige parsing não confiável).
  - Omitir localização (rejeitado: reduz valor informacional do resumo).

## Decisão 3: Fallback visual de avatar

- Decision: Em ausência de imagem, renderizar até 2 iniciais derivadas do nome exibido.
- Rationale: Evita quebras visuais e mantém identificação rápida do usuário.
- Alternatives considered:
  - Ícone fixo genérico (rejeitado: menor distinção visual entre usuários).
  - Letra única fixa (rejeitado: menor utilidade para reconhecimento).

## Decisão 4: Estratégia de atualização de perfil

- Decision: Atualizar dados de perfil a cada novo acesso autenticado; sem sessão/autenticação, redirecionar para login.
- Rationale: Reduz risco de dados obsoletos sem introduzir refresh manual adicional no fluxo principal.
- Alternatives considered:
  - Atualização apenas manual (rejeitado: maior chance de dados stale no sidebar).
  - Reconsulta em toda navegação interna (rejeitado: custo de chamadas desnecessário e maior risco de rate limit).

## Decisão 5: Limite de escopo técnico

- Decision: Manter implementação frontend-only sem backend dedicado nesta fase.
- Rationale: Alinhado ao PRD atualizado e à estratégia incremental do projeto.
- Alternatives considered:
  - Adicionar backend para cache/autenticação nesta etapa (rejeitado: fora de escopo da release atual).