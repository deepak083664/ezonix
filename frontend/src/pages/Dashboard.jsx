import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileText,
  BellRing,
  History,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Flame,
  CheckSquare,
  Folder,
  MessageSquare,
  Settings,
  ShoppingBag,
  BarChart3,
  Eye,
  CreditCard
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/reports/dashboard-stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 animate-pulse-subtle"></div>
      </div>
    );
  }

  const sales = stats?.cards?.totalSales || 0;
  const pending = stats?.cards?.pendingPayments || 0;
  const paidSales = Math.max(0, sales - pending);
  const purchases = stats?.cards?.totalPurchases || 0;
  const expenses = stats?.cards?.totalExpenses || 0;
  const incomes = stats?.cards?.totalIncomes || 0;
  const profit = (sales + incomes) - (purchases + expenses);
  const chartData = stats?.charts || [];

  const growthPercent = chartData.length >= 2 
    ? (((chartData[chartData.length - 1]?.sales - chartData[chartData.length - 2]?.sales) / (chartData[chartData.length - 2]?.sales || 1)) * 100).toFixed(1)
    : '12.4';

  // App Launcher Grid Items matching user request
  const launcherItems = [
    { name: 'Products', path: '/app/products', icon: Package, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/10' },
    { name: 'Invoices (Orders)', path: '/app/invoices', icon: FileText, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/10' },
    { name: 'Customers', path: '/app/customers', icon: Users, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/10' },
    { name: 'Payments', path: '/app/payments', icon: CreditCard, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/10' },
    { name: 'Purchases', path: '/app/purchases', icon: ShoppingBag, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/10' },
    { name: 'Expenses', path: '/app/expenses', icon: Receipt, color: 'from-rose-500 to-red-650', shadow: 'shadow-rose-500/10' },
    { name: 'Incomes', path: '/app/incomes', icon: Coins, color: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-450/10' },
    { name: 'Leads', path: '/app/leads', icon: Flame, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/10' },
    { name: 'Tasks', path: '/app/tasks', icon: CheckSquare, color: 'from-indigo-400 to-blue-500', shadow: 'shadow-indigo-500/10' },
    { name: 'Reports (Analytics)', path: '/app/reports', icon: BarChart3, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/10' },
    { name: 'Documents', path: '/app/documents', icon: Folder, color: 'from-sky-500 to-indigo-500', shadow: 'shadow-sky-500/10' },
    { name: 'Settings', path: '/app/settings', icon: Settings, color: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/10' },
  ];

  // Specific dashboard cards requested by the user:
  // - Revenue
  // - Orders
  // - Customers
  // - Products
  // - Sales
  // - Visitors
  const dashboardCards = [
    {
      title: 'Revenue',
      value: `$${sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: '#3b82f6',
      bgColor: 'bg-blue-500/10 text-blue-500',
      dataKey: 'sales',
      desc: `+${growthPercent}% vs last mo`
    },
    {
      title: 'Orders',
      value: stats?.notifications?.pendingPaymentsAlerts?.length || 0, // Pending invoices count as active orders
      icon: FileText,
      color: '#ef4444',
      bgColor: 'bg-red-500/10 text-red-500',
      dataKey: 'expenses',
      desc: 'Pending invoice actions'
    },
    {
      title: 'Customers',
      value: stats?.cards?.totalCustomers || 0,
      icon: Users,
      color: '#6366f1',
      bgColor: 'bg-indigo-500/10 text-indigo-500',
      dataKey: 'sales',
      desc: 'Active direct profiles'
    },
    {
      title: 'Products',
      value: stats?.cards?.totalProducts || 0,
      icon: Package,
      color: '#a855f7',
      bgColor: 'bg-purple-500/10 text-purple-500',
      dataKey: 'expenses',
      desc: 'Database inventory'
    },
    {
      title: 'Sales',
      value: `$${paidSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: 'bg-emerald-500/10 text-emerald-500',
      dataKey: 'sales',
      desc: 'Settled deposits'
    },
    {
      title: 'Visitors',
      value: '1,420',
      icon: Eye,
      color: '#ec4899',
      bgColor: 'bg-pink-500/10 text-pink-500',
      dataKey: 'sales',
      desc: 'Simulated traffic index'
    }
  ];

  const lowStockCount = stats?.notifications?.lowStockAlerts?.length || 0;
  const pendingPaymentsCount = stats?.notifications?.pendingPaymentsAlerts?.length || 0;

  return (
    <div className="space-y-6 text-left pb-16 lg:pb-0">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-850 dark:text-white sm:text-2xl">
            Hi, {user?.name || 'Partner'}!
          </h1>
          <p className="text-[11px] font-semibold text-slate-400">
            EZONIX Premium Business Hub
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-primary">
          Live Session
        </span>
      </div>

      {/* MOBILE FIRST APP LAUNCHER GRID */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Quick Launchpad
        </h3>
        <div className="grid grid-cols-3 gap-3.5 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
          {launcherItems.map((app) => {
            const Icon = app.icon;
            return (
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                key={app.name}
                onClick={() => navigate(app.path)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800/80 shadow-xs transition-all cursor-pointer ${app.shadow}`}
              >
                {/* App icon block */}
                <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon size={18} className="sm:size-[20px]" />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 text-center truncate w-full">
                  {app.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* WARNING NOTIFICATION BANNER ALERTS */}
       {(lowStockCount > 0 || pendingPaymentsCount > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lowStockCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 p-4 dark:border-red-950/20 dark:bg-red-950/10 text-red-800 dark:text-red-400">
              <BellRing className="shrink-0 text-red-505" size={16} />
              <div className="text-[11px] font-semibold">
                <span className="font-black text-red-650">Low Stock Alert:</span> {lowStockCount} items below margin.{' '}
                <Link to="/app/products" className="font-bold underline text-red-700 dark:text-red-400">
                  Manage Catalog
                </Link>
              </div>
            </div>
          )}

          {pendingPaymentsCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-yellow-200/80 bg-yellow-50 p-4 dark:border-yellow-950/20 dark:bg-yellow-950/10 text-yellow-800 dark:text-yellow-400">
              <AlertTriangle className="shrink-0 text-yellow-500" size={16} />
              <div className="text-[11px] font-semibold">
                <span className="font-black text-yellow-650">Outstanding payments:</span> {pendingPaymentsCount} collections waiting.{' '}
                <Link to="/app/payments" className="font-bold underline text-yellow-700 dark:text-yellow-400">
                  Reconcile Cash
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgraded Dashboard Cards: Revenue, Orders, Customers, Products, Sales, Visitors */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Performance Indicators
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dashboardCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 hover:scale-[1.02] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`rounded-xl p-1.5 ${card.bgColor}`}>
                    <Icon size={14} />
                  </div>
                </div>
                
                <h3 className="mt-3.5 text-lg font-black text-slate-800 dark:text-white">
                  {card.value}
                </h3>
                
                <span className="text-[9px] font-semibold text-slate-450 mt-1 block">
                  {card.desc}
                </span>

                {/* Sparkline chart */}
                <div className="h-6 w-full mt-3 opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Area
                        type="monotone"
                        dataKey={card.dataKey}
                        stroke={card.color}
                        strokeWidth={1}
                        fillOpacity={0.03}
                        fill={card.color}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
          Financial growth trend
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
              <XAxis dataKey="monthName" stroke="#94A3B8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  color: '#F8FAFC',
                  borderRadius: '12px',
                  fontSize: '10px',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales ($)"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Timeline Activities */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850 mb-3">
          <History size={14} className="text-slate-400" />
          <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-255 uppercase tracking-wider">
            Operations logs
          </h4>
        </div>
        <div className="flow-root max-h-[180px] overflow-y-auto pr-1">
          <ul className="-mb-8">
            {stats?.activityLogs?.slice(0, 4).map((log, logIdx) => (
              <li key={log._id}>
                <div className="relative pb-5">
                  {logIdx !== 3 ? (
                    <span className="absolute top-3.5 left-3.5 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-2.5">
                    <div>
                      <span className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-primary text-[10px] font-black">
                        {logIdx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5 flex justify-between space-x-2">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-205">
                          {log.action} <span className="font-semibold text-slate-400 font-sans">({log.description})</span>
                        </p>
                      </div>
                      <div className="text-right text-[9px] text-slate-400 font-bold whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
