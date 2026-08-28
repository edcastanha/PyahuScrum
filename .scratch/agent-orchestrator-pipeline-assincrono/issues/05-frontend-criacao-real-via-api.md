# 05: Frontend: criação real de pedido via API (substitui localStorage)

**What to build:** Ao submeter a ideia no Portfólio Interativo, o pedido passa a ser criado de verdade via chamada ao backend, substituindo a gravação direta em `localStorage`.

**Blocked by:** 03 (Recepção do pedido)

**Status:** done

- [x] O formulário de criação de projeto chama o endpoint HTTP real do backend **em paralelo** ao `localStorage`, não em substituição (decisão de produto tomada com o usuário durante a implementação — ver nota abaixo)
- [x] Um teste de frontend cobre a chamada de criação mockando `fetch` global, seguindo o padrão já usado em `githubAuthService.test.ts`
- [x] Erros de rede/HTTP na criação são tratados e comunicados ao usuário, não silenciados
- [x] Os projetos previamente existentes em `localStorage` (mock) continuam visíveis, sem quebrar a tela

## Nota de execução

O ticket original previa "substituir" o `localStorage`, mas o `ProjectForm` existente coleta `name/description/status/progress` — um contrato diferente do que `POST /projects` espera (`idea` livre, ticket 03). Perguntei ao usuário como reconciliar; a decisão foi manter o `ProjectForm` sem nenhuma mudança de UX e disparar o backend em paralelo, best-effort, com uma `idea` derivada de `name + description`. O checkbox 1 foi fechado sob essa interpretação, não a literal.
