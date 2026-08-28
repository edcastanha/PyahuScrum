# ADR-005: Stack Local para o MVP de 3 Dias (RabbitMQ + Firestore Emulado)

**Data:** 28 de Agosto de 2026
**Status:** Aceito

## Contexto

A [ADR-004](./004-arquitetura-orientada-a-eventos-google-cloud.md) define a arquitetura alvo do Pyahu Scrum sobre Google Cloud real (Pub/Sub, Cloud Run, Firestore, Vertex AI). O prazo real para uma demo funcional é de **3 dias**. Não há tempo para provisionar e depurar toda a infraestrutura gerenciada do GCP dentro desse prazo, e o projeto GCP existente ("Pyahu Scrum", com faturamento configurado) só precisa cobrir a peça que não tem substituto local equivalente: o **Vertex AI (Gemini)**.

## Decisão

Para o MVP dos 3 dias, o Agent Orchestrator roda inteiramente local via Docker Compose, com as seguintes escolhas de stack:

1. **Mensageria: RabbitMQ**, não Pub/Sub. O padrão de DLQ é implementado com o *dead-letter-exchange* nativo do RabbitMQ, equivalente funcional ao DLQ do Pub/Sub.
2. **Estado: Emulador oficial do Firestore**, não Firestore real. Usa o mesmo SDK de produção — o `onSnapshot()` de tempo real funciona igual, e a troca para o Firestore real (se/quando o projeto GCP crescer) não exige mudança de código, só de configuração de conexão.
3. **IA: Vertex AI SDK real**, contra o projeto GCP "Pyahu Scrum" já existente. É a única peça desta fase que não é local — as credenciais são provisionadas via um passo guiado (skill `wizard`), não inseridas manualmente no código ou no chat.
4. **Framework do worker: FastAPI** em `backend/`. Django (e seu Admin, cogitado para gestão de usuários) fica fora de escopo: a [ADR-002](./002-login-github-frontend-only.md) já estabeleceu que não há persistência de usuário nem auth de backend nesta fase.
5. **Escopo funcional dos 3 dias:** pipeline assíncrono ponta a ponta (Portfólio Interativo → RabbitMQ → Agent Orchestrator → Vertex AI → Firestore emulado → Portfólio Interativo via snapshot) + DLQ são obrigatórios. RAG (embeddings + busca vetorial) e a Hierarquia de Bloqueio (Human-in-the-Loop) ficam como *stretch goals*, nesta ordem de prioridade (HITL antes de RAG).
6. **Deploy:** só local, via Docker Compose. O backend não é publicado (o frontend já está no Easypanel via `7bac563`, isso não muda). Publicar o backend fica para depois do hackathon.

## Consequências

**Positivas**

- Zero dependência de provisionamento de infraestrutura gerenciada para o essencial da demo — só o acesso ao Gemini precisa de credencial real.
- O Firestore emulado usa o SDK de produção: migrar para Firestore real depois é troca de configuração, não de código.
- FastAPI mantém o worker leve e alinhado ao rigor de tipagem já adotado (ADR-003), sem o peso do Django para um escopo que ainda não tem modelo de usuário.

**Negativas / Riscos**

- RabbitMQ não é um substituto perfeito do Pub/Sub: o modelo de consumo é diferente (consumidor AMQP, não push HTTP), então o código do worker que lê da fila **não é portável 1:1** para Pub/Sub depois — só o Firestore é.
- Não confirmado se o emulador do Firestore suporta índice de busca vetorial nativo. Se não suportar, a Fatia 3 (RAG) precisa calcular similaridade de cosseno em Python, sem o índice nativo — a decidir quando/se essa fatia for atacada.
- A demo não fica acessível a jurados fora de uma apresentação ao vivo/gravada, já que o backend não é publicado nesta fase.

## Observações

Esta ADR não substitui a [ADR-004](./004-arquitetura-orientada-a-eventos-google-cloud.md) — o desenho alvo em GCP real continua sendo a direção; esta é a rota de implementação para o prazo imediato do hackathon.
