import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthContext, useAuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/shared/Toast';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { EditorPage } from './pages/EditorPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PricingPage } from './pages/PricingPage';
import { SupportPage } from './pages/SupportPage';
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
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    const fullPath = location.pathname + location.search;
    return <Navigate to={`/signup?redirectTo=${encodeURIComponent(fullPath)}`} replace />;
  }

  return <>{children}</>;
}

// Redirects already logged in users away from /signup
function RedirectIfAuth({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const redirectTo = searchParams.get('redirectTo') ?? '/editor';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
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
            <Route
              path="/signup"
              element={
                <RedirectIfAuth>
                  <SignupPage />
                </RedirectIfAuth>
              }
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* Sign-Up First: Editor is strictly protected */}
            <Route
              path="/editor"
              element={
                <RequireAuth>
                  <EditorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/editor/:projectId"
              element={
                <RequireAuth>
                  <EditorPage />
                </RequireAuth>
              }
            />

            {/* Protected routes */}
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <ProjectsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
