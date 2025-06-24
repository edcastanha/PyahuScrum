import React, { useState, useEffect } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import ProjectProgressCard from '../../components/dashboard/ProjectProgressCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import styles from './DashboardPage.module.css';
import { FolderKanban, CheckCircle, ListTodo, FileText } from 'lucide-react';
import { Project } from '../../entities/Project';
import { Activity } from '../../entities/Activity';
import { mockProjects } from '../../services/mock/projectMock';
import { mockActivities } from '../../services/mock/activityMock';

const DashboardPage: React.FC = () => {
  // Os dados virão do backend no futuro.
  const [stats, setStats] = useState([
    {
      icon: FolderKanban,
      label: 'Total de Projetos',
      value: '0',
      details: '',
      iconBgColor: '#3B82F6',
    },
    {
      icon: CheckCircle,
      label: 'Projetos Concluídos',
      value: '0',
      details: '',
      iconBgColor: '#10B981',
    },
    {
      icon: ListTodo,
      label: 'Stories Ativas',
      value: '0',
      details: '',
      iconBgColor: '#F59E0B',
    },
    {
      icon: FileText,
      label: 'ADRs Documentados',
      value: '0',
      details: '',
      iconBgColor: '#8B5CF6',
    },
  ]);

  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Carregar dados mock
  useEffect(() => {
    // Filtrar apenas projetos ativos
    const filteredProjects = mockProjects.filter(project => project.status === 'active');
    setActiveProjects(filteredProjects);
    
    // Carregar dados de atividades
    setActivities(mockActivities);
    
    // Atualizar estatísticas
    const totalProjects = mockProjects.length;
    const completedProjects = mockProjects.filter(p => p.status === 'completed').length;
    const activeStories = 5; // Valor simulado para user stories
    const documentedADRs = 0; // Valor simulado para ADRs
    
    // Usando atualização funcional para não depender de 'stats' como dependência
    setStats(currentStats => [
      {
        ...currentStats[0],
        value: totalProjects.toString(),
      },
      {
        ...currentStats[1],
        value: completedProjects.toString(),
      },
      {
        ...currentStats[2],
        value: activeStories.toString(),
      },
      {
        ...currentStats[3],
        value: documentedADRs.toString(),
      },
    ]);
  }, []);

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <div>
          <h1>Dashboard Profissional</h1>
          <p>Gerencie seus projetos Full Stack, documentação e histórias de usuário em um só lugar</p>
        </div>
        <button className={styles.addButton} onClick={() => window.location.href = '/projects'}>
          + Novo Projeto
        </button>
      </header>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            details={stat.details}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <h2>Progresso dos Projetos</h2>
          {activeProjects.length > 0 ? (
            activeProjects.map((project) => (
              <ProjectProgressCard key={project.id} project={project} />
            ))
          ) : (
            <p>Nenhum projeto ativo no momento.</p>
          )}
        </div>
        <div className={styles.rightColumn}>
          <h2>Feed de Atividades</h2>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
