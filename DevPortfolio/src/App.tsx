import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import UserStoriesPage from './pages/user-stories/UserStoriesPage';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Placeholder para a página de documentação
const DocumentationPage = () => <div>Página de Documentação</div>;


function App() {
  return (
    <ToastProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/user-stories" element={<UserStoriesPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </ToastProvider>
  );
}

export default App;
