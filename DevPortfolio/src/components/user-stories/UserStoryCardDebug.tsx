import React from 'react';
import { UserStory } from '../../entities/UserStory';
import { Draggable } from 'react-beautiful-dnd';

interface UserStoryCardProps {
  story: UserStory;
  index: number;
  onEdit: (story: UserStory) => void;
}

const priorityConfig = {
  low: { 
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Baixa',
    icon: '🟢'
  },
  medium: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Média',
    icon: '🟡'
  },
  high: { 
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Alta',
    icon: '🔴'
  },
};

const statusConfig = {
  todo: { label: 'A Fazer', color: 'text-gray-600' },
  inprogress: { label: 'Em Progresso', color: 'text-blue-600' },
  done: { label: 'Concluído', color: 'text-green-600' }
};

const UserStoryCardDebug: React.FC<UserStoryCardProps> = ({ story, index, onEdit }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(story);
  };

  const priority = priorityConfig[story.priority];

  return (
    <Draggable draggableId={story.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 ${snapshot.isDragging ? 'shadow-2xl transform rotate-1 scale-105' : ''}`}
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Header do Card */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-3">
                  <h4 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                    {story.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
                      <span>{priority.icon}</span>
                      {priority.label}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button 
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors group-hover:shadow-sm"
                    onClick={handleEdit}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {story.description}
              </p>

              {/* Critérios de Aceite */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h5 className="text-sm font-semibold text-gray-700">
                    Critérios de Aceite ({story.acceptanceCriteria.length})
                  </h5>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <ul className="space-y-1">
                    {story.acceptanceCriteria.slice(0, 3).map((criterion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="line-clamp-1">{criterion}</span>
                      </li>
                    ))}
                    {story.acceptanceCriteria.length > 3 && (
                      <li className="text-xs text-gray-500 font-medium pl-3.5">
                        +{story.acceptanceCriteria.length - 3} critérios adicionais
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer do Card */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  ID: #{story.id}
                </span>
                <span className={`font-medium ${statusConfig[story.status].color}`}>
                  {statusConfig[story.status].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCardDebug;
