import React from 'react';
import { UserStory } from '../../entities/UserStory';
import { Draggable } from 'react-beautiful-dnd';

interface UserStoryCardProps {
  story: UserStory;
  index: number;
  onEdit: (story: UserStory) => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const UserStoryCardDebug: React.FC<UserStoryCardProps> = ({ story, index, onEdit }) => {
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
          className={`mb-4 ${snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''}`}
        >
          <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-gray-800 flex-grow pr-2">
                {story.title}
              </h4>
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[story.priority]}`}>
                  {priorityLabels[story.priority]}
                </span>
                <button 
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  onClick={handleEdit}
                >
                  Editar
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              {story.description}
            </p>
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-1">
                Critérios de Aceite:
              </h5>
              <ul className="list-disc list-inside pl-4 mt-1">
                {story.acceptanceCriteria.map((criterion, i) => (
                  <li key={i} className="text-sm text-gray-600">{criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCardDebug;
