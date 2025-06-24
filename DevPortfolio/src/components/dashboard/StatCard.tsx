import React from 'react';
import { StatCardProps } from '../../entities/StatCard';
import styles from './StatCard.module.css';

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, details, iconBgColor }) => {
  const Icon = icon as React.ElementType;

  return (
    <div className={styles.statCard}>
      <div className={styles.iconWrapper} style={{ backgroundColor: iconBgColor || '#0F172A' }}>
        {Icon && <Icon className={styles.icon} />}
      </div>
      <div className={styles.info}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {details && <div className={styles.details}>{details}</div>}
      </div>
    </div>
  );
};

export default StatCard;
