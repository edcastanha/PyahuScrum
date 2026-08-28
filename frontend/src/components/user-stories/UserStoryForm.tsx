import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserStory } from '../../entities/UserStory';
import { Project } from '../../entities/Project';
import { userStorySchema, UserStoryFormData } from './userStorySchema';
import styles from './UserStoryForm.module.css';

interface UserStoryFormProps {
  story?: UserStory;
  projects: Project[];
  onSave: (story: UserStory) => void;
  onCancel: () => void;
}

const UserStoryForm: React.FC<UserStoryFormProps> = ({ story, projects, onSave, onCancel }) => {
  const defaultCriteria = story?.acceptanceCriteria?.length ? story.acceptanceCriteria : [''];
  const [criteria, setCriteria] = React.useState<string[]>(defaultCriteria);
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserStoryFormData>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      title:       story?.title       ?? '',
      projectId:   story?.projectId   ?? (projects[0]?.id.toString() ?? ''),
      description: story?.description ?? '',
      status:      story?.status      ?? 'todo',
      priority:    story?.priority    ?? 'medium',
      acceptanceCriteria: defaultCriteria,
    },
  });

  const syncCriteria = (updated: string[]) => {
    setCriteria(updated);
    setValue('acceptanceCriteria', updated, { shouldValidate: false });
  };

  const addCriteria = () => syncCriteria([...criteria, '']);

  const removeCriteria = (idx: number) =>
    syncCriteria(criteria.filter((_, i) => i !== idx));

  const updateCriteria = (idx: number, value: string) =>
    syncCriteria(criteria.map((c, i) => (i === idx ? value : c)));

  const onSubmit = (data: UserStoryFormData) => {
    const storyData: UserStory = {
      ...data,
      id:          story?.id         ?? 0,
      createdDate: story?.createdDate ?? new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      acceptanceCriteria: data.acceptanceCriteria.filter(c => c.trim() !== ''),
    };
    onSave(storyData);
  };

  return (
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-form-title"
        tabIndex={-1}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 id="story-form-title" className={styles.modalTitle}>
              {story ? 'Editar História' : 'Nova História de Usuário'}
            </h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onCancel}
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className={styles.formBody}>
            {/* Título */}
            <div className={styles.field}>
              <label className={styles.label}>
                Título <span className={styles.required}>*</span>
              </label>
              <input
                {...register('title')}
                className={`${styles.input}${errors.title ? ` ${styles.hasError}` : ''}`}
                placeholder="Como usuário, eu quero..."
              />
              {errors.title && <p className={styles.errorMsg}>{errors.title.message}</p>}
            </div>

            {/* Projeto + Prioridade */}
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Projeto <span className={styles.required}>*</span>
                </label>
                <select
                  {...register('projectId')}
                  className={`${styles.select}${errors.projectId ? ` ${styles.hasError}` : ''}`}
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.name}</option>
                  ))}
                </select>
                {errors.projectId && <p className={styles.errorMsg}>{errors.projectId.message}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Prioridade</label>
                <select {...register('priority')} className={styles.select}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className={styles.field}>
              <label className={styles.label}>
                Descrição <span className={styles.required}>*</span>
              </label>
              <textarea
                {...register('description')}
                className={`${styles.textarea}${errors.description ? ` ${styles.hasError}` : ''}`}
                placeholder="Descreva detalhadamente o que o usuário precisa..."
              />
              {errors.description && <p className={styles.errorMsg}>{errors.description.message}</p>}
            </div>

            {/* Status */}
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select {...register('status')} className={styles.select}>
                <option value="todo">A Fazer</option>
                <option value="inprogress">Em Progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            {/* Critérios de aceite */}
            <div className={styles.criteriaSection}>
              <div className={styles.criteriaLabelRow}>
                <label className={styles.label}>
                  Critérios de Aceite <span className={styles.required}>*</span>
                </label>
                <button
                  type="button"
                  className={styles.addCriteriaBtn}
                  onClick={addCriteria}
                >
                  + Adicionar
                </button>
              </div>

              {criteria.map((value, idx) => (
                <div key={idx} className={styles.criteriaRow}>
                  <input
                    value={value}
                    onChange={e => updateCriteria(idx, e.target.value)}
                    className={styles.criteriaInput}
                    placeholder={`Critério ${idx + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.removeCriteriaBtn}
                    onClick={() => removeCriteria(idx)}
                    disabled={criteria.length <= 1}
                    aria-label="Remover critério"
                  >
                    ×
                  </button>
                </div>
              ))}

              {errors.acceptanceCriteria && (
                <p className={styles.errorMsg}>
                  {(errors.acceptanceCriteria as any).message ?? 'Preencha todos os critérios.'}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn}>
              {story ? 'Salvar Alterações' : 'Criar História'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserStoryForm;
