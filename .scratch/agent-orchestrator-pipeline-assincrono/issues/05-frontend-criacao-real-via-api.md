# 05: Frontend: criação real de pedido via API (substitui localStorage)

**What to build:** Ao submeter a ideia no Portfólio Interativo, o pedido passa a ser criado de verdade via chamada ao backend, substituindo a gravação direta em `localStorage`.

**Blocked by:** 03 (Recepção do pedido)

**Status:** ready-for-agent

- [ ] O formulário de criação de projeto chama o endpoint HTTP real do backend em vez de gravar direto em `localStorage`
- [ ] Um teste de frontend cobre a chamada de criação mockando `fetch` global, seguindo o padrão já usado em `githubAuthService.test.ts`
- [ ] Erros de rede/HTTP na criação são tratados e comunicados ao usuário, não silenciados
- [ ] Os projetos previamente existentes em `localStorage` (mock) continuam visíveis, sem quebrar a tela
