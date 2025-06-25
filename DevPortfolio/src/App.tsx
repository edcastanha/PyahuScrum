import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import UserStoriesPage from './pages/user-stories/UserStoriesPage';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from '@material-tailwind/react';
import './App.css';

import DocumentationPage from './pages/documentation/DocumentationPage';


function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
