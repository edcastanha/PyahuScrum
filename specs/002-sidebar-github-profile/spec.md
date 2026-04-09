# Feature Specification: Exibição de Perfil Autenticado no Sidebar

**Feature Branch**: `002-sidebar-github-profile`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Vamos focar nos ajustes no componente sidebar. Adicionando dados do User proveniente da conta autenticada via GitHub. Usar primeiro name no nome, avatar no elemento de avatar e location no subtitulo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exibir Nome e Avatar Reais no Sidebar (Priority: P1)

Como usuário autenticado, quero ver meu nome e minha foto de perfil reais no rodapé do sidebar para reconhecer imediatamente que estou logado na conta correta.

**Why this priority**: É a principal evidência visual de autenticação e confiança do usuário na sessão ativa.

**Independent Test**: Pode ser testado autenticando com uma conta válida e verificando se o bloco de perfil do sidebar mostra o primeiro nome e a imagem da conta.

**Acceptance Scenarios**:

1. **Given** que existe sessão autenticada com nome e avatar disponíveis, **When** o usuário acessa uma página interna, **Then** o sidebar exibe o primeiro nome da conta e a foto de perfil correta.
2. **Given** que existe sessão autenticada sem nome completo preenchido, **When** o sidebar é renderizado, **Then** o sistema usa um identificador alternativo estável para o campo de nome.

---

### User Story 2 - Exibir Localização do Perfil (Priority: P2)

Como usuário autenticado, quero ver a localização da minha conta no subtítulo do perfil do sidebar para reforçar meu contexto de identidade.

**Why this priority**: Complementa o resumo do perfil e melhora personalização, mas não bloqueia o uso principal.

**Independent Test**: Pode ser testado com conta que possui localização e com conta sem localização, validando exibição correta em ambos os casos.

**Acceptance Scenarios**:

1. **Given** que a conta autenticada possui localização, **When** o sidebar carrega, **Then** o subtítulo mostra a localização do perfil.
2. **Given** que a conta autenticada não possui localização, **When** o sidebar carrega, **Then** o subtítulo mostra um texto de fallback amigável.

---

### User Story 3 - Robustez Visual em Falhas de Dados (Priority: P3)

Como usuário autenticado, quero que o perfil do sidebar continue legível mesmo quando parte dos dados não estiver disponível para não perder referência de quem está logado.

**Why this priority**: Reduz risco de inconsistência visual e evita quebra de layout em cenários de dados incompletos.

**Independent Test**: Pode ser testado simulando ausência de avatar, ausência de nome e ausência de localização e validando que o bloco mantém renderização estável.

**Acceptance Scenarios**:

1. **Given** ausência de avatar, **When** o sidebar exibe o perfil, **Then** um avatar substituto textual é apresentado sem distorção visual.
2. **Given** ausência de múltiplos atributos de perfil, **When** o sidebar é renderizado, **Then** os campos usam fallbacks definidos e o layout permanece íntegro.

### Edge Cases

- Perfil autenticado com nome de uma palavra apenas deve manter o mesmo valor no campo principal.
- Perfil autenticado com espaços extras antes/depois do nome deve exibir valor normalizado.
- Perfil autenticado com avatar indisponível temporariamente não deve quebrar o bloco visual do perfil.
- Sessão parcialmente restaurada (ex.: sem location) deve continuar exibindo resumo consistente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir no sidebar um resumo de perfil baseado na conta autenticada atual.
- **FR-002**: O sistema MUST exibir no campo principal do nome apenas o primeiro nome disponível no perfil do usuário.
- **FR-003**: O sistema MUST exibir a imagem de avatar do perfil autenticado no elemento de avatar do sidebar.
- **FR-004**: O sistema MUST exibir a localização do perfil no subtítulo do resumo do sidebar.
- **FR-005**: O sistema MUST aplicar fallback legível quando o nome do perfil estiver ausente.
- **FR-006**: O sistema MUST aplicar fallback legível quando a localização do perfil estiver ausente.
- **FR-007**: O sistema MUST aplicar fallback visual quando o avatar não estiver disponível, preservando o layout.
- **FR-008**: O sistema MUST manter o bloco de perfil estável em diferentes estados de dados, sem sobreposição ou quebra visual.

### Key Entities *(include if feature involves data)*

- **Authenticated Profile**: Representa os dados da conta autenticada usados para personalização visual (nome, avatar, localização, identificador).
- **Sidebar Profile Summary**: Representa a projeção visual desses dados no rodapé da navegação lateral, com regras de fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em pelo menos 95% das sessões autenticadas com dados completos, o sidebar exibe nome e avatar corretos na primeira renderização.
- **SC-002**: Em 100% dos testes de ausência de localização, o subtítulo apresenta fallback amigável sem campo vazio.
- **SC-003**: Em 100% dos testes de ausência de avatar, o sistema apresenta avatar substituto sem quebra visual do componente.
- **SC-004**: A identificação da conta no sidebar é compreendida por pelo menos 90% dos usuários em teste rápido de validação visual.

## Assumptions

- Existe uma sessão autenticada antes de acessar as rotas internas em que o sidebar é exibido.
- O resumo de perfil no sidebar não altera permissões nem controle de acesso, apenas exibição de identidade.
- O comportamento de fallback deve priorizar clareza visual em vez de ocultar o bloco de perfil.
- A atualização desta feature é restrita ao resumo de perfil do sidebar nesta fase.
