import React, { useState, useEffect } from 'react';
import { UserStory } from '../../entities/UserStory';
import { Project } from '../../entities/Project';

interface UserStoryFormDebugProps {
  story?: UserStory;
  projects: Project[];
  onSave: (story: UserStory) => void;
  onCancel: () => void;
}

const UserStoryFormDebug: React.FC<UserStoryFormDebugProps> = ({ 
  story, 
  projects, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: story?.title || '',
    projectId: story?.projectId || (projects.length > 0 ? projects[0].id.toString() : ''),
    description: story?.description || '',
    status: story?.status || 'todo' as const,
    priority: story?.priority || 'medium' as const,
    acceptanceCriteria: story?.acceptanceCriteria || ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        projectId: story.projectId,
        description: story.description,
        status: story.status,
        priority: story.priority,
        acceptanceCriteria: story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : ['']
      });
    } else if (projects.length > 0 && !formData.projectId) {
      // Define o primeiro projeto como padrão se não há projeto selecionado
      setFormData(prev => ({
        ...prev,
        projectId: projects[0].id.toString()
      }));
    }
  }, [story, projects, formData.projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Projeto é obrigatório';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.acceptanceCriteria.every(criteria => !criteria.trim())) {
      newErrors.acceptanceCriteria = 'Pelo menos um critério de aceite é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const filteredCriteria = formData.acceptanceCriteria.filter(criteria => criteria.trim());
      
      const storyData: UserStory = {
        id: story?.id || 0,
        title: formData.title,
        projectId: formData.projectId,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        acceptanceCriteria: filteredCriteria,
        createdDate: story?.createdDate || new Date().toISOString(),
        updatedDate: new Date().toISOString()
      };
      
      onSave(storyData);
    }
  };

  const addCriteria = () => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: [...prev.acceptanceCriteria, '']
    }));
  };

  const removeCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
    }));
  };

  const updateCriteria = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.map((criteria, i) => 
        i === index ? value : criteria
      )
    }));
  };

  const formStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '0.5rem',
    boxSizing: 'border-box'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    marginRight: '0.5rem'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  const addButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: '0.875rem',
    padding: '0.5rem 1rem'
  };

  const removeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    marginLeft: '0.5rem'
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={formStyle}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {story ? 'Editar História' : 'Nova História de Usuário'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: errors.title ? '#ef4444' : '#d1d5db'
              }}
              placeholder="Como usuário, eu quero..."
            />
            {errors.title && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.title}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Projeto *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: errors.projectId ? '#ef4444' : '#d1d5db'
              }}
            >
              <option value="">Selecione um projeto</option>
              {projects.map(project => (
                <option key={project.id} value={project.id.toString()}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.projectId}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: errors.description ? '#ef4444' : '#d1d5db',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Descreva detalhadamente a história..."
            />
            {errors.description && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.description}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                style={inputStyle}
              >
                <option value="todo">A Fazer</option>
                <option value="inprogress">Em Progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                style={inputStyle}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Critérios de Aceite *
            </label>
            {formData.acceptanceCriteria.map((criteria, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={criteria}
                  onChange={(e) => updateCriteria(index, e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0, marginRight: '0.5rem' }}
                  placeholder={`Critério ${index + 1}`}
                />
                {formData.acceptanceCriteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriteria(index)}
                    style={removeButtonStyle}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            {errors.acceptanceCriteria && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.acceptanceCriteria}</p>}
            
            <button
              type="button"
              onClick={addCriteria}
              style={addButtonStyle}
            >
              + Adicionar Critério
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
              Cancelar
            </button>
            <button type="submit" style={primaryButtonStyle}>
              {story ? 'Salvar Alterações' : 'Criar História'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserStoryFormDebug;
