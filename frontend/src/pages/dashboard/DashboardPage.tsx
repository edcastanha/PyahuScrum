import React, { useState, useEffect, useCallback } from 'react';
import { Activity } from '../../entities/Activity';
import { Project } from '../../entities/Project';
import { projectService } from '../../services/project/projectService';
import { activityService } from '../../services/activity/activityService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/dashboard/StatCard';
import ProjectProgressCard from '../../components/dashboard/ProjectProgressCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import PipelineStatusPanel from '../../components/dashboard/PipelineStatusPanel';
import { BarChart, FileCode, RefreshCcw, LayoutGrid } from 'lucide-react';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pipelineStats, setPipelineStats] = useState({
    total: 0, elicitando: 0, gerandoAdr: 0, concluido: 0, falha: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(() => {
    setIsLoading(true);
    setProjects(projectService.getProjects());
    setActivities(activityService.getActivities());
    setPipelineStats(projectService.getPipelineStats());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('projectsUpdated', loadData);
    return () => window.removeEventListener('projectsUpdated', loadData);
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData();
    showToast('info', 'Dashboard atualizado!');
  }, [loadData, showToast]);

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
              value={pipelineStats.total.toString()}
              details="Projetos cadastrados"
              iconBgColor="#3B82F6"
            />
            <StatCard
              icon={BarChart}
              label="Concluídos"
              value={pipelineStats.concluido.toString()}
              details="Artefatos disponíveis para download"
              iconBgColor="#10B981"
            />
            <StatCard
              icon={FileCode}
              label="Em processamento"
              value={(pipelineStats.elicitando + pipelineStats.gerandoAdr).toString()}
              details="Elicitando ou gerando documentação"
              iconBgColor="#F59E0B"
            />
          </div>

          <div className={styles.mainContent}>
            <div className={styles.leftColumn}>

              {/* Projetos recentes */}
              {projects.length > 0 && (
                <div className={styles.projectsSection}>
                  <h2>Projetos Recentes</h2>
                  <div className={styles.projectsList}>
                    {projects.slice(0, 4).map(project => (
                      <ProjectProgressCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {/* Painel de status do pipeline (substitui TechDistribution) */}
              <div className={styles.techSection}>
                <PipelineStatusPanel stats={pipelineStats} />
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
