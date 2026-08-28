import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import { buildSidebarProfileSummary } from '../../services/auth/profileSummary';
import { 
  Gauge, 
  FolderKanban, 
  Clock, 
  FileText, 
  Github, 
  Code2, 
  Menu, 
  X 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { isAuthenticated, profile, githubLogin, refreshProfile } = useAuth();
  const location = useLocation();
  const summary = buildSidebarProfileSummary(profile, githubLogin);
  
  // Detecta se a tela é móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void refreshProfile();
  }, [isAuthenticated, location.pathname, refreshProfile]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [summary.avatarSource]);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {isMobile && (
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo}>
        <Code2 />
        <span>DevPortfolio</span>
      </div>
      <nav className={styles.navigation}>
        <p className={styles.navHeader}>NAVEGAÇÃO</p>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
          <Gauge /> Visão geral dos projetos
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? styles.active : ''}>
          <FolderKanban /> Gerenciar projetos
        </NavLink>
        <NavLink to="/user-stories" className={({ isActive }) => isActive ? styles.active : ''}>
          <Clock /> User Stories e backlog
        </NavLink>
        <NavLink to="/documentation" className={({ isActive }) => isActive ? styles.active : ''}>
          <FileText /> README e ADRs
        </NavLink>
      </nav>
      <div className={styles.quickLinks}>
        <p className={styles.navHeader}>LINKS RÁPIDOS</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Github /> GitHub
        </a>
      </div>
      <footer className={styles.footer}>
        <div className={styles.profile}>
            <div className={styles.avatar}>
              {summary.avatarSource && !avatarFailed ? (
                <img
                  className={styles.avatarImage}
                  src={summary.avatarSource}
                  alt={`Avatar de ${summary.displayName}`}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{summary.avatarFallback}</span>
              )}
            </div>
            <div className={styles.profileInfo}>
                <p>{summary.displayName}</p>
                <span>{summary.displayLocation}</span>
            </div>
        </div>
      </footer>
    </aside>
    </>
  );
};

export default Sidebar;
