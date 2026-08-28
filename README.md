# Pyahu Scrum 🚀

Bem-vindo ao **Pyahu Scrum**, um framework autônomo de orquestração desenvolvido para a categoria *Taskmaster* do Google Agent Hackathon. 

Este projeto democratiza a engenharia de decisão: ele captura ideias brutas de negócio e, através de agentes assíncronos rodando em segundo plano, as traduz em especificações técnicas rigorosas (ADRs) e tickets de desenvolvimento executáveis.

## 🏗️ Estrutura do Repositório (Monorepo)

O projeto está dividido em duas camadas principais para garantir desacoplamento e escalabilidade:

*   **/frontend** (`DevPortfolio`): Interface de usuário e gestão visual.
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

```

### Motor de Recuperação de Histórico (RAG)

Para garantir que as novas ADRs e tickets respeitem o histórico do projeto e regras de negócio prévias, o backend utiliza o **Vertex AI Text Embeddings** em conjunto com o **Firestore Vector Search**.

A similaridade entre a nova requisição $q$ e os documentos históricos $d$ é calculada nativamente via aproximação de cosseno:

$$\text{sim}(q,d)=\frac{q\cdot d}{\|q\|\|d\|}=\frac{\sum_{i=1}^{n}q_id_i}{\sqrt{\sum_{i=1}^{n}q_i^2}\sqrt{\sum_{i=1}^{n}d_i^2}}$$

## 🛠️ Tecnologias Utilizadas

**Inteligência & Core**

* Google GenAI SDK (Python)
* Vertex AI (Gemini 3.5 Flash & Embeddings)

**Infraestrutura & Backend (Google Cloud)**

* Cloud Run (Serverless Worker)
* Cloud Pub/Sub (Eventos e Dead Letter Queue)
* Firestore (Banco de Dados de Documentos e Vetorial)
* Docker & GitHub Actions (CI/CD)

**Frontend**

* React / TypeScript (Portfólio Interativo)

## 🚀 Como Executar Localmente

**1. Clone o repositório**

```bash
git clone [https://github.com/edcastanha/PyauScrum.git](https://github.com/edcastanha/PyauScrum.git)
cd PyauScrum

```

**2. Configuração do Backend (Worker)**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
# Configure suas credenciais do GCP no arquivo .env
python main.py

```

**3. Configuração do Frontend**

```bash
cd ../frontend
npm install
npm run dev

```

## 🛡️ Governança e Human-in-the-Loop

O Pyahu Scrum implementa uma política estrita de resiliência. Mudanças de escopo sensíveis detectadas pelo agente pausam a execução e alteram o status no Firestore para `AGUARDANDO_APROVACAO_ESCOPO`. O processamento só é retomado (via Pub/Sub) após a aprovação explícita do usuário no front-end.
