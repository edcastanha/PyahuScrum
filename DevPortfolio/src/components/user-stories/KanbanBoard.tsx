import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { UserStory } from '../../entities/UserStory';
import UserStoryCard from './UserStoryCard';
import { Typography } from '@material-tailwind/react';

interface KanbanBoardProps {
  stories: UserStory[];
  onDragEnd: (result: DropResult) => void;
  onEditStory: (story: UserStory) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ stories, onDragEnd, onEditStory }) => {
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
                <Typography 
                  variant="h5" 
                  color="blue-gray" 
                  className="mb-4"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  {columnNames[columnId as keyof typeof columnNames]}
                </Typography>
                <div className="min-h-[500px]">
                  {columns[columnId as keyof typeof columns].map((story, index) => (
                    <UserStoryCard key={story.id} story={story} index={index} onEdit={onEditStory} />
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

export default KanbanBoard;
