# Plano de Tarefas - Desenvolvimento do Portfólio Interativo

Este documento detalha as fases e tarefas para a implementação da aplicação "Portfólio Interativo".

## Fase 1: Configuração e Estrutura Base (Sprint 1)

**Objetivo:** Criar o esqueleto da aplicação, configurar o ambiente e implementar o layout principal.

- [x] **Tarefa 1.1:** Revisar e finalizar a configuração do projeto React com TypeScript.
- [x] **Tarefa 1.2:** Definir a estrutura de pastas para componentes, páginas, hooks e serviços.
- [x] **Tarefa 1.3:** Implementar o layout principal da aplicação (ex: `MainLayout`) com Sidebar e área de conteúdo.
- [x] **Tarefa 1.4:** Configurar o sistema de roteamento (ex: com `react-router-dom`) e criar as rotas iniciais (Dashboard, Projetos, etc.).
- [x] **Tarefa 1.5:** Estilizar os componentes base de acordo com a paleta de cores e tipografia definidas no PRD.

## Fase 2: Dashboard e Gerenciamento de Projetos (Sprint 2)

**Objetivo:** Implementar a visualização do dashboard e o CRUD básico para os projetos.

- [x] **Tarefa 2.1:** Desenvolver o componente `DashboardPage`.
- [x] **Tarefa 2.2:** Criar componentes de card para projetos (`ProjectCard`) e métricas (`MetricCard`).
- [x] **Tarefa 2.3:** Utilizar dados mockados para popular o dashboard.
- [x] **Tarefa 2.4:** Criar a página de listagem de projetos (`ProjectsPage`).
- [x] **Tarefa 2.5:** Implementar um formulário para adicionar e editar projetos.
- [x] **Tarefa 2.6:** Conectar o formulário para criar/atualizar a lista de projetos (estado local).

## Fase 3: Documentação Interativa (Sprint 3)

**Objetivo:** Integrar um editor de Markdown e permitir o gerenciamento de documentação por projeto.

- [ ] **Tarefa 3.1:** Pesquisar e escolher uma biblioteca de editor Markdown para React (ex: `react-markdown`, `react-mde`).
- [ ] **Tarefa 3.2:** Criar a seção de documentação na página de detalhes de um projeto.
- [ ] **Tarefa 3.3:** Implementar a funcionalidade para criar/editar o `README.md` de um projeto.
- [ ] **Tarefa 3.4:** Desenvolver a interface para listar e visualizar ADRs (Registros de Decisão de Arquitetura).
- [ ] **Tarefa 3.5:** Criar o formulário para adicionar um novo ADR a um projeto.

## Fase 4: Histórias de Usuário e Board Kanban (Sprint 4)

**Objetivo:** Implementar o sistema de gerenciamento de histórias de usuário.

- [ ] **Tarefa 4.1:** Desenvolver o componente de card para histórias de usuário (`UserStoryCard`).
- [ ] **Tarefa 4.2:** Criar a interface da board Kanban com colunas ("To Do", "In Progress", "Done").
- [ ] **Tarefa 4.3:** Implementar a funcionalidade de arrastar e soltar (drag-and-drop) para mover os cards entre as colunas.
- [ ] **Tarefa 4.4:** Desenvolver o formulário para criar e editar histórias de usuário.
- [ ] **Tarefa 4.5:** Associar as histórias de usuário a projetos específicos.

## Fase 5: Finalização e Polimento (Sprint 5)

**Objetivo:** Refinar a interface, garantir a responsividade e preparar para o deploy.

- [ ] **Tarefa 5.1:** Revisar toda a aplicação e aplicar as transições e estilos finos.
- [ ] **Tarefa 5.2:** Testar e ajustar a responsividade em diferentes tamanhos de tela (desktop, tablet, mobile).
- [ ] **Tarefa 5.3:** Substituir dados mockados por uma solução de persistência de dados (ex: LocalStorage, ou uma API backend se aplicável).
- [ ] **Tarefa 5.4:** Realizar testes de usabilidade e corrigir bugs.
- [ ] **Tarefa 5.5:** Preparar a aplicação para o deploy (configurar build de produção).
- [ ] **Tarefa 5.6:** Realizar o deploy da aplicação em uma plataforma (ex: Vercel, Netlify, GitHub Pages).
