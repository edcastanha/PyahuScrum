import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Pick<Project, 'name' | 'description'>>({
    name: '',
    description: '',
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
      });
    }
  }, [project]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project?.id ?? '',   // '' → projectService.saveProject() gera UUID
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
          <h2 id="project-form-title">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do Projeto</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex.: API de Gerenciamento de Tarefas"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Ideia / Descrição</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva a ideia do projeto. O Agent Orchestrator usará isso como ponto de partida para fazer perguntas e gerar a documentação técnica."
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              {project ? 'Salvar' : 'Criar e gerar documentação →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
