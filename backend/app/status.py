from enum import Enum


class ProjectStatus(str, Enum):
    """Valores do campo de status de um projeto no Firestore. Ver CONTEXT.md."""

    TRIAGEM_INICIAL = "TRIAGEM_INICIAL"
    TRIAGEM_EM_ANDAMENTO = "TRIAGEM_EM_ANDAMENTO"
    ELICITANDO = "ELICITANDO"           # Aguardando respostas do usuário (Fatia 3)
    GERANDO_ADR = "GERANDO_ADR"
    CONCLUIDO = "CONCLUIDO"
    AGUARDANDO_APROVACAO_ESCOPO = "AGUARDANDO_APROVACAO_ESCOPO"
    FALHA_PROCESSAMENTO = "FALHA_PROCESSAMENTO"
    FALHA_DLQ = "FALHA_DLQ"


class FailureReason(str, Enum):
    """Classificação de por que um processamento falhou. Grava no campo
    failure_reason do Firestore, junto com o status. Ver ticket 07/08."""

    QUOTA_EXCEDIDA = "QUOTA_EXCEDIDA"
    ERRO_TRANSITORIO = "ERRO_TRANSITORIO"
    RESPOSTA_INVALIDA = "RESPOSTA_INVALIDA"
