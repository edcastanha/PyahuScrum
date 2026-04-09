import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import UserStoriesPage from './pages/user-stories/UserStoriesPage';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from '@material-tailwind/react';
import './App.css';

import DocumentationPage from './pages/documentation/DocumentationPage';
import LoginPage from './pages/auth/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';


function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProjectsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-stories"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UserStoriesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentation"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DocumentationPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
