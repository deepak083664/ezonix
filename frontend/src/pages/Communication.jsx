import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Video, Search, MessageSquare, ShieldAlert, CheckCheck, RefreshCw, SendHorizontal, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_THREADS = [
  {
    id: '1',
    name: 'Pepper Potts (Stark Industries)',
    subject: 'Q1 Audit Reconciliation Ledger',
    avatar: 'PP',
    status: 'online',
    messages: [
      { id: 'm1', sender: 'client', text: 'Hello, did you review the depreciation balance sheet I sent last Tuesday?', time: '09:30 AM' },
      { id: 'm2', sender: 'agent', text: 'Hi Pepper! Yes, I analyzed the details. We need to reconcile some asset valuations. I will draft the tax adjustment forms today.', time: '10:02 AM' },
      { id: 'm3', sender: 'client', text: 'Excellent, keep me updated on the final audit report calculations. Thanks!', time: '10:15 AM' }
    ]
  },
  {
    id: '2',
    name: 'Bruce Wayne (Wayne Enterprises)',
    subject: 'Tax Compliance Assessment',
    avatar: 'BW',
    status: 'offline',
    messages: [
      { id: 'm4', sender: 'client', text: 'We require a summary of all tax filings completed for our subsidiaries in Asia.', time: 'Yesterday' },
      { id: 'm5', sender: 'agent', text: 'Understood Bruce. Generating reports. I will upload them directly to the Document Vault in a few minutes.', time: 'Yesterday' }
    ]
  },
  {
    id: '3',
    name: 'John Doe (Acme Corp)',
    subject: 'Invoice Settlement Reconcile',
    avatar: 'JD',
    status: 'online',
    messages: [
      { id: 'm6', sender: 'client', text: 'Hey, has the payment for invoice #INV-1002 cleared yet?', time: '2 days ago' },
      { id: 'm7', sender: 'agent', text: 'Hello John, yes, we verified the transfer. Your payment is reflected in the CRM panel.', time: '2 days ago' }
    ]
  }
];

const AUTO_REPLIES = [
  "Thank you for the update! I will review this immediately.",
  "Understood. Let's arrange a short call to discuss details tomorrow.",
  "Perfect. Please upload the receipt or PDF to the Documents tab.",
  "Great work! Let me know if you need anything else from our side.",
  "Acknowledged. I will forward this summary details to our lead CA."
];

const Communication = () => {
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem('crm_communications');
    return saved ? JSON.parse(saved) : INITIAL_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState('1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('crm_communications', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    // Scroll to bottom when thread updates
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, threads]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'agent',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setInputText('');

    // Trigger auto reply simulation
    setTimeout(() => {
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'client',
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setThreads(currentThreads => currentThreads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, replyMessage]
          };
        }
        return t;
      }));
      toast('New message received from client', { icon: '💬' });
    }, 1500);
  };

  const filteredThreads = threads.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex h-[620px]">
      
      {/* Thread list - Left sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/40">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search chat or threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-9 text-xs text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredThreads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full p-4 flex gap-3 text-left transition-colors items-start ${
                  activeThreadId === thread.id 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-primary' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-primary flex items-center justify-center font-bold text-xs">
                    {thread.avatar}
                  </div>
                  {thread.status === 'online' && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-250 truncate">{thread.name}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{lastMsg?.time || ''}</span>
                  </div>
                  <h5 className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{thread.subject}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {lastMsg ? lastMsg.text : 'No conversations.'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active chat screen - Right panel */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 text-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-950/25">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-primary flex items-center justify-center font-bold text-xs">
              {activeThread.avatar}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{activeThread.name}</h3>
              <p className="text-[11px] text-slate-400 font-semibold truncate max-w-sm sm:max-w-md">{activeThread.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Phone size={15} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Video size={15} />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
          {activeThread.messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-xs border ${
                    isAgent
                      ? 'bg-primary border-primary text-white rounded-tr-none'
                      : 'bg-white border-slate-200 dark:border-slate-800 text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className={`mt-1 flex items-center gap-1 justify-end text-[9px] ${isAgent ? 'text-blue-100' : 'text-slate-400'}`}>
                    <span>{msg.time}</span>
                    {isAgent && <CheckCheck size={11} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Panel */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeThread.name.split(' ')[0]}...`}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 focus:outline-none"
          >
            <span>Send</span>
            <SendHorizontal size={12} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Communication;
