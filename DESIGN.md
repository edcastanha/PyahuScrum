---
name: PortifolioInterativo
description: Plataforma de gestão e showcase do portfólio profissional de um desenvolvedor Full Stack.
colors:
  ink: "#0F172A"
  ink-deep: "#1E293B"
  slate-mid: "#334155"
  text-muted: "#64748B"
  text-subtle: "#94A3B8"
  border: "#E2E8F0"
  border-mid: "#CBD5E1"
  surface: "#F8FAFC"
  surface-elevated: "#F1F5F9"
  canvas: "#FFFFFF"
  blue-primary: "#3B82F6"
  blue-deep: "#2563EB"
  blue-surface: "#EFF6FF"
  blue-border: "#BFDBFE"
  green-primary: "#10B981"
  green-deep: "#059669"
  red-signal: "#EF4444"
  amber-signal: "#F59E0B"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.blue-primary}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "#374151"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  input-focus:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  badge-info:
    backgroundColor: "{colors.blue-surface}"
    textColor: "#1D4ED8"
    rounded: "{rounded.md}"
  badge-success:
    backgroundColor: "#F0FDF4"
    textColor: "#15803D"
    rounded: "{rounded.md}"
---

# Design System: PortifolioInterativo

## 1. Overview

**Creative North Star: "The Proof of Work"**

O design em si é a demonstração de competência. Neste sistema, a interface não descreve habilidade técnica — ela a demonstra. Cada componente preciso, cada estado de interação mapeado, cada transição calibrada é um argumento silencioso entregue antes da primeira linha de código do portfólio ser lida.

A filosofia é de ferramenta séria: densidade informacional alta onde necessário, clareza cirúrgica em cada detalhe. Nenhum efeito visual compra lugar só por chamar atenção. A paleta slate profissional — uma família de neutros frios com um único sinal de ação azul — garante que o foco do usuário nunca seja roubado pela superfície. O verde confirmation aparece exclusivamente para estados de realização e presença do usuário no sistema.

Este sistema rejeita explicitamente dois modelos: o **SaaS genérico americano** — azul-e-branco intercambiável, cards padronizados, visual que poderia ser de qualquer produto B2B — e o **template de portfólio dev comum** — hero section com foto, seção "About Me", lista de skills com barras de progresso, formulário de contato. Aqui não há apresentação. Há trabalho visível.

