import React from 'react';
import styles from './DocumentationPage.module.css';
import { BookOpen } from 'lucide-react';

const DocumentationPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BookOpen size={24} />
        <h1>Documentação</h1>
      </div>
      <div className={styles.content}>
        <p>Bem-vindo à página de documentação.</p>
      </div>
    </div>
  );
};

export default DocumentationPage;
