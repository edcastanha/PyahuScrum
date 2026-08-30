import React, { useState, useCallback } from 'react';
import styles from './ElicitacaoCard.module.css';

export interface PerguntaElicitacao {
  id: string;
  texto: string;
  opcoes: string[];
  permite_texto: boolean;
}

interface ElicitacaoCardProps {
  pergunta: PerguntaElicitacao;
  onResposta: (pergunta_id: string, opcao: string | undefined, texto: string | undefined) => void;
}

const ElicitacaoCard: React.FC<ElicitacaoCardProps> = ({ pergunta, onResposta }) => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | undefined>(undefined);
  const [textoLivre, setTextoLivre] = useState('');

  const handleOpcao = useCallback((opcao: string) => {
    setOpcaoSelecionada(opcao);
    onResposta(pergunta.id, opcao, textoLivre || undefined);
  }, [pergunta.id, textoLivre, onResposta]);

  const handleTexto = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const valor = e.target.value;
    setTextoLivre(valor);
    onResposta(pergunta.id, opcaoSelecionada, valor || undefined);
  }, [pergunta.id, opcaoSelecionada, onResposta]);

  return (
    <div className={styles.card}>
      <p className={styles.pergunta}>{pergunta.texto}</p>

      {pergunta.opcoes.length > 0 && (
        <div className={styles.opcoes} role="group" aria-label="Opções de resposta">
          {pergunta.opcoes.map(opcao => (
            <button
              key={opcao}
              type="button"
              className={styles.opcaoBtn}
              aria-pressed={opcaoSelecionada === opcao}
              onClick={() => handleOpcao(opcao)}
            >
              {opcao}
            </button>
          ))}
        </div>
      )}

      {pergunta.permite_texto && (
        <textarea
          className={styles.textoLivre}
          placeholder="Adicione um detalhe (opcional)"
          value={textoLivre}
          onChange={handleTexto}
          rows={2}
        />
      )}
    </div>
  );
};

export default ElicitacaoCard;
