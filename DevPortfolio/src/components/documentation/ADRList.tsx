import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ADRCard from './ADRCard';
import styles from './ADRList.module.css';
import { documentationService, ADR } from '../../services/documentation/documentationService';

interface ADRListProps {
  adrs: ADR[];
  onEdit: (adr: ADR) => void;
  onDelete: (adrId: number) => void;
}

const ADRList: React.FC<ADRListProps> = ({ adrs, onEdit, onDelete }) => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className={styles.listContainer}>
      {adrs.map(adr => (
        <ADRCard key={adr.id} adr={adr} onEdit={onEdit} onDelete={onDelete} />
      ))}
      {adrs.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhum ADR cadastrado ainda. Comece criando um novo registro!</p>
        </div>
      )}
    </div>
  );
};

export default ADRList;
