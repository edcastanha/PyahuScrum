import React, { useState } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import ProjectProgressCard from '../../components/dashboard/ProjectProgressCard';
import styles from './DashboardPage.module.css';
import { FolderKanban, CheckCircle, ListTodo, FileText } from 'lucide-react';
import { Project } from '../../entities/Project';

const DashboardPage: React.FC = () => {
  // Os dados virão do backend no futuro.
  const [stats] = useState([
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

  const [activeProjects] = useState<Project[]>([]);

  // useEffect para buscar dados da API no futuro
  // useEffect(() => {
  //   // Ex: fetch('/api/dashboard').then(res => res.json()).then(data => {
  //   //   setStats(data.stats);
  //   //   setActiveProjects(data.activeProjects);
  //   // });
  // }, []);

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <h1>Dashboard Profissional</h1>
        <p>Gerencie seus projetos Full Stack, documentação e histórias de usuário em um só lugar</p>
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
          <p>Nenhuma atividade recente.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
