import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  CreditCard, 
  Globe, 
  BarChart3, 
  ShieldAlert,
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  UserCheck, 
  UserX,
  Coins,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Lists state
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [cmsContent, setCmsContent] = useState({});

  // Modals / Modifying forms state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: null, name: '', email: '', role: 'staff', active: true, planId: '' });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ id: null, name: '', description: '', price: 0, billingCycle: 'monthly', features: '', isActive: true, sortOrder: 0 });

  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ id: null, userId: '', planId: '', startDate: '', expiryDate: '', status: 'active', paymentStatus: 'paid' });

  // CMS content states
  const [cmsHero, setCmsHero] = useState({ headline: '', subheadline: '', ctaText: '', ctaLink: '', secondaryCtaText: '', secondaryCtaLink: '', overviewImage: '' });
  const [cmsContact, setCmsContact] = useState({ email: '', phone: '', address: '' });
  const [cmsBranding, setCmsBranding] = useState({ siteName: '', logoUrl: '' });

  // Load dashboard data
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, plansRes, subsRes, cmsRes] = await Promise.all([
        API.get('/users'),
        API.get('/plans'),
        API.get('/subscriptions'),
        API.get('/website-content')
      ]);

      setUsers(usersRes.data.data.users || []);
      setPlans(plansRes.data.data.plans || []);
      setSubscriptions(subsRes.data.data.subscriptions || []);
      
      const content = cmsRes.data.data.content || {};
      setCmsContent(content);
      if (content.hero) setCmsHero(content.hero);
      if (content.contact) setCmsContact(content.contact);
      if (content.branding) setCmsBranding(content.branding);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      toast.error('Failed to retrieve control panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- USER HANDLERS ---
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (userForm.id) {
        // Edit User
        const res = await API.put(`/users/${userForm.id}`, {
          name: userForm.name,
          role: userForm.role,
          active: userForm.active
        });
        toast.success('User updated successfully!');
      } else {
        // Invite/Create User
        const res = await API.post('/users', {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          active: userForm.active,
          planId: userForm.planId || undefined
        });
        toast.success('User invited successfully!');
      }
      setShowUserModal(false);
      setUserForm({ id: null, name: '', email: '', role: 'staff', active: true, planId: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user configuration.');
    }
  };

  const handleToggleUserActive = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { active: !user.active });
      toast.success(`User ${user.active ? 'deactivated' : 'activated'} successfully!`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and cancel their subscriptions?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted successfully.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // --- PLAN HANDLERS ---
  const handleSavePlan = async (e) => {
    e.preventDefault();
    const featArray = planForm.features.split(',').map(f => f.trim()).filter(Boolean);
    try {
      if (planForm.id) {
        await API.put(`/plans/${planForm.id}`, { ...planForm, features: featArray });
        toast.success('Plan updated successfully!');
      } else {
        await API.post('/plans', { ...planForm, features: featArray });
        toast.success('New plan added!');
      }
      setShowPlanModal(false);
      setPlanForm({ id: null, name: '', description: '', price: 0, billingCycle: 'monthly', features: '', isActive: true, sortOrder: 0 });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan.');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await API.delete(`/plans/${id}`);
      toast.success('Plan deleted successfully.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete plan: dependency exists.');
    }
  };

  // --- SUBSCRIPTION HANDLERS ---
  const handleSaveSub = async (e) => {
    e.preventDefault();
    try {
      if (subForm.id) {
        await API.put(`/subscriptions/${subForm.id}`, subForm);
        toast.success('Subscription details modified!');
      } else {
        await API.post('/subscriptions', subForm);
        toast.success('Subscription provisioned successfully!');
      }
      setShowSubModal(false);
      setSubForm({ id: null, userId: '', planId: '', startDate: '', expiryDate: '', status: 'active', paymentStatus: 'paid' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subscription.');
    }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Delete this subscription logs?')) return;
    try {
      await API.delete(`/subscriptions/${id}`);
      toast.success('Subscription record deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  // --- CMS CONTENT HANDLER ---
  const handleUpdateCMS = async (key, value) => {
    try {
      await API.put(`/website-content/${key}`, { value });
      toast.success(`${key.toUpperCase()} section content updated!`);
      loadData();
    } catch (err) {
      toast.error('Failed to update website CMS section.');
    }
  };

  // Pre-fill user edit modal
  const openEditUser = (u) => {
    setUserForm({ id: u._id, name: u.name, email: u.email, role: u.role, active: u.active, planId: '' });
    setShowUserModal(true);
  };

  // Pre-fill plan edit modal
  const openEditPlan = (p) => {
    setPlanForm({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      billingCycle: p.billingCycle,
      features: p.features.join(', '),
      isActive: p.isActive,
      sortOrder: p.sortOrder
    });
    setShowPlanModal(true);
  };

  // Pre-fill subscription edit modal
  const openEditSub = (s) => {
    setSubForm({
      id: s._id,
      userId: s.userId?._id || '',
      planId: s.planId?._id || '',
      startDate: s.startDate ? s.startDate.split('T')[0] : '',
      expiryDate: s.expiryDate ? s.expiryDate.split('T')[0] : '',
      status: s.status,
      paymentStatus: s.paymentStatus
    });
    setShowSubModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
            SaaS Admin Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Regulate client subscriptions, user registration listings, website configurations, and track business analytics metrics.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="rounded-xl border border-slate-200 dark:border-slate-800 py-1.5 px-3 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-55 dark:hover:bg-slate-850 cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-6 text-xs sm:text-sm overflow-x-auto pb-px">
        {[
          { id: 'users', label: 'Users & Invites', icon: Users },
          { id: 'plans', label: 'Plans & Pricing', icon: Coins },
          { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
          { id: 'website', label: 'Landing CMS', icon: Globe },
          { id: 'analytics', label: 'Analytics HUD', icon: BarChart3 },
          { id: 'permissions', label: 'Roles Matrix', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 font-bold border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-250'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Invitations & Users</h2>
            <button 
              onClick={() => {
                setUserForm({ id: null, name: '', email: '', role: 'staff', active: true, planId: '' });
                setShowUserModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <Plus size={14} /> Invite User
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Invite State</th>
                  <th className="py-3 px-4">Active Switch</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-450">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                          : u.role === 'manager'
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        u.googleId ? 'text-green-500' : 'text-amber-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.googleId ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {u.googleId ? 'Registered' : 'Invited'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button 
                        onClick={() => handleToggleUserActive(u)}
                        className={`inline-flex items-center gap-1 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer font-bold ${
                          u.active ? 'text-green-500' : 'text-slate-400'
                        }`}
                      >
                        {u.active ? <UserCheck size={16} /> : <UserX size={16} />}
                        {u.active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditUser(u)}
                          className="p-1 text-slate-400 hover:text-primary cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PLANS TAB --- */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">CRM Subscription Plans</h2>
            <button 
              onClick={() => {
                setPlanForm({ id: null, name: '', description: '', price: 0, billingCycle: 'monthly', features: '', isActive: true, sortOrder: 0 });
                setShowPlanModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <Plus size={14} /> Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div 
                key={p._id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${
                  p.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-red-500/30 border-dashed'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{p.name}</h3>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditPlan(p)} className="text-slate-400 hover:text-primary"><Edit size={14} /></button>
                      <button onClick={() => handleDeletePlan(p._id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">{p.description}</p>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mb-6">
                    ${p.price} <span className="text-xs font-medium text-slate-400">/{p.billingCycle}</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-xs text-slate-650 dark:text-slate-355 font-light">
                    {p.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <Check size={12} className="text-blue-500" /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 text-xs font-bold">
                  <span className="text-slate-400">Sort Index: {p.sortOrder}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    p.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {p.isActive ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBSCRIPTIONS TAB --- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">All Subscriptions Logs</h2>
            <button 
              onClick={() => {
                setSubForm({ id: null, userId: '', planId: '', startDate: '', expiryDate: '', status: 'active', paymentStatus: 'paid' });
                setShowSubModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <Plus size={14} /> Allocate Plan
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Current Plan</th>
                  <th className="py-3 px-4">Billing Dates</th>
                  <th className="py-3 px-4">Plan Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-300">
                {subscriptions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-55/20">
                    <td className="py-3.5 px-4">
                      {s.userId ? (
                        <>
                          <div className="font-bold text-slate-900 dark:text-white">{s.userId.name}</div>
                          <div className="text-[10px] text-slate-450">{s.userId.email}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Deleted User</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.planId ? (
                        <>
                          <div className="font-bold text-slate-900 dark:text-white">{s.planId.name}</div>
                          <div className="text-[10px] text-slate-450">${s.planId.price} / {s.planId.billingCycle}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Custom Plan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-light text-[10px] leading-relaxed">
                      <div><b>Start:</b> {new Date(s.startDate).toLocaleDateString()}</div>
                      <div><b>Expiry:</b> {new Date(s.expiryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        s.status === 'active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : s.status === 'expired'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold">{s.paymentStatus}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditSub(s)} className="p-1 text-slate-400 hover:text-primary"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteSub(s._id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- WEBSITE CONTENT CMS TAB --- */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Landing Page CMS Control</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Branding details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Branding Options</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Site Name</label>
                <input 
                  type="text"
                  value={cmsBranding.siteName}
                  onChange={(e) => setCmsBranding({ ...cmsBranding, siteName: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Logo Path / URL</label>
                <input 
                  type="text"
                  value={cmsBranding.logoUrl}
                  onChange={(e) => setCmsBranding({ ...cmsBranding, logoUrl: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <button 
                onClick={() => handleUpdateCMS('branding', cmsBranding)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 py-1.5 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save Branding Settings
              </button>
            </div>

            {/* Contact details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Footer Contact Coordinates</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <input 
                  type="text"
                  value={cmsContact.email}
                  onChange={(e) => setCmsContact({ ...cmsContact, email: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Phone Line</label>
                <input 
                  type="text"
                  value={cmsContact.phone}
                  onChange={(e) => setCmsContact({ ...cmsContact, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Office Address</label>
                <input 
                  type="text"
                  value={cmsContact.address}
                  onChange={(e) => setCmsContact({ ...cmsContact, address: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <button 
                onClick={() => handleUpdateCMS('contact', cmsContact)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 py-1.5 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save Contact Details
              </button>
            </div>

            {/* Hero details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Hero Header Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Hero Headline</label>
                  <input 
                    type="text"
                    value={cmsHero.headline}
                    onChange={(e) => setCmsHero({ ...cmsHero, headline: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Hero Screenshot Image Path</label>
                  <input 
                    type="text"
                    value={cmsHero.overviewImage}
                    onChange={(e) => setCmsHero({ ...cmsHero, overviewImage: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Hero Subtitle</label>
                  <textarea 
                    rows="3"
                    value={cmsHero.subheadline}
                    onChange={(e) => setCmsHero({ ...cmsHero, subheadline: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">CTA Action Button Text</label>
                  <input 
                    type="text"
                    value={cmsHero.ctaText}
                    onChange={(e) => setCmsHero({ ...cmsHero, ctaText: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">CTA Secondary Button Text</label>
                  <input 
                    type="text"
                    value={cmsHero.secondaryCtaText}
                    onChange={(e) => setCmsHero({ ...cmsHero, secondaryCtaText: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleUpdateCMS('hero', cmsHero)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 py-1.5 px-4 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save Hero Content Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Business Analytics HUD</h2>
          
          {/* Card Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
                <Users className="text-blue-500" size={16} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-light">Invited team members</p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Subscriptions</span>
                <CreditCard className="text-green-500" size={16} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-light">With current unexpired licenses</p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">MRR (Projected)</span>
                <Coins className="text-yellow-500" size={16} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ${subscriptions
                  .filter(s => s.status === 'active' && s.planId)
                  .reduce((acc, curr) => acc + (curr.planId?.price || 0), 0)
                }
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-light">Monthly Recurring Revenue</p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Plans Available</span>
                <FileText className="text-red-500" size={16} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {plans.filter(p => p.isActive).length}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-light">Enabled pricing tiers</p>
            </div>
          </div>

          {/* Revenue distribution mock breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h3 className="text-sm font-bold mb-4">Subscription Distribution Matrix</h3>
            <div className="space-y-4">
              {plans.map((p) => {
                const count = subscriptions.filter(s => s.status === 'active' && s.planId?._id === p._id).length;
                const pct = users.length > 0 ? (count / users.length) * 100 : 0;
                return (
                  <div key={p._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{p.name} (${p.price}/{p.billingCycle})</span>
                      <span>{count} Subscriptions ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- ROLES & PERMISSIONS TAB --- */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Roles & Permissions reference matrix</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature Module</th>
                  <th className="py-3 px-4 text-red-500">Admin Role</th>
                  <th className="py-3 px-4 text-yellow-500">Manager Role</th>
                  <th className="py-3 px-4 text-blue-500">Staff Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-300">
                {[
                  { name: 'SaaS Plan / CMS Billing Management', admin: 'Full Control', manager: 'Blocked', staff: 'Blocked' },
                  { name: 'User Management & Invitations', admin: 'Full Control', manager: 'Blocked', staff: 'Blocked' },
                  { name: 'Branding Settings Control', admin: 'Full Control', manager: 'Blocked', staff: 'Blocked' },
                  { name: 'Customer Directory Database', admin: 'Full Control', manager: 'Full Control', staff: 'Read & Edit Only' },
                  { name: 'Invoices Billing Creator', admin: 'Full Control', manager: 'Full Control', staff: 'Create & Print Only' },
                  { name: 'Product Inventory SKU Listing', admin: 'Full Control', manager: 'Full Control', staff: 'Read & Edit Only' },
                  { name: 'Expense Overhead Logger', admin: 'Full Control', manager: 'Full Control', staff: 'Log Expenses Only' },
                  { name: 'Reports & Exports compile', admin: 'Full Control', manager: 'Full Control', staff: 'Read-Only' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-55/20">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{row.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-red-500">{row.admin}</td>
                    <td className="py-3.5 px-4 font-semibold text-yellow-500">{row.manager}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-500">{row.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- USER MODAL --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {userForm.id ? 'Modify User Profile' : 'Invite New Team Member'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  placeholder="John Doe" 
                />
              </div>

              {!userForm.id && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Google Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    placeholder="john.doe@company.com" 
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Security Access Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {!userForm.id && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Provision License Plan (Optional)</label>
                  <select
                    value={userForm.planId}
                    onChange={(e) => setUserForm({ ...userForm, planId: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">No Plan (Manually Provision Later)</option>
                    {plans.filter(p => p.isActive).map(p => (
                      <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1.5 leading-normal">
                    * Selecting a plan will automatically build a 14-day subscription period (unless plan is lifetime) starting today.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-bold bg-white dark:bg-slate-950 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-6 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  {userForm.id ? 'Save Configuration' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PLAN MODAL --- */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-855 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {planForm.id ? 'Modify Plan Details' : 'Configure Subscription Tier'}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Plan Name</label>
                <input 
                  type="text" 
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  placeholder="E.g. Starter, Pro, Business" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Short Description</label>
                <input 
                  type="text" 
                  required
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  placeholder="Plan summary context" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Price ($ USD)</label>
                  <input 
                    type="number" 
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">Billing Duration</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Features (Comma separated)</label>
                <textarea 
                  rows="3"
                  required
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                  placeholder="Feature 1, Feature 2, Feature 3"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">Sort Ordering Weight</label>
                  <input 
                    type="number" 
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-xs font-bold text-slate-400 uppercase">Enable Tier</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowPlanModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-bold bg-white dark:bg-slate-950 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-6 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUBSCRIPTION MODAL --- */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-855 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {subForm.id ? 'Modify License Details' : 'Allocate Subscription License'}
              </h3>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Select User</label>
                <select
                  disabled={!!subForm.id}
                  required
                  value={subForm.userId}
                  onChange={(e) => setSubForm({ ...subForm, userId: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">Choose User...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Select Plan</label>
                <select
                  required
                  value={subForm.planId}
                  onChange={(e) => setSubForm({ ...subForm, planId: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">Choose Plan...</option>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (${p.price} / {p.billingCycle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={subForm.startDate}
                    onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={subForm.expiryDate}
                    onChange={(e) => setSubForm({ ...subForm, expiryDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">License status</label>
                  <select
                    value={subForm.status}
                    onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">Payment Details</label>
                  <select
                    value={subForm.paymentStatus}
                    onChange={(e) => setSubForm({ ...subForm, paymentStatus: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="paid">Paid (Fully Cleared)</option>
                    <option value="pending">Pending Settlement</option>
                    <option value="failed">Failed Transaction</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-855 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowSubModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-bold bg-white dark:bg-slate-950 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-6 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Allocate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
