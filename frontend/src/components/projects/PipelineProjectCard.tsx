import React, { useState, useEffect, useCallback } from 'react';
import { RodadaHistorico, subscribeToRodadas } from '../../services/pipeline/projectStatusListener';
import ElicitacaoRound from './ElicitacaoRound';
import { deleteProjectFromPipeline } from '../../services/pipeline/pipelineService';
import styles from './PipelineProjectCard.module.css';

interface Props {
  projectId: string;
  rawIdea: string;
  status: string;
  /** Se true, mostra botão de download do ZIP */
  showDownload?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  TRIAGEM_INICIAL: '⏳ Na fila',
  ELICITANDO: '💬 Em elicitação',
  AGUARDANDO_APROVACAO_ESCOPO: '🔍 Aguardando aprovação',
  GERANDO_ADR: '⚙️ Gerando documentação',
  CONCLUIDO: '✅ Concluído',
  FALHA_PROCESSAMENTO: '❌ Falha',
};

/** Sub-componente: accordion de uma única rodada */
const RodadaAccordion: React.FC<{
  rodada: RodadaHistorico;
  projectId: string;
  defaultOpen?: boolean;
  onEnviado: (resultado: { status: string; pronto?: boolean }) => void;
}> = ({ rodada, projectId, defaultOpen = false, onEnviado }) => {
  const [aberto, setAberto] = useState(defaultOpen);

  const enviado = rodada.respondida;
  const editavel = !rodada.respondida;

  return (
    <div className={styles.rodadaAccordion}>
      <div
        className={styles.rodadaAccordionHeader}
        onClick={() => setAberto(a => !a)}
      >
        <span className={styles.rodadaNumero}>Rodada {rodada.numero}</span>

        {enviado ? (
          <span className={styles.badgeEnviado}>✓ enviado</span>
        ) : (
          <span className={styles.badgePendente}>⏳ pendente</span>
        )}

        {editavel && (
          <span className={styles.badgeEditavel}>✏️ editável</span>
        )}

        <span className={styles.rodadaAccordionToggle}>{aberto ? '▾' : '▸'}</span>
      </div>

      {aberto && (
        <div className={styles.rodadaAccordionBody}>
          {/* Rodada respondida — somente a resposta escolhida */}
          {enviado && (
            <div className={styles.perguntasList}>
              {rodada.perguntas.map(p => {
                const resp = rodada.respostas.find(r => r.pergunta_id === p.id);
                return (
                  <div key={p.id} className={styles.perguntaItem}>
                    <p className={styles.perguntaTexto}>{p.texto}</p>
                    {resp?.opcao && (
                      <span className={styles.opcaoSelecionada} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '4px 10px', borderRadius: 6 }}>
                        ● {resp.opcao}
                      </span>
                    )}
                    {p.permite_texto && resp?.texto && (
                      <textarea
                        className={styles.textareaDesabilitado}
                        value={resp.texto}
                        disabled
                        readOnly
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodada ativa — editável */}
          {editavel && (
            <ElicitacaoRound
              perguntas={rodada.perguntas}
              rodada={rodada.numero}
              projectId={projectId}
              pronto={false}
              onEnviado={onEnviado}
            />
          )}
        </div>
      )}
    </div>
  );
};

export const PipelineProjectCard: React.FC<Props> = ({ projectId, rawIdea, status, showDownload }) => {
  const [rodadas, setRodadas] = useState<RodadaHistorico[]>([]);
  const [expandido, setExpandido] = useState(false);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRodadas(projectId, setRodadas);
    return unsub;
  }, [projectId]);

  const handleDownload = () => {
    const url = `${process.env.REACT_APP_AGENT_ORCHESTRATOR_URL || 'http://localhost:8001'}/projects/${projectId}/download`;
    window.open(url, '_blank');
  };

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir este projeto? Todos os artefatos e histórico serão removidos permanentemente.')) return;
    setDeletando(true);
    try {
      await deleteProjectFromPipeline(projectId);
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      setDeletando(false);
    }
  }, [projectId]);

  const handleRodadaEnviada = useCallback(
    (_resultado: { status: string; pronto?: boolean }) => {
      // ElicitacaoRound já gerencia o freeze local; onSnapshot do Firestore sincroniza
    },
    [],
  );

  const todasRespondidas = rodadas.length > 0 && rodadas.every(r => r.respondida);

  return (
    <div className={`${styles.card} ${deletando ? styles.cardDeletando : ''}`}>
      {/* ── Header do projeto ── */}
      <div className={styles.header} onClick={() => setExpandido(e => !e)}>
        <div className={styles.headerLeft}>
          <span className={styles.toggle}>{expandido ? '▾' : '▸'}</span>
          <div>
            <p className={styles.idea}>{rawIdea}</p>
            <span className={styles.statusBadge}>{STATUS_LABEL[status] ?? status}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.roundCount}>{rodadas.length} rodada{rodadas.length !== 1 ? 's' : ''}</span>
          {showDownload && (
            <button className={styles.downloadBtn} onClick={e => { e.stopPropagation(); handleDownload(); }}>
              ⬇ Baixar ZIP
            </button>
          )}
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deletando}
            title="Excluir projeto"
          >
            {deletando ? '⏳' : '🗑'}
          </button>
        </div>
      </div>

      {/* ── Corpo expandido: accordion de rodadas ── */}
      {expandido && (
        <div className={styles.body}>
          {rodadas.length === 0 && (
            <p className={styles.empty}>Aguardando início da elicitação…</p>
          )}

          {rodadas.map((rodada, idx) => (
            <RodadaAccordion
              key={rodada.numero}
              rodada={rodada}
              projectId={projectId}
              defaultOpen={idx === rodadas.length - 1 && !rodada.respondida}
              onEnviado={handleRodadaEnviada}
            />
          ))}

          {todasRespondidas && !showDownload && (
            <p className={styles.aguardando}>
              Todas as rodadas respondidas — aguardando geração dos artefatos…
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineProjectCard;
