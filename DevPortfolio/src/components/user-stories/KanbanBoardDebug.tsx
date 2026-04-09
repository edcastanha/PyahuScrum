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

  const columnConfig = {
    todo: { 
      name: 'A Fazer', 
      color: 'bg-slate-50 border-slate-200', 
      headerColor: 'text-slate-700',
      icon: '📝',
      count: columns.todo.length 
    },
    inprogress: { 
      name: 'Em Progresso', 
      color: 'bg-blue-50 border-blue-200', 
      headerColor: 'text-blue-700',
      icon: '⚡',
      count: columns.inprogress.length 
    },
    done: { 
      name: 'Concluído', 
      color: 'bg-green-50 border-green-200', 
      headerColor: 'text-green-700',
      icon: '✅',
      count: columns.done.length 
    },
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.keys(columns).map(columnId => {
          const config = columnConfig[columnId as keyof typeof columnConfig];
          return (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <div className="flex flex-col">
                  {/* Header da Coluna */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${config.headerColor} flex items-center gap-2`}>
                        <span className="text-base">{config.icon}</span>
                        {config.name}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2.5 py-1 rounded-full">
                        {config.count}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${
                        columnId === 'todo' ? 'bg-slate-400' :
                        columnId === 'inprogress' ? 'bg-blue-400' :
                        'bg-green-400'
                      }`} 
                      style={{ width: `${Math.min((config.count / Math.max(stories.length, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Área de Drop */}
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[600px] ${
                      snapshot.isDraggingOver 
                        ? 'border-blue-400 bg-blue-50 shadow-md' 
                        : config.color
                    }`}
                  >
                    <div className="space-y-3">
                      {columns[columnId as keyof typeof columns].map((story, index) => (
                        <UserStoryCardDebug key={story.id} story={story} index={index} onEdit={onEditStory} />
                      ))}
                      {provided.placeholder}
                      
                      {/* Estado Vazio */}
                      {columns[columnId as keyof typeof columns].length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-7v6h7V9z" />
                          </svg>
                          <p className="text-sm font-medium">Nenhuma história</p>
                          <p className="text-xs">Arraste cards para esta coluna</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoardDebug;
