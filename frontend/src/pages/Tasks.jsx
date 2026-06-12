import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, AlertCircle, Clock, Trash2, Calendar, Flag, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_TASKS = [
  { id: '1', title: 'File Q2 Taxes for Stark Industries', description: 'Ensure depreciation values are adjusted correctly.', priority: 'high', dueDate: '2026-06-15', completed: false },
  { id: '2', title: 'Reconcile Acme Corp outstanding invoices', description: 'Follow up on the payment pending for invoice #INV-1002.', priority: 'medium', dueDate: '2026-06-18', completed: false },
  { id: '3', title: 'Upload audit documents for Initech', description: 'Upload signed scan documents from Peter Gibbons.', priority: 'low', dueDate: '2026-06-20', completed: true },
  { id: '4', title: 'Review Settings logo alignment', description: 'Double check with client on the custom sidebar color scheme preferences.', priority: 'low', dueDate: '2026-06-14', completed: false }
];

const PRIORITY_COLORS = {
  high: { label: 'High', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
};

const Tasks = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formDueDate, setFormDueDate] = useState('');

  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormDueDate('');
    setIsModalOpen(true);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      dueDate: formDueDate || new Date().toISOString().split('T')[0],
      completed: false
    };

    setTasks([newTask, ...tasks]);
    toast.success('Task created successfully');
    setIsModalOpen(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    toast.success('Task status updated');
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task removed');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'all' || 
                          (filter === 'completed' && t.completed) || 
                          (filter === 'pending' && !t.completed);
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep track of daily audits, client review items, and financial tasks.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-primary-hover focus:outline-none transition-all"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search tasks, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-750 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-750 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid/List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${
                task.completed ? 'opacity-65' : ''
              }`}
            >
              {/* Checkbox and Text */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle size={18} className="dark:text-slate-650" />
                  )}
                </button>
                <div className="space-y-1 min-w-0">
                  <h3 className={`font-bold text-sm text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badges & Date */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                {/* Priority */}
                <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[task.priority].color}`}>
                  {PRIORITY_COLORS[task.priority].label}
                </span>

                {/* Due Date */}
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Calendar size={12} />
                  {task.dueDate}
                </span>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 transition-all focus:outline-none"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40">
            <Clock size={36} className="text-slate-350 dark:text-slate-650 mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">No tasks found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Create tasks to trace your workflow tasks, audits, and deliverables.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Task</h3>
              </div>

              <form onSubmit={handleAddTask} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Audit Q1 Tax Ledger"
                    className="form-input"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide additional details..."
                    rows={3}
                    className="form-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="form-input"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due Date</label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="form-input"
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
                    Create Task
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

export default Tasks;
