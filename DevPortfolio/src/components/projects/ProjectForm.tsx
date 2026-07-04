import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    status: 'inactive',
    progress: 0,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'progress' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project ? project.id : Date.now(), // Simple ID generation for new projects
      ...formData,
    };
    onSave(newProject);
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        tabIndex={-1}
      >
        <form onSubmit={handleSubmit}>
          <h2 id="project-form-title">{project ? 'Editar Projeto' : 'Adicionar Projeto'}</h2>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do Projeto</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="inactive">Inativo</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="progress">Progresso (%)</label>
            <input
              type="range"
              id="progress"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
            />
            <span>{formData.progress}%</span>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
