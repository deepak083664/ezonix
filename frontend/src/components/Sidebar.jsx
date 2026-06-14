import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  ShoppingBag,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coins,
  X,
  Flame,
  CheckSquare,
  Folder,
  MessageSquare,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleLogoClick = () => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can access the Admin Panel.');
      return;
    }
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminPassModal(true);
        return 0;
      }
      return next;
    });
    // Reset click count after 3 seconds
    setTimeout(() => {
      setLogoClicks(0);
    }, 3000);
  };

  const handleAdminPassSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'ezonix@2026') {
      sessionStorage.setItem('adminUnlocked', 'true');
      setShowAdminPassModal(false);
      setAdminPassword('');
      setShowPasswordText(false);
      toast.success('Admin Panel unlocked successfully!');
      navigate('/app/admin');
    } else {
      toast.error('Incorrect admin password.');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Customers', path: '/app/customers', icon: Users },
    { name: 'Products', path: '/app/products', icon: Package },
    { name: 'Invoices', path: '/app/invoices', icon: FileSpreadsheet },
    { name: 'Purchases', path: '/app/purchases', icon: ShoppingBag },
    { name: 'Expenses', path: '/app/expenses', icon: Receipt },
    { name: 'Payments', path: '/app/payments', icon: CreditCard },
    { name: 'Incomes', path: '/app/incomes', icon: Coins },
    { name: 'Leads', path: '/app/leads', icon: Flame },
    { name: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { name: 'Reports', path: '/app/reports', icon: BarChart3 },
    { name: 'Documents', path: '/app/documents', icon: Folder },
    { name: 'Communication', path: '/app/communication', icon: MessageSquare },
  ];

  menuItems.push({ name: 'Settings', path: '/app/settings', icon: Settings });

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            onClick={handleLogoClick}
            className="h-8 w-8 rounded-lg object-contain bg-slate-900 dark:bg-slate-800/50 p-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          />
          {(!collapsed || isOpen) && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-slate-100 uppercase"
            >
              EZO<span className="text-primary">INX</span>
            </motion.span>
          )}
        </div>
        {isOpen && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="relative group">
              <NavLink
                to={item.path}
                onClick={() => { if (isOpen) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500/10 text-primary dark:bg-blue-950/40'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800/40 dark:hover:text-slate-250'
                  } ${collapsed && !isOpen ? 'justify-center' : 'gap-3'}`
                }
              >
                <Icon size={16} className="shrink-0" />
                {(!collapsed || isOpen) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>

              {/* Hover Tooltip when collapsed */}
              {collapsed && !isOpen && (
                <div className="absolute left-full top-1/2 ml-3 -translate-y-1/2 scale-0 group-hover:scale-100 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-white transition-all duration-150 z-50 whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapsible toggle footer for desktop */}
      {!isOpen && (
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-450 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-slate-950 focus:outline-none transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Mobile drawer slider */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden h-screen flex-col transition-all duration-300 lg:flex shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
      <Modal 
        isOpen={showAdminPassModal} 
        onClose={() => { setShowAdminPassModal(false); setAdminPassword(''); setShowPasswordText(false); }} 
        title="Admin Panel Authentication"
      >
        <form onSubmit={handleAdminPassSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please enter the system administrator security key to unlock the Admin Panel.
          </p>
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
              Security Key
            </label>
            <div className="relative">
              <input
                type={showPasswordText ? "text" : "password"}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="form-input pr-10"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
              >
                {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setShowAdminPassModal(false); setAdminPassword(''); setShowPasswordText(false); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              Verify & Enter
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Sidebar;
