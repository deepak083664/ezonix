import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Building2, Search, Menu, X, Users, Package, FileText, Bell, Plus, Settings, ChevronDown, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API, { BACKEND_URL } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

const Navbar = ({ onMobileToggle }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
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
  
  const [businessName, setBusinessName] = useState('ezonix');
  const [logo, setLogo] = useState('');

  // Global search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Interactive panels
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const quickActionRef = useRef(null);

  // Fetch settings & notifications
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data.data.setting) {
          setBusinessName(res.data.data.setting.businessName || 'ezonix');
          setLogo(res.data.data.setting.logoUrl || '');
        }
      } catch (err) {
        console.error('Error fetching settings in navbar', err);
      }
    };
    
    const fetchAlerts = async () => {
      try {
        const res = await API.get('/reports/dashboard-stats');
        const alertList = [];
        if (res.data.data.notifications) {
          const { lowStockAlerts = [], pendingPaymentsAlerts = [] } = res.data.data.notifications;
          lowStockAlerts.forEach(item => {
            alertList.push({ id: `stock-${item._id}`, text: `${item.name} is below stock threshold.`, type: 'warning', path: '/products' });
          });
          pendingPaymentsAlerts.forEach(item => {
            alertList.push({ id: `payment-${item._id}`, text: `Invoice ${item.invoiceNumber} is outstanding.`, type: 'payment', path: '/payments' });
          });
        }
        setAlerts(alertList);
      } catch (err) {
        console.error('Error fetching notifications in navbar', err);
      }
    };

    fetchSettings();
    fetchAlerts();
  }, []);

  // Search query handler
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults(null);
        setShowSearchDropdown(false);
        return;
      }

      setSearchLoading(true);
      setShowSearchDropdown(true);
      try {
        const res = await API.get(`/reports/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target)) {
        setShowQuickAction(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleResultClick = (type, keyword) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    
    if (type === 'customer') {
      navigate(`/customers?search=${encodeURIComponent(keyword)}`);
    } else if (type === 'product') {
      navigate(`/products?search=${encodeURIComponent(keyword)}`);
    } else if (type === 'invoice') {
      navigate(`/invoices?search=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors duration-300">
      
      {/* Left section: brand/mobile hamburger */}
      <div className="flex items-center gap-4">
        {onMobileToggle && (
          <button
            onClick={onMobileToggle}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 lg:hidden focus:outline-none"
          >
            <Menu size={18} />
          </button>
        )}
        
        <div className="hidden items-center gap-3 sm:flex">
          {logo ? (
            <img
              src={logo.startsWith('http') ? logo : `${BACKEND_URL}${logo}`}
              alt="Logo"
              onClick={handleLogoClick}
              className="h-8 w-8 rounded-lg object-contain bg-slate-900 dark:bg-slate-800/50 p-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            />
          ) : (
            <div 
              onClick={handleLogoClick}
              className="rounded-lg bg-blue-500/10 p-1.5 text-primary cursor-pointer hover:bg-blue-500/20 transition-all animate-pulse-subtle"
            >
              <Building2 size={16} />
            </div>
          )}
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {businessName}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative mx-4 w-full max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery) setShowSearchDropdown(true); }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-4 pl-9 text-xs text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-left"
            >
              {searchLoading ? (
                <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                  Searching records...
                </div>
              ) : !searchResults || 
                (searchResults.customers.length === 0 && 
                 searchResults.products.length === 0 && 
                 searchResults.invoices.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Customers block */}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <h5 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <Users size={12} /> Customers
                      </h5>
                      <div className="space-y-1">
                        {searchResults.customers.map((c) => (
                          <button
                            key={c._id}
                            onClick={() => handleResultClick('customer', c.name)}
                            className="w-full rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 block text-left text-slate-700 dark:text-slate-350"
                          >
                            {c.name} <span className="text-slate-400 font-normal">({c.phone})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products block */}
                  {searchResults.products.length > 0 && (
                    <div>
                      <h5 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <Package size={12} /> Products
                      </h5>
                      <div className="space-y-1">
                        {searchResults.products.map((p) => (
                          <button
                            key={p._id}
                            onClick={() => handleResultClick('product', p.sku)}
                            className="w-full rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 block text-left text-slate-700 dark:text-slate-350"
                          >
                            {p.name} <span className="font-mono text-slate-400 text-[10px]">({p.sku})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoices block */}
                  {searchResults.invoices.length > 0 && (
                    <div>
                      <h5 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <FileText size={12} /> Invoices
                      </h5>
                      <div className="space-y-1">
                        {searchResults.invoices.map((inv) => (
                          <button
                            key={inv._id}
                            onClick={() => handleResultClick('invoice', inv.invoiceNumber)}
                            className="w-full rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 block text-left text-slate-700 dark:text-slate-350"
                          >
                            {inv.invoiceNumber} <span className="text-slate-400 font-normal">({inv.customer?.name})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section: Theme, Notifications, Quick Actions, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl p-2 text-slate-450 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-colors focus:outline-none"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Quick Action Button */}
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => setShowQuickAction(!showQuickAction)}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/15 hover:bg-primary-hover focus:outline-none transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          <AnimatePresence>
            {showQuickAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-left"
              >
                <button
                  onClick={() => { setShowQuickAction(false); navigate('/customers'); }}
                  className="w-full rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 block text-left"
                >
                  + Add Customer
                </button>
                <button
                  onClick={() => { setShowQuickAction(false); navigate('/products'); }}
                  className="w-full rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 block text-left"
                >
                  + Add Product
                </button>
                <button
                  onClick={() => { setShowQuickAction(false); navigate('/invoices'); }}
                  className="w-full rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 block text-left"
                >
                  + Create Invoice
                </button>
                <button
                  onClick={() => { setShowQuickAction(false); navigate('/tasks'); }}
                  className="w-full rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 block text-left"
                >
                  + Create Task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-450 hover:bg-slate-50 hover:text-slate-850 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-colors focus:outline-none"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-left"
              >
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Outstanding Alerts
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 font-extrabold">
                    {alerts.length} New
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => { setShowNotifications(false); navigate(alert.path); }}
                      className="w-full text-left rounded-xl p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700/80 block"
                    >
                      <p className="font-semibold text-slate-700 dark:text-slate-350">{alert.text}</p>
                      <span className="text-[10px] text-primary hover:underline mt-1 block font-bold">Trace catalog &rarr;</span>
                    </button>
                  ))}

                  {alerts.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No outstanding alerts. System healthy!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="h-7 w-7 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
            ) : (
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <UserIcon size={14} />
              </div>
            )}
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-left"
              >
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                  <p className="text-xs font-bold text-slate-850 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded mt-1.5">
                    {user?.role || 'User'}
                  </span>
                </div>

                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                  className="w-full rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/40 flex items-center gap-2"
                >
                  <Settings size={13} /> Settings
                </button>
                
                <button
                  onClick={logout}
                  className="w-full rounded-xl px-2.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 mt-1"
                >
                  <LogOut size={13} /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
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
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">
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
    </header>
  );
};

export default Navbar;
