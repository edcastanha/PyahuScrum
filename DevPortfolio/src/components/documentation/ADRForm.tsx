import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ADRForm.module.css';
import MarkdownEditor from './MarkdownEditor';
import { documentationService, ADR } from '../../services/documentation/documentationService';
import { adrFormSchema, ADRFormData } from './adrSchema';
import { useToast } from '../../context/ToastContext';
import { z } from 'zod';



interface ADRFormProps {
  adrToEdit?: ADR;
  onSubmit: (data: ADR) => void;
  onCancel: () => void;
}

const ADRForm: React.FC<ADRFormProps> = ({ adrToEdit, onSubmit, onCancel }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [formData, setFormData] = useState<ADRFormData>({
    title: '',
    status: 'proposed',
    context: '',
    decision: '',
    consequences: '',
    alternatives: ['']
  });

  useEffect(() => {
    if (adrToEdit) {
      // Esta é uma função auxiliar para extrair seções do conteúdo Markdown
      const getSectionContent = (content: string, section: string) => {
        const regex = new RegExp(`## ${section}\n([\s\S]*?)(?=\n##|$)`);
        const match = content.match(regex);
        return match ? match[1].trim() : '';
      };

      setFormData({
        title: adrToEdit.title,
        status: adrToEdit.status as any,
        context: getSectionContent(adrToEdit.content, 'Contexto'),
        decision: getSectionContent(adrToEdit.content, 'Decisão'),
        consequences: getSectionContent(adrToEdit.content, 'Consequências'),
        alternatives: getSectionContent(adrToEdit.content, 'Alternativas Consideradas').split('\n').map(alt => alt.trim()).filter(alt => alt),
      });
    }
  }, [adrToEdit]);

  const [errors, setErrors] = useState<Partial<Record<keyof ADRFormData, string>>>({});
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      adrFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof ADRFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path) {
            formattedErrors[err.path[0] as keyof ADRFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
        showToast('error', 'Por favor, corrija os erros no formulário.');
        return;
      }
    }
    const adrData = {
      id: adrToEdit?.id, // Mantém o ID se estiver editando
      projectId: projectId || 'default',
      title: formData.title,
      status: formData.status,
      date: adrToEdit?.date || new Date().toISOString().split('T')[0], // Mantém a data original
      content: `# ${formData.title}\n\n## Status\n${formData.status}\n\n## Contexto\n${formData.context}\n\n## Decisão\n${formData.decision}\n\n## Consequências\n${formData.consequences}\n\n## Alternativas Consideradas\n${formData.alternatives.join('\n')}`
    };
    const savedADR = documentationService.saveADR(projectId || 'default', adrData);
    onSubmit(savedADR);
    showToast('success', `ADR "${savedADR.title}" ${adrToEdit ? 'atualizado' : 'criado'} com sucesso!`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="title">Título da Decisão</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        {errors.title && <p className={styles.error}>{errors.title}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
        >
          <option value="proposed">Proposto</option>
          <option value="accepted">Aceito</option>
          <option value="rejected">Rejeitado</option>
          <option value="deprecated">Depreciado</option>
          <option value="superseded">Substituído</option>
        </select>
        {errors.status && <p className={styles.error}>{errors.status}</p>}
      </div>

      <div className={styles.field}>
        <label>Contexto</label>
        <MarkdownEditor
          value={formData.context}
          onChange={(value) => setFormData({ ...formData, context: value || '' })}
          height={200}
        />
        {errors.context && <p className={styles.error}>{errors.context}</p>}
      </div>

      <div className={styles.field}>
        <label>Decisão</label>
        <MarkdownEditor
          value={formData.decision}
          onChange={(value) => setFormData({ ...formData, decision: value || '' })}
          height={200}
        />
        {errors.decision && <p className={styles.error}>{errors.decision}</p>}
      </div>

      <div className={styles.field}>
        <label>Consequências</label>
        <MarkdownEditor
          value={formData.consequences}
          onChange={(value) => setFormData({ ...formData, consequences: value || '' })}
          height={200}
        />
        {errors.consequences && <p className={styles.error}>{errors.consequences}</p>}
      </div>

      <div className={styles.buttons}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          {adrToEdit ? 'Salvar Alterações' : 'Salvar ADR'}
        </button>
      </div>
    </form>
  );
};

export default ADRForm;
