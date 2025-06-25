import React from 'react';
import styles from './ADRCard.module.css';
import { FileText, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { ADR } from '../../services/documentation/documentationService';

interface ADRCardProps {
  adr: ADR;
  onEdit: (adr: ADR) => void;
  onDelete: (id: number) => void;
}

const statusConfig = {
  proposed: { icon: AlertCircle, color: '#F59E0B', label: 'Proposto' },
  accepted: { icon: CheckCircle, color: '#10B981', label: 'Aceito' },
  rejected: { icon: XCircle, color: '#EF4444', label: 'Rejeitado' },
  deprecated: { icon: RotateCcw, color: '#6B7280', label: 'Depreciado' },
  superseded: { icon: FileText, color: '#8B5CF6', label: 'Substituído' },
};

const ADRCard: React.FC<ADRCardProps> = ({ adr, onEdit, onDelete }) => {
  const { id, title, status, date } = adr;
  const { icon: StatusIcon, color, label } = statusConfig[status];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.title}>
          <FileText size={20} />
          <h3>{title}</h3>
        </div>
        <div className={styles.actions}>
          <button onClick={() => onEdit(adr)} className={styles.editButton}>Editar</button>
          <button onClick={() => onDelete(id)} className={styles.deleteButton}>Excluir</button>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.status} style={{ backgroundColor: color + '20', color }}>
          <StatusIcon size={16} />
          <span>{label}</span>
        </div>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
};

export default ADRCard;
