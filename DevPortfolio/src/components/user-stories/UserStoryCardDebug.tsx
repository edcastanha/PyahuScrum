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
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Baixa',
    icon: '⬇️',
    bgHover: 'hover:bg-emerald-100'
  },
  medium: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Média',
    icon: '➡️',
    bgHover: 'hover:bg-amber-100'
  },
  high: { 
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'Alta',
    icon: '⬆️',
    bgHover: 'hover:bg-rose-100'
  },
};

const statusConfig = {
  todo: { 
    label: 'A Fazer', 
    color: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  inprogress: { 
    label: 'Em Progresso', 
    color: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  done: { 
    label: 'Concluído', 
    color: 'text-green-600',
    badge: 'bg-green-100 text-green-700 border-green-200'
  }
};

const UserStoryCardDebug: React.FC<UserStoryCardProps> = ({ story, index, onEdit }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(story);
  };

  const priority = priorityConfig[story.priority];
  const status = statusConfig[story.status];

  return (
    <Draggable draggableId={story.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'shadow-2xl transform rotate-2 scale-105 z-50' : ''}`}
        >
          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden group cursor-grab active:cursor-grabbing">
            
            {/* Header com Título e Ações */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                    {story.title}
                  </h4>
                  
                  {/* Tags de Prioridade e Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${priority.color}`}>
                      <span className="text-xs">{priority.icon}</span>
                      {priority.label}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.badge}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                
                {/* Botão de Editar */}
                <div className="flex-shrink-0">
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors duration-200 opacity-70 group-hover:opacity-100"
                    onClick={handleEdit}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {story.description}
              </p>
            </div>

            {/* Critérios de Aceite */}
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Critérios ({story.acceptanceCriteria.length})
                  </span>
                </div>
                
                <ul className="space-y-1.5">
                  {story.acceptanceCriteria.slice(0, 2).map((criterion, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="inline-block w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="line-clamp-1 leading-relaxed">{criterion}</span>
                    </li>
                  ))}
                  {story.acceptanceCriteria.length > 2 && (
                    <li className="text-xs text-gray-500 font-medium pl-3 pt-1 border-t border-gray-200">
                      +{story.acceptanceCriteria.length - 2} critérios adicionais
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer com ID */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">
                  ID #{story.id}
                </span>
                <div className="flex items-center gap-2">
                  {/* Drag Handle Indicator */}
                  <svg className="w-3 h-3 text-gray-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCardDebug;
