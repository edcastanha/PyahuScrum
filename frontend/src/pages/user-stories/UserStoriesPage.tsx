import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import KanbanBoard from '../../components/user-stories/KanbanBoard';
import UserStoryForm from '../../components/user-stories/UserStoryForm';
import { UserStory } from '../../entities/UserStory';
import { userStoryService } from '../../services/user-story/userStoryService';
import { projectService } from '../../services/project/projectService';
import { useToast } from '../../context/ToastContext';
import { Project } from '../../entities/Project';
import styles from './UserStoriesPage.module.css';

const COLUMN_LABELS: Record<string, string> = {
  todo:       'A Fazer',
  inprogress: 'Em Progresso',
  done:       'Concluído',
};

const PlusIcon: React.FC = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UserStoriesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | undefined>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    setProjects(projectService.getProjects());
    setStories(
      projectId
        ? userStoryService.getUserStories(projectId)
        : userStoryService.getAllUserStories()
    );
  }, [projectId]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const storyId = parseInt(draggableId);
    const newStatus = destination.droppableId as UserStory['status'];
    const updatedStory = userStoryService.updateUserStoryStatus(storyId, newStatus);

    if (updatedStory) {
      setStories(prev => prev.map(s => (s.id === storyId ? { ...s, status: newStatus } : s)));
      const colLabel = COLUMN_LABELS[destination.droppableId] ?? destination.droppableId;
      showToast('success', `"${updatedStory.title}" movida para ${colLabel}.`);
    } else {
      showToast('error', 'Não foi possível mover a história. Tente novamente.');
    }
  }, [showToast]);

  const handleOpenForm = useCallback((story?: UserStory) => {
    setEditingStory(story);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingStory(undefined);
  }, []);

  const handleSaveStory = useCallback((storyData: UserStory) => {
    const storyToSave: UserStory = {
      ...storyData,
      projectId: storyData.projectId.toString(),
    };
    const savedStory = userStoryService.saveUserStory(storyToSave);

    setStories(prev => {
      if (prev.some(s => s.id === savedStory.id)) {
        showToast('success', 'História atualizada com sucesso!');
        return prev.map(s => (s.id === savedStory.id ? savedStory : s));
      }
      if (!projectId || savedStory.projectId === projectId) {
        showToast('success', 'História criada com sucesso!');
        return [...prev, savedStory];
      }
      showToast('success', 'História criada com sucesso!');
      return prev;
    });
    handleCloseForm();
  }, [projectId, showToast, handleCloseForm]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Histórias de Usuário</h1>
          <p>Gerencie e organize as histórias usando o quadro Kanban</p>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => handleOpenForm()}
        >
          <PlusIcon />
          Nova História
        </button>
      </header>

      {/* Kanban */}
      <KanbanBoard
        stories={stories}
        onDragEnd={handleDragEnd}
        onEditStory={handleOpenForm}
      />

      {/* Modal */}
      {isFormOpen && (
        <UserStoryForm
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
