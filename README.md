# Pyahu Scrum 🚀

Bem-vindo ao **Pyahu Scrum**, um framework autônomo de orquestração desenvolvido para a categoria *Taskmaster* do Google Agent Hackathon. 

Este projeto democratiza a engenharia de decisão: ele captura ideias brutas de negócio e, através de agentes assíncronos rodando em segundo plano, as traduz em especificações técnicas rigorosas (ADRs) e tickets de desenvolvimento executáveis.

## 🏗️ Estrutura do Repositório (Monorepo)

O projeto está dividido em duas camadas principais para garantir desacoplamento e escalabilidade:

*   **/frontend** (`PortifolioInterativo`): Interface de usuário e gestão visual.
*   **/backend** (`Agent Orchestrator`): Motor assíncrono em Python responsável pelas integrações com Google Cloud e GenAI SDK.
*   **/.agents**: Diretório de *skills* e diretrizes de comportamento do agente (baseado em melhores práticas de engenharia).

## ⚙️ Arquitetura de Software

A arquitetura orientada a eventos garante que a interface do usuário nunca fique bloqueada enquanto os agentes realizam o trabalho pesado.

### Diagrama C4
```mermaid
config:
  theme: mc
  fontFamily: '''Source Code Pro Variable'', monospace'
---
C4Container
    title Diagrama de Containers - Arquitetura Pyahu Scrum

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Person(user, "Gestor / Usuário", "Envia ideias e aprova o escopo")
    System_Ext(vertex, "Vertex AI", "Gemini 3.5 Flash", "LLM e embeddings")

    System_Boundary(pyahu_scrum, "Sistema Pyahu Scrum") {
        Container(portfolio, "Portfólio Interativo", "Web", "Gestão e aprovações")
        Container(worker, "Agent Orchestrator", "Cloud Run", "Coordena agentes e IA")
        ContainerDb(firestore, "Memória da Aplicação", "Firestore", "Estado, histórico e embeddings")
        ContainerQueue(pubsub, "Barramento de Eventos", "Pub/Sub + DLQ", "Processamento assíncrono")
       }

    Rel_D(user, portfolio, "Acessa", "HTTPS")
    Rel_D(portfolio, pubsub, "Publica requisição", "REST")
    Rel_D(worker, firestore, "Lê e grava dados", "SDK")
    Rel_L(firestore, portfolio, "Atualiza interface", "Tempo real")
    Rel_R(pubsub, worker, "Dispara pipeline", "Push")
    Rel_L(worker, pubsub, "Envia falhas", "DLQ")
    Rel_D(worker, vertex, "Consulta IA", "gRPC")
    
    UpdateRelStyle(firestore, portfolio, $offsetX="-95", $offsetY="0")
    UpdateRelStyle(portfolio, pubsub, $offsetX="-145" $offsetY="0")
    UpdateRelStyle(worker, firestore, $offsetX="-50", $offsetY="-25")
    UpdateRelStyle(worker, pubsub, $offsetX="-70", $offsetY="0")
    UpdateRelStyle(pubsub, worker, $offsetX="10", $offsetY="5")
    UpdateRelStyle(worker, vertex, $offsetX="10", $offsetY="15")
