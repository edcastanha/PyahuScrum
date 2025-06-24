import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FaTachometerAlt, FaProjectDiagram, FaFileAlt } from 'react-icons/fa';
import { FaGithub, FaCode, FaUserClock } from 'react-icons/fa6';

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <FaCode />
        <span>DevPortfolio</span>
      </div>
      <nav className={styles.navigation}>
        <p className={styles.navHeader}>NAVEGAÇÃO</p>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaTachometerAlt /> Visão geral dos projetos
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaProjectDiagram /> Gerenciar projetos
        </NavLink>
        <NavLink to="/user-stories" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaUserClock /> User Stories e backlog
        </NavLink>
        <NavLink to="/documentation" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaFileAlt /> README e ADRs
        </NavLink>
      </nav>
      <div className={styles.quickLinks}>
        <p className={styles.navHeader}>LINKS RÁPIDOS</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <FaGithub /> GitHub
        </a>
      </div>
      <footer className={styles.footer}>
        <div className={styles.profile}>
            <div className={styles.avatar}>FS</div>
            <div className={styles.profileInfo}>
                <p>Full Stack Dev</p>
                <span>React • Angular • Django</span>
            </div>
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;
