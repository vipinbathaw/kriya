import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotesListPage } from './pages/NotesListPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { CreateNotePage } from './pages/CreateNotePage';
import { EditNotePage } from './pages/EditNotePage';
import { FinanceListPage } from './pages/FinanceListPage';
import { FinanceDetailPage } from './pages/FinanceDetailPage';
import { CreateFinancePage } from './pages/CreateFinancePage';
import { EditFinancePage } from './pages/EditFinancePage';
import { NutritionListPage } from './pages/NutritionListPage';
import { NutritionDetailPage } from './pages/NutritionDetailPage';
import { CreateNutritionPage } from './pages/CreateNutritionPage';
import { DashboardPage } from './pages/DashboardPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { ToastContainer } from './components/shared/ToastContainer';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notes" element={<NotesListPage />} />
          <Route path="notes/new" element={<CreateNotePage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
          <Route path="notes/:id/edit" element={<EditNotePage />} />
          <Route path="finance" element={<FinanceListPage />} />
          <Route path="finance/new" element={<CreateFinancePage />} />
          <Route path="finance/:id" element={<FinanceDetailPage />} />
          <Route path="finance/:id/edit" element={<EditFinancePage />} />
          <Route path="nutrition" element={<NutritionListPage />} />
          <Route path="nutrition/new" element={<CreateNutritionPage />} />
          <Route path="nutrition/:id" element={<NutritionDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
