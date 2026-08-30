import React from 'react';
import styles from './PipelineStatusPanel.module.css';

interface PipelineStats {
  total: number;
  elicitando: number;
  gerandoAdr: number;
  concluido: number;
  falha: number;
}

interface PipelineStatusPanelProps {
  stats: PipelineStats;
}

const ITEMS = [
  { key: 'elicitando',  label: 'Elicitando',       color: '#6366f1', desc: 'Aguardando respostas' },
  { key: 'gerandoAdr',  label: 'Gerando docs',      color: '#f59e0b', desc: 'Processando no Gemini' },
  { key: 'concluido',   label: 'Concluídos',        color: '#10b981', desc: 'Artefatos disponíveis' },
  { key: 'falha',       label: 'Com falha',         color: '#ef4444', desc: 'Requer atenção' },
] as const;

const PipelineStatusPanel: React.FC<PipelineStatusPanelProps> = ({ stats }) => {
  if (stats.total === 0) {
    return (
      <div className={styles.panel}>
        <h2>Status do Pipeline</h2>
        <p className={styles.empty}>Nenhum projeto criado ainda. Crie o primeiro projeto para ver o status do pipeline aqui.</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h2>Status do Pipeline</h2>
      <div className={styles.list}>
        {ITEMS.map(item => {
          const count = stats[item.key];
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={item.key} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.count}>{count}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
              <span className={styles.desc}>{item.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PipelineStatusPanel);
