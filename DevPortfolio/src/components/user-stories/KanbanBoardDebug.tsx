import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { UserStory } from '../../entities/UserStory';
import UserStoryCardDebug from './UserStoryCardDebug';

interface KanbanBoardProps {
  stories: UserStory[];
  onDragEnd: (result: DropResult) => void;
  onEditStory: (story: UserStory) => void;
}

const KanbanBoardDebug: React.FC<KanbanBoardProps> = ({ stories, onDragEnd, onEditStory }) => {
  const columns = {
    todo: stories.filter(s => s.status === 'todo'),
    inprogress: stories.filter(s => s.status === 'inprogress'),
    done: stories.filter(s => s.status === 'done'),
  };

  const columnNames = {
    todo: 'A Fazer',
    inprogress: 'Em Progresso',
    done: 'Concluído',
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 p-4 bg-gray-100 rounded-lg">
        {Object.keys(columns).map(columnId => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-4 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-200'
                }`}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  {columnNames[columnId as keyof typeof columnNames]}
                </h3>
                <div className="min-h-[500px]">
                  {columns[columnId as keyof typeof columns].map((story, index) => (
                    <UserStoryCardDebug key={story.id} story={story} index={index} onEdit={onEditStory} />
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoardDebug;