**Key Characteristics:**
- Paleta slate profissional: família de neutros frios com um único sinal de ação cromática
- Tipografia system-ui: uma família, múltiplos papéis, zero dependência de fonte externa
- Elevação por camada tonal (#F8FAFC → #FFFFFF), sombras como resposta a estado — não decoração
- Vocabulário de estado completo em todos os componentes interativos
- Border radius conservador (6–8px): formas firmes, sem arredondamento excessivo
- O mono é reservado para dados de referência técnica (IDs, hashes) — nunca para texto de interface

## 2. Colors: The Slate Signal Palette

A paleta é construída sobre a família slate fria (#0F172A a #F8FAFC) com um único sinal de ação azul (#3B82F6) e um sinal de confirmação verde (#10B981). A raridade do azul é o ponto.

### Primary
- **Signal Blue** (#3B82F6): usado exclusivamente em ações primárias (botões de submit), estados de foco (focus rings de 3px, `box-shadow: 0 0 0 3px rgba(59,130,246,0.15)`), indicadores ativos (nav active, criteria dots, progress bars). Sua presença na tela é sinal de interatividade disponível.
- **Deep Blue** (#2563EB): hover sobre ações primárias e estados pressed. Nunca aparece em superfície de repouso.

### Secondary
- **Confirmation Green** (#10B981): avatar do usuário logado, botão CTA de login, badges de status "Done", estados de sucesso. Reservado para realização e presença ativa do usuário.
- **Deep Green** (#059669): ponto final do gradiente do botão de login. Não aparece no app principal.

### Neutral
- **Technical Ink** (#0F172A): toda tipografia primária — headings, títulos de card, logo, texto de formulário. A âncora absoluta do sistema.
- **Muted Slate** (#64748B): texto secundário — nav labels em repouso, descrições, subtítulos de sidebar.
- **Subtle Slate** (#94A3B8): texto terciário — hints, placeholders, metadados (storyId, subtítulos de login).
- **Border Default** (#E2E8F0): divisores, bordas de card, separadores de seção. A linha quase invisível.
- **Border Mid** (#CBD5E1): bordas em hover de cards, drag handles. Um grau mais presente.
- **Surface** (#F8FAFC): background de página, footer de cards, áreas recuadas no conteúdo.
- **Surface Elevated** (#F1F5F9): hover de nav items, recuo de inputs em context de button ghost.
- **Canvas** (#FFFFFF): cards, modals, sidebar, campos de input. A superfície de trabalho ativa.

### Named Rules
**The Signal Rule.** #3B82F6 aparece exclusivamente em estados acionáveis: botões primários, focus rings, estados ativos, indicadores de progresso. Usá-lo como cor decorativa ou separador visual anula seu significado como sinal de ação.

## 3. Typography

**Display/Body/Label Font:** System-ui stack (−apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif)
**Mono Font:** source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace

**Character:** Uma família única em múltiplos papéis. A sans-serif de sistema prioriza familiaridade e legibilidade sobre personalidade expressiva — a ferramenta some, o conteúdo aparece. O mono é cirúrgico e raro: apenas onde o dado precisa se identificar como técnico.

### Hierarchy
- **Display** (600, 2rem, lh 1.2): Heading de página principal (h1 do Dashboard, User Stories). Aparece uma vez por tela.
- **Headline** (600, 1.5rem, lh 1.3): Logo da sidebar, title do card de login. Raramente mais de um por tela.
- **Title** (600, 1.25rem, lh 1.4): Subtítulos de seção dentro de painéis e cards (`h2` de Dashboard sections).
- **Body** (400, 0.9375rem, lh 1.55): Texto principal de cards, descrições, formulários. Máximo 65–75ch por linha.
- **Label** (600, 0.875rem, lh 1.4): Rótulos de formulário, campos de input, headings de nav. Alto contraste para leitura rápida.
- **Caption** (500–600, 0.75rem, ls 0.01em): Edit buttons, error messages, timestamps. Raramente mais de uma linha.
- **Mono** (400, 0.6875rem): Story IDs (US-001), dados de referência. Nunca para texto de interface.

### Named Rules
**The One-Family Rule.** Nenhuma fonte display, nenhuma serif decorativa. A sans-serif de sistema elimina a carga de carregamento de fonte externa e sinaliza que este é um produto, não uma peça editorial.

## 4. Elevation

Este sistema usa camadas tonais como linguagem primária de profundidade, com sombras como sinal de estado — nunca como decoração. A superfície de página (#F8FAFC) suporta cards (#FFFFFF) que se distinguem pelo contraste tonal, não por sombras pronunciadas. A sombra mínima em repouso confirma a separação do card da superfície; sombras maiores aparecem apenas em resposta a interação.

### Shadow Vocabulary
- **Ambient** (`0 1px 3px rgba(0,0,0,0.07)`): cards e seções em repouso. Imperceptível — apenas confirma a separação tonal.
- **Hover Lift** (`0 4px 12px rgba(0,0,0,0.10)`): cards interativos em hover. Sinaliza que o elemento responde ao cursor.
- **Drag Elevation** (`filter: drop-shadow(0 12px 24px rgba(0,0,0,0.18))`): card em estado de drag. O maior sinal de elevação física do sistema.
- **Modal Layer** (`0 20px 60px rgba(0,0,0,0.25)`): modais sobre overlay escuro. Pico da hierarquia de elevação.
- **Dark Context** (`0 12px 32px rgba(0,0,0,0.35)`): card de login sobre superfície escura (#0F172A). Contexto de superfície invertido.

### Named Rules
**The Flat-By-Default Rule.** Superfícies ficam planas em repouso. Sombra é estado, não estilo. Se uma sombra aparece sem interação do usuário, é excesso decorativo.

## 5. Components

### Buttons
Precisos e funcionais. Sem gradientes no app principal, sem ícones decorativos. O primário comunica ação; o ghost comunica alternativa.

- **Shape:** Gently rounded (6px radius)
- **Primary:** Signal Blue sólido (#3B82F6) + texto canvas (#FFFFFF), padding 10px 20px, transition 0.15s
- **Primary Hover:** Deep Blue (#2563EB), sem mudança de tamanho ou sombra
- **Ghost:** Canvas bg (#FFFFFF), border 1px #D1D5DB, texto #374151; hover → bg #F9FAFB, border #9CA3AF
- **Focus:** ring `0 0 0 3px rgba(59,130,246,0.15)` — idêntico ao focus de inputs

### Chips / Badges
Vocabulário de status em dois eixos: prioridade (low/medium/high) e estado Kanban (todo/in-progress/done). Cada variante tem background tintado, texto escuro da mesma família de hue, border leve. São informativos — sem hover states.

- **Low / Done (green):** #F0FDF4 bg · #15803D text · #BBF7D0 border
- **Medium / Warning (amber):** #FFFBEB bg · #B45309 text · #FDE68A border
- **High / Error (red):** #FFF1F2 bg · #BE123C text · #FECDD3 border
- **Todo (slate):** #F1F5F9 bg · #475569 text · #CBD5E1 border
- **In Progress (blue):** #EFF6FF bg · #1D4ED8 text · #BFDBFE border

### Cards / Containers
A unidade visual central do sistema. Fundo canvas sobre superfície — profundidade tonal, não decorativa.

- **Corner Style:** Gently curved (8px radius)
- **Background:** Canvas (#FFFFFF) sobre Surface (#F8FAFC)
- **Shadow Strategy:** Ambient em repouso · Hover Lift em hover (ver Elevation)
- **Border:** 1px solid #E2E8F0 em repouso · 1px solid #CBD5E1 em hover
- **Internal Padding:** 1rem (body) · 0.4rem 1rem (footer)
- **Footer Pattern:** bg recuado (#F8FAFC) + border-top 1px #E2E8F0 para metadados e ações secundárias

### Inputs / Fields
Stroke-based, fundo canvas. Vocabulário de estado completo.

- **Style:** 1px border #D1D5DB · bg #FFFFFF · radius 6px · padding 0.625rem 0.75rem
- **Focus:** border → #3B82F6 · ring `0 0 0 3px rgba(59,130,246,0.15)`
- **Error:** border → #EF4444 · ring `0 0 0 3px rgba(239,68,68,0.15)`
- **Placeholder:** #9CA3AF
- **Disabled:** opacity 0.5, cursor not-allowed

### Navigation
Sidebar vertical de 260px, sempre visível em desktop, escondida em mobile atrás de toggle.

- **Style:** Canvas bg (#FFFFFF) · border-right 1px #E2E8F0
- **Nav items:** padding 0.75rem · radius 6px · texto #64748B · weight 500
- **Hover:** bg #F1F5F9 · sem mudança de cor de texto
- **Active:** bg #E0F2FE · texto #0284C7 — o único estado cromático permanente no nav fora de ação direta
- **Section labels:** 0.75rem · uppercase · letter-spacing 1px · weight 500 · #64748B
- **Mobile:** `transform: translateX(-100%)` em repouso · toggle button fixo em 1rem/1rem · overlay implícito

### Kanban Board
O componente signature do produto. Board de três colunas com drag-and-drop por status.

- **Layout:** Grid 3 colunas iguais · gap 1.5rem · colapsa para 1 coluna em ≤1024px
- **Column headers:** ícone + nome + contagem + barra de progresso com cor mapeada ao status (slate / blue / green)
- **Drop zone:** 2px dashed #E2E8F0 em idle · sólido e colorido ao dragging-over
- **Drag state:** card rotaciona 1.5deg + scale 1.02 + drop-shadow elevado — movimento físico deliberado, não animação decorativa
- **Empty state:** placeholder com ícone + texto orientativo por coluna

## 6. Do's and Don'ts

### Do:
- **Do** usar #3B82F6 exclusivamente em elementos acionáveis: botões primários, focus rings, estados ativos, indicadores de progresso. A raridade é o que faz o sinal funcionar.
- **Do** manter superfícies em repouso sem sombra pronunciada. O sistema usa tonal layering (#F8FAFC → #FFFFFF) como linguagem de profundidade.
- **Do** implementar o vocabulário completo de estados (hover, focus, active, error, disabled, loading) em todo componente interativo. Componente sem estados é componente incompleto.
- **Do** usar a família system-ui para todo texto de interface. A sans-serif de sistema é intencional.
- **Do** reservar o mono (source-code-pro) para IDs técnicos e dados de referência — storyId, hashes, versões. Nunca para labels de interface.
- **Do** usar o padrão de card footer (#F8FAFC + border-top) para metadados e ações secundárias, separando-os visualmente do corpo principal.
- **Do** manter border-radius entre 6px (componentes internos) e 8px (containers). Formas firmes — sem arredondamento excessivo que pareça consumer app.

### Don't:
- **Don't** usar azul como cor decorativa, separador visual, ou background de seção. A raridade de #3B82F6 é o ponto.
- **Don't** criar componentes com sombras pronunciadas em estado de repouso. Sombra em repouso é decoração; sombra em estado é comunicação.
- **Don't** replicar o padrão de **SaaS genérico americano**: cards idênticos em grid, hero metrics com números grandes, palette de azul-e-branco sem identidade específica, visual intercambiável com qualquer produto B2B.
- **Don't** reproduzir o **template de portfólio dev comum**: hero section com foto, seção "About Me", barras de progresso de skills, formulário de contato. O app demonstra competência através de como funciona, não através de como se apresenta.
- **Don't** adicionar fontes display ou serifs para "personalidade visual". A personalidade está na execução impecável, não na tipografia expressiva.
- **Don't** usar gradientes como estilo de botão no app principal. O gradiente verde do login CTA existe em contexto de superfície escura isolada — não é vocabulário geral.
- **Don't** usar glassmorphism, gradient text (`background-clip: text`), ou `border-left` colorida como elemento decorativo.
- **Don't** adicionar motion que não comunica estado. Animações de entrada de página, staggering sem propósito, e choreografia de seções são proibidos. O usuário está em fluxo de trabalho — não quer assistir ao app carregar.
