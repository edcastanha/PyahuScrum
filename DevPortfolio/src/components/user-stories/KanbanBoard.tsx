import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { UserStory } from '../../entities/UserStory';
import UserStoryCard from './UserStoryCard';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  stories: UserStory[];
  onDragEnd: (result: DropResult) => void;
  onEditStory: (story: UserStory) => void;
}

type ColumnId = 'todo' | 'inprogress' | 'done';

const COLUMNS: { id: ColumnId; name: string; icon: string }[] = [
  { id: 'todo',       name: 'A Fazer',       icon: '📋' },
  { id: 'inprogress', name: 'Em Progresso',   icon: '⚡' },
  { id: 'done',       name: 'Concluído',      icon: '✅' },
];

const PROGRESS_CLS: Record<ColumnId, string> = {
  todo:       styles.progressTodo,
  inprogress: styles.progressInprogress,
  done:       styles.progressDone,
};

const DROP_ZONE_CLS: Record<ColumnId, string> = {
  todo:       styles.todo,
  inprogress: styles.inprogress,
  done:       styles.done,
};

const EmptyState: React.FC<{ boardIsEmpty: boolean }> = ({ boardIsEmpty }) => (
  <div className={styles.emptyState}>
    <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className={styles.emptyTitle}>Coluna vazia</p>
    <p className={styles.emptyHint}>
      {boardIsEmpty
        ? "Use o botão 'Nova História' para criar a primeira"
        : 'Arraste cards para esta coluna'}
    </p>
  </div>
);

const KanbanBoard: React.FC<KanbanBoardProps> = ({ stories, onDragEnd, onEditStory }) => {
  const grouped: Record<ColumnId, UserStory[]> = {
    todo:       stories.filter(s => s.status === 'todo'),
    inprogress: stories.filter(s => s.status === 'inprogress'),
    done:       stories.filter(s => s.status === 'done'),
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {COLUMNS.map(col => {
          const colStories = grouped[col.id];
          const pct = stories.length > 0 ? (colStories.length / stories.length) * 100 : 0;

          return (
            <div key={col.id} className={styles.column}>
              {/* Header */}
              <div className={styles.columnHeader}>
                <div className={styles.columnTitleRow}>
                  <h3 className={styles.columnTitle}>
                    <span aria-hidden="true">{col.icon}</span>
                    {col.name}
                  </h3>
                  <span className={styles.columnCount}>{colStories.length}</span>
                </div>
                <div className={styles.progressBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`${styles.progressFill} ${PROGRESS_CLS[col.id]}`}
                    style={{ transform: `scaleX(${pct / 100})` }}
                  />
                </div>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={[
                      styles.dropZone,
                      DROP_ZONE_CLS[col.id],
                      snapshot.isDraggingOver ? styles.draggingOver : '',
                    ].join(' ')}
                  >
                    <div className={styles.cardList}>
                      {colStories.map((story, idx) => (
                        <UserStoryCard
                          key={story.id}
                          story={story}
                          index={idx}
                          onEdit={onEditStory}
                        />
                      ))}
                      {provided.placeholder}
                      {colStories.length === 0 && <EmptyState boardIsEmpty={stories.length === 0} />}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
