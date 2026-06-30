import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { UserStory } from '../../entities/UserStory';
import styles from './UserStoryCard.module.css';

interface UserStoryCardProps {
  story: UserStory;
  index: number;
  onEdit: (story: UserStory) => void;
}

const priorityConfig: Record<UserStory['priority'], { label: string; cls: string; icon: string }> = {
  low:    { label: 'Baixa', cls: styles.priorityLow,    icon: '↓' },
  medium: { label: 'Média', cls: styles.priorityMedium, icon: '→' },
  high:   { label: 'Alta',  cls: styles.priorityHigh,   icon: '↑' },
};

const statusConfig: Record<UserStory['status'], { label: string; cls: string }> = {
  todo:       { label: 'A Fazer',      cls: styles.statusTodo },
  inprogress: { label: 'Em Progresso', cls: styles.statusInprogress },
  done:       { label: 'Concluído',    cls: styles.statusDone },
};

const EditIcon: React.FC = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DragIcon: React.FC = () => (
  <svg className={styles.dragHandle} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
  </svg>
);

const UserStoryCard: React.FC<UserStoryCardProps> = ({ story, index, onEdit }) => {
  const priority = priorityConfig[story.priority];
  const status = statusConfig[story.status];

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(story);
  };

  return (
    <Draggable draggableId={story.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.wrapper}${snapshot.isDragging ? ` ${styles.dragging}` : ''}`}
        >
          <div className={styles.card}>
            <div className={styles.cardBody}>
              {/* Título + ações */}
              <div className={styles.cardTop}>
                <div className={styles.titleArea}>
                  <h4 className={styles.title}>{story.title}</h4>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${priority.cls}`}>
                      <span aria-hidden="true">{priority.icon}</span>
                      {priority.label}
                    </span>
                    <span className={`${styles.badge} ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={handleEdit}
                  aria-label={`Editar história: ${story.title}`}
                >
                  <EditIcon />
                  Editar
                </button>
              </div>

              {/* Descrição */}
              <p className={styles.description}>{story.description}</p>

              {/* Critérios de aceite */}
              <div className={styles.criteria}>
                <div className={styles.criteriaHeader}>
                  <CheckIcon />
                  <span className={styles.criteriaLabel}>
                    Critérios ({story.acceptanceCriteria.length})
                  </span>
                </div>
                <ul className={styles.criteriaList}>
                  {story.acceptanceCriteria.slice(0, 2).map((criterion, i) => (
                    <li key={i} className={styles.criteriaItem}>
                      <span className={styles.criteriaDot} aria-hidden="true" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                  {story.acceptanceCriteria.length > 2 && (
                    <li className={styles.criteriaMore}>
                      +{story.acceptanceCriteria.length - 2} critérios adicionais
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.cardFooter}>
              <span className={styles.storyId}>#{story.id}</span>
              <DragIcon />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCard;
