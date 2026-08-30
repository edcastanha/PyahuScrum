import React, { useState, useCallback, useMemo } from 'react';
import ElicitacaoCard, { PerguntaElicitacao } from './ElicitacaoCard';
import { sendRoundAnswers } from '../../services/pipeline/pipelineService';
import styles from './ElicitacaoRound.module.css';

interface RespostaMap {
  [pergunta_id: string]: { opcao?: string; texto?: string };
}

interface ElicitacaoRoundProps {
  perguntas: PerguntaElicitacao[];
  rodada: number;
  projectId: string;
  pronto?: boolean;
  onEnviado: (resultado: { status: string; pronto?: boolean; perguntas?: PerguntaElicitacao[] }) => void;
}

const ElicitacaoRound: React.FC<ElicitacaoRoundProps> = ({
  perguntas,
  rodada,
  projectId,
  pronto = false,
  onEnviado,
}) => {
  const [respostas, setRespostas] = useState<RespostaMap>({});
  const [enviando, setEnviando] = useState(false);

  const handleResposta = useCallback((pergunta_id: string, opcao?: string, texto?: string) => {
    setRespostas(prev => ({
      ...prev,
      [pergunta_id]: { opcao, texto },
    }));
  }, []);

  // Uma pergunta está respondida se tem opcao OU texto não vazio
  const estaRespondida = useCallback((p: PerguntaElicitacao): boolean => {
    const r = respostas[p.id];
    if (!r) return false;
    return Boolean(r.opcao) || Boolean(r.texto?.trim());
  }, [respostas]);

  const todasRespondidas = useMemo(
    () => perguntas.every(estaRespondida),
    [perguntas, estaRespondida],
  );

  const mostrarGerarAgora = rodada >= 2 || pronto;

  const _enviar = useCallback(async (forcarGeracao: boolean) => {
    setEnviando(true);
    try {
      const respostasPayload = perguntas.map(p => ({
        pergunta_id: p.id,
        opcao: respostas[p.id]?.opcao ?? null,
        texto: respostas[p.id]?.texto ?? null,
      }));
      // 202 Accepted — o onSnapshot notificará quando o backend processar
      await sendRoundAnswers(projectId, rodada, respostasPayload, forcarGeracao);
      onEnviado({ status: 'PROCESSANDO' });
    } catch (err) {
      console.error('Erro ao enviar respostas:', err);
    } finally {
      setEnviando(false);
    }
  }, [rodada, perguntas, respostas, projectId, onEnviado]);

  return (
    <div className={styles.round}>
      <p className={styles.cabecalho}>
        Rodada {rodada} — Responda as perguntas abaixo para que o Agent Orchestrator
        entenda melhor o seu projeto:
      </p>

      {perguntas.map(p => (
        <ElicitacaoCard key={p.id} pergunta={p} onResposta={handleResposta} />
      ))}

      <div className={styles.acoes}>
        {mostrarGerarAgora && (
          <button
            type="button"
            className={styles.btnGerar}
            onClick={() => _enviar(true)}
            disabled={enviando}
          >
            {enviando ? 'Gerando...' : 'Gerar agora'}
          </button>
        )}
        <button
          type="button"
          className={styles.btnEnviar}
          onClick={() => _enviar(false)}
          disabled={!todasRespondidas || enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar respostas'}
        </button>
      </div>
    </div>
  );
};

export default ElicitacaoRound;
