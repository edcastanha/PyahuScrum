import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import KanbanBoardDebug from '../../components/user-stories/KanbanBoardDebug';
import UserStoryFormDebug from '../../components/user-stories/UserStoryFormDebug';
import { UserStory } from '../../entities/UserStory';
import { userStoryService } from '../../services/user-story/userStoryService';
import { projectService } from '../../services/project/projectService';
import { useToast } from '../../context/ToastContext';
import styles from './UserStoriesPage.module.css';
import { Project } from '../../entities/Project';

const UserStoriesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | undefined>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    // Carrega os projetos para o seletor do formulário
    setProjects(projectService.getProjects());

    if (projectId) {
      setStories(userStoryService.getUserStories(projectId));
    } else {
      // Se nenhum projeto for selecionado, exibe todas as histórias
      setStories(userStoryService.getAllUserStories());
    }
  }, [projectId]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const storyId = parseInt(draggableId);
    const newStatus = destination.droppableId as 'todo' | 'inprogress' | 'done';

    const updatedStory = userStoryService.updateUserStoryStatus(storyId, newStatus);

    if (updatedStory) {
      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, status: newStatus } : story
        )
      );
      showToast('success', `História "${updatedStory.title}" movida para ${destination.droppableId}.`);
    } else {
      showToast('error', 'Não foi possível mover a história.');
    }
  };

  const handleOpenForm = (story?: UserStory) => {
    setEditingStory(story);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStory(undefined);
  };

  const handleSaveStory = (storyData: UserStory) => {
    const storyToSave = {
      ...storyData,
      // Garante que o projectId seja uma string, mesmo que venha como número do formulário
      projectId: storyData.projectId.toString(),
    };

    const savedStory = userStoryService.saveUserStory(storyToSave);

    const currentProjectId = projectId || savedStory.projectId;

    if (editingStory) {
      // Atualiza a história existente na lista
      setStories(stories.map(s => (s.id === savedStory.id ? savedStory : s)));
      showToast('success', 'História atualizada com sucesso!');
    } else {
      // Adiciona a nova história à lista, mas apenas se pertencer ao projeto atual (ou se nenhum projeto for selecionado)
      if (!projectId || savedStory.projectId === projectId) {
         setStories([...stories, savedStory]);
      }
      showToast('success', 'História criada com sucesso!');
    }
    handleCloseForm();
  };


  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quadro Kanban de Histórias de Usuário</h1>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleOpenForm();
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Adicionar História
        </button>
      </div>
      <KanbanBoardDebug stories={stories} onDragEnd={handleDragEnd} onEditStory={handleOpenForm} />
      {isFormOpen && (
        <UserStoryFormDebug
          story={editingStory}
          projects={projects}
          onSave={handleSaveStory}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default UserStoriesPage;
