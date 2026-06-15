import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Users, Package, FileSpreadsheet, CreditCard, BarChart3, Settings, HelpCircle, FileText, ShoppingBag, Receipt, Coins, Flame, CheckSquare, Folder, MessageSquare } from 'lucide-react';
import API from '../services/api';

const QUICK_LINKS = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard, category: 'Navigation' },
  { name: 'Customers', path: '/app/customers', icon: Users, category: 'Records' },
  { name: 'Products', path: '/app/products', icon: Package, category: 'Records' },
  { name: 'Invoices', path: '/app/invoices', icon: FileSpreadsheet, category: 'Finance' },
  { name: 'Payments', path: '/app/payments', icon: CreditCard, category: 'Finance' },
  { name: 'Leads', path: '/app/leads', icon: Flame, category: 'Sales' },
  { name: 'Tasks', path: '/app/tasks', icon: CheckSquare, category: 'Operations' },
  { name: 'Documents', path: '/app/documents', icon: Folder, category: 'Operations' },
  { name: 'Reports', path: '/app/reports', icon: BarChart3, category: 'Finance' },
  { name: 'Settings', path: '/app/settings', icon: Settings, category: 'System' },
];

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Toggle open/close with Ctrl+K or custom event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    const handleCustomEvent = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-command-palette', handleCustomEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleCustomEvent);
    };
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSelectedIndex(0);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/reports/search?query=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch (err) {
        console.error('Command Palette Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle navigating or executing selection
  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.type === 'customer') {
      navigate(`/app/customers?search=${encodeURIComponent(item.keyword)}`);
    } else if (item.type === 'product') {
      navigate(`/app/products?search=${encodeURIComponent(item.keyword)}`);
    } else if (item.type === 'invoice') {
      navigate(`/app/invoices?search=${encodeURIComponent(item.keyword)}`);
    }
  };

  // Compile list of navigable items based on search/state
  const getFlattenedItems = () => {
    if (!query) {
      return QUICK_LINKS;
    }

    const list = [];
    if (results) {
      results.customers?.forEach((c) => {
        list.push({ id: `cust-${c._id}`, name: c.name, description: `Customer • ${c.phone}`, type: 'customer', keyword: c.name, icon: Users });
      });
      results.products?.forEach((p) => {
        list.push({ id: `prod-${p._id}`, name: p.name, description: `Product SKU: ${p.sku}`, type: 'product', keyword: p.sku, icon: Package });
      });
      results.invoices?.forEach((inv) => {
        list.push({ id: `inv-${inv._id}`, name: `Invoice ${inv.invoiceNumber}`, description: `Invoice for ${inv.customer?.name || 'N/A'}`, type: 'invoice', keyword: inv.invoiceNumber, icon: FileText });
      });
    }

    // Include matching quick links as well
    const matchingLinks = QUICK_LINKS.filter((link) =>
      link.name.toLowerCase().includes(query.toLowerCase())
    );
    list.push(...matchingLinks);

    return list;
  };

  const items = getFlattenedItems();

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-slate-950/60 backdrop-blur-xs" onKeyDown={handleKeyDown}>
          
          {/* Backdrop click close */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />

          {/* Palette Dialog box */}
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col text-left"
          >
            {/* Search Input bar */}
            <div className="relative flex items-center border-b border-slate-200/80 px-4 py-3.5 dark:border-slate-800">
              <Search className="text-slate-400 shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search record..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="ml-3 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-450 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">ESC</span>
            </div>

            {/* Content List area */}
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && items.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                  Searching records...
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching links or records found.
                </div>
              )}

              {items.map((item, idx) => {
                const Icon = item.icon || HelpCircle;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.id || item.name}
                    onClick={() => handleSelect(item)}
                    className={`w-full rounded-xl px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-500/10 text-primary dark:bg-blue-950/30'
                        : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      {item.description && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</div>
                      )}
                    </div>
                    {item.category && (
                      <span className="text-[9px] font-bold text-slate-400 border border-slate-200/80 px-1.5 py-0.5 rounded dark:border-slate-800 dark:bg-slate-950">
                        {item.category}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer hints */}
            <div className="border-t border-slate-150 px-4 py-2 text-[10px] text-slate-400 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 flex gap-4 font-semibold">
              <span>↑↓ Navigation</span>
              <span>ENTER Execute</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
