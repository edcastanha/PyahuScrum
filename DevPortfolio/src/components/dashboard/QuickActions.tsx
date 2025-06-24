import React from 'react';
import { Plus, Settings, FileCode, BarChart } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgColor: string;
  onClick: () => void;
}

const QuickActions: React.FC = () => {
  const actions: QuickAction[] = [
    {
      id: 'new-project',
      title: 'Novo Projeto',
      description: 'Iniciar um novo projeto',
      icon: Plus,
      iconBgColor: '#3B82F6',
      onClick: () => window.location.href = '/projects'
    },
    {
      id: 'new-story',
      title: 'Nova História',
      description: 'Adicionar história de usuário',
      icon: FileCode,
      iconBgColor: '#F59E0B',
      onClick: () => window.location.href = '/user-stories'
    },
    {
      id: 'project-status',
      title: 'Status dos Projetos',
      description: 'Ver relatório detalhado',
      icon: BarChart,
      iconBgColor: '#10B981',
      onClick: () => console.log('Não implementado ainda')
    },
    {
      id: 'project-settings',
      title: 'Configurações',
      description: 'Gerenciar preferências',
      icon: Settings,
      iconBgColor: '#8B5CF6',
      onClick: () => console.log('Não implementado ainda')
    },
  ];

  return (
    <div className={styles.quickActions}>
      <h2>Ações Rápidas</h2>
      <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <div 
            key={action.id}
            className={styles.actionCard}
            onClick={action.onClick}
          >
            <div 
              className={styles.iconWrapper} 
              style={{ backgroundColor: action.iconBgColor }}
            >
              {React.createElement(action.icon, { size: 20, color: "#fff" })}
            </div>
            <div className={styles.actionDetails}>
              <p className={styles.actionTitle}>{action.title}</p>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
