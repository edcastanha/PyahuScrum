import React from 'react';
import { Activity } from '../../entities/Activity';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './ActivityFeed.module.css';

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) {
    return <p>Nenhuma atividade recente.</p>;
  }
  
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "d 'de' MMMM', às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const getActivityTitle = (activity: Activity): string => {
    switch (activity.type) {
      case 'project_created':
        return 'Projeto Criado';
      case 'project_updated':
        return 'Projeto Atualizado';
      case 'story_added':
        return 'História Adicionada';
      case 'story_completed':
        return 'História Concluída';
      case 'adr_added':
        return 'ADR Documentado';
      default:
        return 'Atividade';
    }
  };
  
  return (
    <div>
      {activities.map((activity) => (
        <div className={styles.activityItem} key={activity.id}>
          <div className={styles.activityHeader}>
            <div className={styles.activityTitle}>
              {getActivityTitle(activity)}
            </div>
            <div className={styles.activityTimestamp}>
              {formatDate(activity.timestamp)}
            </div>
          </div>
          <div className={styles.activityContent}>
            <div className={styles.activityMessage}>
              {activity.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
