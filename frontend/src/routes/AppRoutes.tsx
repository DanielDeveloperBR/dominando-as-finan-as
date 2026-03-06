import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CriarGrupo } from '@/pages/CriarGrupo';
import { ProtectedRoute, PublicRoute } from '@/guards/RouteGuards';


export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* Rotas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Rotas autenticadas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/criar-grupo"
        element={
          <ProtectedRoute>
            <CriarGrupo />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};