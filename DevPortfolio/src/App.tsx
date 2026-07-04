import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import './App.css';

const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage     = lazy(() => import('./pages/projects/ProjectsPage'));
const UserStoriesPage  = lazy(() => import('./pages/user-stories/UserStoriesPage'));
const DocumentationPage = lazy(() => import('./pages/documentation/DocumentationPage'));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={null}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
