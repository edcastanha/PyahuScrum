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
      // onSnapshot vai remover o card automaticamente quando o Firestore atualizar
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      setDeletando(false);
    }
  }, [projectId]);

  const rodadaAtiva = rodadas.find(r => !r.respondida);
  const todasRespondidas = rodadas.length > 0 && rodadas.every(r => r.respondida);

  /** Callback real: o ElicitacaoRound já congela a UI localmente após envio.
   *  Mantemos o handler aqui para extensibilidade futura (ex: analytics, toast). */
  const handleRodadaEnviada = useCallback(
    (_resultado: { status: string; pronto?: boolean }) => {
      // ElicitacaoRound já gerencia o estado local de freeze.
      // Nada adicional necessário por enquanto — o onSnapshot do Firestore
      // irá desmontá-lo e exibi-lo no histórico assim que respondida=true.
    },
    [],
  );

  return (
    <div className={`${styles.card} ${deletando ? styles.cardDeletando : ''}`}>
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

      {expandido && (
        <div className={styles.body}>
          {rodadas.length === 0 && (
            <p className={styles.empty}>Aguardando início da elicitação…</p>
          )}

          {/* Rodadas já respondidas — somente leitura (confirmado pelo Firestore) */}
          {rodadas.filter(r => r.respondida).map(rodada => (
            <div key={rodada.numero} className={styles.rodadaBlock}>
              <h4 className={styles.rodadaTitle}>Rodada {rodada.numero} — respondida ✓</h4>
              <div className={styles.perguntasList}>
                {rodada.perguntas.map(p => {
                  const resp = rodada.respostas.find(r => r.pergunta_id === p.id);
                  return (
                    <div key={p.id} className={styles.perguntaItem}>
                      <p className={styles.perguntaTexto}>{p.texto}</p>
                      {p.opcoes.length > 0 && (
                        <div className={styles.opcoesGrid}>
                          {p.opcoes.map(op => (
                            <label key={op} className={`${styles.opcaoLabel} ${resp?.opcao === op ? styles.opcaoSelecionada : styles.opcaoDesabilitada}`}>
                              <input type="radio" disabled checked={resp?.opcao === op} readOnly /> {op}
                            </label>
                          ))}
                        </div>
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
            </div>
          ))}

          {/* Rodada ativa — editável; congela localmente após envio */}
          {rodadaAtiva && !todasRespondidas && (
            <div className={styles.rodadaBlock}>
              <h4 className={styles.rodadaTitle}>Rodada {rodadaAtiva.numero} — responda abaixo</h4>
              <ElicitacaoRound
                perguntas={rodadaAtiva.perguntas}
                rodada={rodadaAtiva.numero}
                projectId={projectId}
                pronto={false}
                onEnviado={handleRodadaEnviada}
              />
            </div>
          )}

          {todasRespondidas && !showDownload && (
            <p className={styles.aguardando}>Todas as rodadas respondidas — aguardando geração dos artefatos…</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineProjectCard;
