import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import './App.css';

const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage       = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage        = lazy(() => import('./pages/projects/ProjectsPage'));
const ElicitacaoPage      = lazy(() => import('./pages/pipeline/ElicitacaoPage'));
const ProgressoPage       = lazy(() => import('./pages/pipeline/ProgressoPage'));
const ConcluidoPage       = lazy(() => import('./pages/pipeline/ConcluidoPage'));

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
                path="/pipeline/elicitacao"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ElicitacaoPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline/progresso"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProgressoPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline/concluido"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ConcluidoPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
