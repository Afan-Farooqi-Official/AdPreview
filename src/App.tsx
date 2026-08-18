import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, useAuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/shared/Toast';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { EditorPage } from './pages/EditorPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PricingPage } from './pages/PricingPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Spinner } from './components/shared/Spinner';
import type { ReactNode } from 'react';

// Auth guard — redirects unauthenticated users to /signup
function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/signup?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Editor is accessible in sample mode without auth, but upload/save require auth */}
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/:projectId" element={
              <RequireAuth><EditorPage /></RequireAuth>
            } />

            {/* Protected routes */}
            <Route path="/projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
