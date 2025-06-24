import React from 'react';
import styles from './TechDistribution.module.css';

interface TechItem {
  name: string;
  percentage: number;
  color: string;
}

const TechDistribution: React.FC = () => {
  const techItems: TechItem[] = [
    { name: 'React', percentage: 45, color: '#61DAFB' },
    { name: 'TypeScript', percentage: 30, color: '#3178C6' },
    { name: 'Node.js', percentage: 15, color: '#43853D' },
    { name: 'Django', percentage: 10, color: '#092E20' },
  ];

  return (
    <div className={styles.techDistribution}>
      <h2>Distribuição por Tecnologia</h2>
      
      <div className={styles.techList}>
        {techItems.map((tech) => (
          <div key={tech.name} className={styles.techItem}>
            <div className={styles.techHeader}>
              <span className={styles.techName}>{tech.name}</span>
              <span className={styles.techPercentage}>{tech.percentage}%</span>
            </div>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${tech.percentage}%`,
                  backgroundColor: tech.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.chart}>
        {techItems.map((tech) => (
          <div key={tech.name} className={styles.legendItem}>
            <div
              className={styles.colorIndicator}
              style={{ backgroundColor: tech.color }}
            />
            <span>{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechDistribution;
