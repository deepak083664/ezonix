import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutDashboard, Flame, Search, CheckSquare, MessageSquare } from 'lucide-react';

// Layout components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';

// Page components
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Payments from './pages/Payments';
import Incomes from './pages/Incomes';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// New SaaS views
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';

// New Mock SaaS views
import Leads from './pages/Leads';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Communication from './pages/Communication';

// Protected Route Wrapper Component
const ProtectedLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMobileToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 pb-20 lg:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* SaaS Admin Panel */}
            <Route 
              path="/admin" 
              element={
                user?.role === 'admin' && sessionStorage.getItem('adminUnlocked') === 'true'
                  ? <AdminDashboard /> 
                  : <Navigate to="/app" replace />
              } 
            />
            
            {/* New mock SaaS page paths */}
            <Route path="/leads" element={<Leads />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/communication" element={<Communication />} />

            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-850 h-16 flex items-center justify-around px-4 lg:hidden pb-safe shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/leads"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <Flame size={18} />
          <span className="text-[9px] font-bold mt-1">Leads</span>
        </NavLink>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
          className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
        >
          <Search size={18} />
          <span className="text-[9px] font-bold mt-1">Search</span>
        </button>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <CheckSquare size={18} />
          <span className="text-[9px] font-bold mt-1">Tasks</span>
        </NavLink>

        <NavLink
          to="/communication"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <MessageSquare size={18} />
          <span className="text-[9px] font-bold mt-1">Chat</span>
        </NavLink>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <CommandPalette />
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected CRM Dashboard Layout */}
            <Route path="/app/*" element={<ProtectedLayout />} />

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '14px',
                borderRadius: '8px',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
