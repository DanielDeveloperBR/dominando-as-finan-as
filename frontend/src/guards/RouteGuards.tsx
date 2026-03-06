import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { usuario, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { usuario, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};