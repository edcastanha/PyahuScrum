# ADR-001: Escolha de Tecnologia para o Frontend

**Status:** Proposto

**Data:** 2025-06-23

## Contexto

Para o desenvolvimento do "Portfólio Interativo", precisamos de uma tecnologia de frontend que permita criar uma interface de usuário rica, reativa e de fácil manutenção. A aplicação exige componentes reutilizáveis, gerenciamento de estado eficiente e um ecossistema robusto para suportar funcionalidades como edição de texto, drag-and-drop e visualização de dados.

## Decisão

A tecnologia escolhida para o desenvolvimento do frontend é **React com TypeScript**.

## Justificativa

1.  **Ecossistema e Comunidade:** React é uma das bibliotecas de UI mais populares, com uma vasta comunidade e um ecossistema rico em ferramentas, bibliotecas e componentes prontos, o que acelera o desenvolvimento.

2.  **Componentização:** A arquitetura baseada em componentes do React se alinha perfeitamente com os requisitos do projeto, que prevê múltiplos componentes reutilizáveis (cards, seções, editor, etc.).

3.  **TypeScript para Escalabilidade:** O uso de TypeScript adiciona tipagem estática ao JavaScript, o que melhora a qualidade do código, facilita a refatoração e ajuda a prevenir bugs em tempo de desenvolvimento, tornando a aplicação mais robusta e escalável.

4.  **Base de Código Existente:** Aproveitar a estrutura de projeto já existente (`create-react-app` com TS) economiza tempo de configuração inicial e mantém a consistência com o que já foi iniciado.

5.  **Habilidades Relevantes:** React é uma habilidade central para muitos desenvolvedores Full Stack, o que torna o projeto relevante para o público-alvo.

## Consequências

- **Positivas:**
    - Rápido desenvolvimento da UI com componentes reutilizáveis.
    - Código mais seguro e de fácil manutenção graças ao TypeScript.
    - Acesso a uma vasta gama de bibliotecas para funcionalidades complexas.
    - A aplicação servirá como um excelente exemplo de um projeto React moderno no portfólio.

- **Negativas/Riscos:**
    - A curva de aprendizado pode ser um pouco maior para desenvolvedores não familiarizados com o ecossistema React ou TypeScript.
    
    - O gerenciamento de estado em aplicações React complexas pode exigir a adoção de bibliotecas adicionais (como Redux, Zustand ou Context API), adicionando uma camada extra de complexidade.
