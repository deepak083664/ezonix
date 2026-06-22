import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronRight, User, Phone, Mail, DollarSign, Edit, Trash2, Calendar, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';

const PIPELINES = [
  { id: 'new', name: 'New Leads', color: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'contacted', name: 'Contacted', color: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'proposal', name: 'Proposal Sent', color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'won', name: 'Won', color: 'border-t-emerald-500 bg-emerald-500/5' }
];

const INITIAL_LEADS = [
  { id: '1', name: 'Acme Corp', contact: 'John Doe', email: 'john@acme.com', phone: '555-0192', value: 15000, stage: 'new', notes: 'Interested in ERP integration services.' },
  { id: '2', name: 'Wayne Enterprises', contact: 'Bruce Wayne', email: 'bruce@wayne.co', phone: '555-0144', value: 45000, stage: 'contacted', notes: 'Requested custom accounting dashboard specs.' },
  { id: '3', name: 'Stark Industries', contact: 'Pepper Potts', email: 'pepper@stark.com', phone: '555-0188', value: 30000, stage: 'proposal', notes: 'Proposal for audit reconciliation software sent.' },
  { id: '4', name: 'Initech Inc', contact: 'Peter Gibbons', email: 'peter@initech.com', phone: '555-0112', value: 8000, stage: 'won', notes: 'Signed contract for tax compliance updates.' }
];

const Leads = () => {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formStage, setFormStage] = useState('new');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormName('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormValue('');
    setFormStage('new');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setFormName(lead.name);
    setFormContact(lead.contact);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormValue(lead.value);
    setFormStage(lead.stage);
    setFormNotes(lead.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter(l => l.id !== id));
      toast.success('Lead deleted successfully');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Company/Lead name is required');
      return;
    }

    if (editingLead) {
      // Edit
      setLeads(leads.map(l => l.id === editingLead.id ? {
        ...l,
        name: formName,
        contact: formContact,
        email: formEmail,
        phone: formPhone,
        value: Number(formValue) || 0,
        stage: formStage,
        notes: formNotes
      } : l));
      toast.success('Lead updated successfully');
    } else {
      // Add
      const newLead = {
        id: Date.now().toString(),
        name: formName,
        contact: formContact,
        email: formEmail,
        phone: formPhone,
        value: Number(formValue) || 0,
        stage: formStage,
        notes: formNotes
      };
      setLeads([...leads, newLead]);
      toast.success('Lead added successfully');
    }
    setIsModalOpen(false);
  };

  const updateStage = (leadId, newStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    toast.success(`Pipeline stage updated`);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.contact.toLowerCase().includes(search.toLowerCase()) ||
    (lead.notes && lead.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leads Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Qualify opportunities, trace pipelines, and estimate potential deal revenues.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-primary-hover focus:outline-none transition-all"
        >
          <Plus size={16} /> Add Opportunity
        </button>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search leads, contacts, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Total Value: <span className="font-bold text-slate-900 dark:text-white">₹{filteredLeads.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PIPELINES.map((col) => {
          const colLeads = filteredLeads.filter(l => l.stage === col.id);
          const colValue = colLeads.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 border-t-4 ${col.color} transition-all min-h-[500px]`}
            >
              {/* Pipeline Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-150 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{col.name}</h3>
                  <span className="text-xs text-slate-400 font-semibold">{colLeads.length} lead{colLeads.length !== 1 ? 's' : ''}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-355">
                  ₹{colValue.toLocaleString()}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                <AnimatePresence mode="popLayout">
                  {colLeads.map((lead) => (
                    <motion.div
                      layout
                      key={lead.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      className="group relative rounded-xl border border-slate-200/70 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {lead.name}
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/35"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/35"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          <span>{lead.contact}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="mt-3 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg line-clamp-2 italic">
                          "{lead.notes}"
                        </p>
                      )}

                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{lead.value.toLocaleString()}
                        </span>
                        
                        {/* Quick stage mover */}
                        <div className="flex gap-1">
                          {PIPELINES.map((p) => p.id !== lead.stage && (
                            <button
                              key={p.id}
                              onClick={() => updateStage(lead.id, p.id)}
                              title={`Move to ${p.name}`}
                              className="text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary dark:hover:text-primary dark:hover:border-primary transition-all uppercase font-mono"
                            >
                              {p.id[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colLeads.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-450 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No leads here.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingLead ? 'Edit Opportunity' : 'New Lead Opportunity'}
                </h3>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company / Lead Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contact Person</label>
                    <input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="John Doe"
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Value (₹)</label>
                    <input
                      type="number"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="10000"
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="555-0100"
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pipeline Stage</label>
                    <select
                      value={formStage}
                      onChange={(e) => setFormStage(e.target.value)}
                      className="form-input"
                    >
                      {PIPELINES.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Notes / Details</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Notes about the lead requirements, timeline..."
                      rows={3}
                      className="form-input resize-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-6 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-950"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover shadow-md shadow-blue-500/20 transition-all"
                  >
                    Save Opportunity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leads;
