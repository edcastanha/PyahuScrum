from app.dlq_sweeper import sweep_dlq
from app.firestore_client import get_client
from app.messaging import QUEUE_NAME, get_connection
from app.status import FailureReason, ProjectStatus


def _create_failed_project(failure_reason: FailureReason, attempts: int = 3) -> str:
    doc_ref = get_client().collection("projects").document()
    doc_ref.set(
        {
            "raw_idea": "Uma ideia qualquer",
            "status": ProjectStatus.FALHA_DLQ.value,
            "failure_reason": failure_reason.value,
            "attempts": attempts,
        }
    )
    return doc_ref.id


def _drain_queue() -> list[str]:
    connection = get_connection()
    channel = connection.channel()
    project_ids = []
    while True:
        method, _properties, body = channel.basic_get(queue=QUEUE_NAME, auto_ack=True)
        if method is None:
            break
        import json

        project_ids.append(json.loads(body)["project_id"])
    connection.close()
    return project_ids


def test_sweep_dlq_requeues_only_recoverable_failures():
    _drain_queue()  # garante fila limpa antes do teste

    transient_id = _create_failed_project(FailureReason.ERRO_TRANSITORIO)
    invalid_id = _create_failed_project(FailureReason.RESPOSTA_INVALIDA)
    quota_id = _create_failed_project(FailureReason.QUOTA_EXCEDIDA)

    requeued = sweep_dlq()

    # >= em vez de ==: o emulador do Firestore e compartilhado entre execucoes
    # de teste (nao reseta sozinho), entao pode haver residuo de FALHA_DLQ
    # recuperavel de execucoes anteriores alem dos dois criados aqui.
    assert requeued >= 2

    requeued_ids = set(_drain_queue())
    assert {transient_id, invalid_id}.issubset(requeued_ids)
    assert quota_id not in requeued_ids

    transient_doc = get_client().collection("projects").document(transient_id).get().to_dict()
    assert transient_doc["status"] == ProjectStatus.TRIAGEM_INICIAL.value
    assert transient_doc["attempts"] == 0

    quota_doc = get_client().collection("projects").document(quota_id).get().to_dict()
    assert quota_doc["status"] == ProjectStatus.FALHA_DLQ.value, "quota excedida nao deve ser reenfileirada"
    assert quota_doc["attempts"] == 3


def test_sweep_dlq_never_requeues_quota_exceeded():
    _drain_queue()
    quota_id = _create_failed_project(FailureReason.QUOTA_EXCEDIDA)

    sweep_dlq()

    # Checa o doc especifico, nao a contagem agregada: o emulador e
    # compartilhado entre execucoes de teste (mesma razao do >= no teste
    # acima), entao pode haver residuo recuperavel de outras execucoes
    # fazendo `requeued` ser > 0 mesmo sem nenhum bug aqui.
    assert quota_id not in set(_drain_queue())
    quota_doc = get_client().collection("projects").document(quota_id).get().to_dict()
    assert quota_doc["status"] == ProjectStatus.FALHA_DLQ.value
    assert quota_doc["attempts"] == 3
