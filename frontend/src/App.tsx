import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginView } from './features/auth/LoginView';
import { SignupView } from './features/auth/SignupView';
import { ProjectListView } from './features/projects/ProjectListView';
import { TaskBoardView } from './features/tasks/TaskBoardView';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Main Layout Wrapper
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tighter text-indigo-400">NEXUS</h1>
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="text-white hover:text-indigo-400">Dashboard</a>
              <a href="#" className="hover:text-indigo-400">Projects</a>
              <a href="#" className="hover:text-indigo-400">Tasks</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.full_name}</span>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectListView />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
