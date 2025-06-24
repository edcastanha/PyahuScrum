import React, { useState, useEffect } from 'react';
import { Activity } from '../../entities/Activity';
import { Project } from '../../entities/Project';
import { projectService } from '../../services/project/projectService';
import { activityService } from '../../services/activity/activityService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/dashboard/StatCard';
import ProjectProgressCard from '../../components/dashboard/ProjectProgressCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import TechDistribution from '../../components/dashboard/TechDistribution';
import { BarChart, FileCode, RefreshCcw, LayoutGrid } from 'lucide-react';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    activeStories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = () => {
    setIsLoading(true);

    // Carregar projetos
    const loadedProjects = projectService.getProjects();
    setProjects(loadedProjects);

    // Carregar atividades
    const loadedActivities = activityService.getActivities();
    setActivities(loadedActivities);

    // Carregar estatísticas
    const projectStats = projectService.getProjectStats();
    const activityStats = activityService.getActivityStats();
    
    setStats({
      totalProjects: projectStats.total,
      completedProjects: projectStats.completed,
      activeStories: activityStats.activeStories,
    });

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Adicionar listener para atualização de projetos
    const handleProjectsUpdated = () => {
      loadData();
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    
    // Limpeza ao desmontar
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
    };
  }, []);

  const handleRefresh = () => {
    loadData();
    showToast('info', 'Dashboard atualizado com sucesso!');
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <button className={styles.refreshButton} onClick={handleRefresh}>
          <RefreshCcw size={16} />
          <span>Atualizar</span>
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Carregando dados...</div>
      ) : (
        <>
          <div className={styles.statsSection}>
            <StatCard
              icon={LayoutGrid}
              label="Total de Projetos"
              value={stats.totalProjects.toString()}
              details="Projetos cadastrados"
              iconBgColor="#3B82F6"
            />
            <StatCard
              icon={BarChart}
              label="Projetos Concluídos"
              value={stats.completedProjects.toString()}
              details={`${stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% da carteira`}
              iconBgColor="#10B981"
            />
            <StatCard
              icon={FileCode}
              label="Histórias Ativas"
              value={stats.activeStories.toString()}
              details="Em desenvolvimento"
              iconBgColor="#F59E0B"
            />
          </div>

          <div className={styles.mainContent}>
            <div className={styles.leftColumn}>
              <div className={styles.projectsSection}>
                <h2>Projetos em Andamento</h2>
                <div className={styles.projectsList}>
                  {projects
                    .filter(project => project.status === 'active')
                    .map(project => (
                      <ProjectProgressCard key={project.id} project={project} />
                    ))}
                </div>
              </div>
              
              <div className={styles.techSection}>
                <TechDistribution />
              </div>
            </div>
            
            <div className={styles.rightColumn}>
              <div className={styles.quickActionsSection}>
                <QuickActions />
              </div>
              
              <div className={styles.activitySection}>
                <h2>Atividade Recente</h2>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
