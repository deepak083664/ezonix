import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Search, Folder, Trash2, Calendar, File, Download, ExternalLink, HardDrive, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_DOCS = [
  { id: '1', name: 'Stark_Industries_Audit_Report.pdf', size: '2.4 MB', type: 'Audit', date: '2026-06-10' },
  { id: '2', name: 'Acme_Contract_Executed_2026.docx', size: '840 KB', type: 'Contract', date: '2026-06-08' },
  { id: '3', name: 'Q1_Tax_Form_1040_Draft.pdf', size: '1.2 MB', type: 'Tax', date: '2026-06-12' },
  { id: '4', name: 'Purchase_Receipt_EZONIX_122.png', size: '420 KB', type: 'Receipt', date: '2026-06-05' }
];

const CATEGORIES = ['All', 'Audit', 'Contract', 'Tax', 'Receipt', 'Other'];

const Documents = () => {
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem('crm_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    localStorage.setItem('crm_documents', JSON.stringify(docs));
  }, [docs]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name);

    if (isImage) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image size cannot exceed 1MB.');
        e.target.value = '';
        return;
      }
    } else if (isPdf) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('PDF size cannot exceed 5MB.');
        e.target.value = '';
        return;
      }
    } else {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB.');
        e.target.value = '';
        return;
      }
    }

    setUploading(true);
    toast.loading('Uploading document...', { id: 'upload_toast' });

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileDataUrl = reader.result;
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(file.size / 1024).toFixed(0)} KB`,
        type: file.name.endsWith('.pdf') ? 'Audit' : file.name.endsWith('.docx') ? 'Contract' : 'Other',
        date: new Date().toISOString().split('T')[0],
        url: fileDataUrl
      };
      setDocs([newDoc, ...docs]);
      setUploading(false);
      toast.success('Document uploaded successfully!', { id: 'upload_toast' });
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error('Failed to read file contents', { id: 'upload_toast' });
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocs(docs.filter(d => d.id !== id));
      toast.success('Document deleted');
    }
  };

  const getDocUrl = (doc) => {
    if (doc.url) return doc.url;
    
    // Fallback/Generate dummy file for mock documents
    let content = '';
    let mimeType = 'text/plain';
    
    if (doc.name.endsWith('.pdf')) {
      content = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>endobj\n4 0 obj<</Length 56>>stream\nBT\n/F1 12 Tf\n50 700 Td\n(Mock Document: ${doc.name}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000250 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n356\n%%EOF`;
      mimeType = 'application/pdf';
    } else if (doc.name.endsWith('.docx')) {
      content = `Mock Microsoft Word Document Content for: ${doc.name}`;
      mimeType = 'text/plain';
    } else if (doc.name.endsWith('.png') || doc.name.endsWith('.jpg')) {
      content = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      return content;
    } else {
      content = `Mock content for document: ${doc.name}`;
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    return URL.createObjectURL(blob);
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.name}...`);
    const url = getDocUrl(doc);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderPreviewContent = (doc) => {
    const isImage = doc.name.match(/\.(png|jpe?g|gif|webp)$/i);
    const isPdf = doc.name.endsWith('.pdf');
    const url = getDocUrl(doc);

    if (isImage) {
      return (
        <img src={url} alt={doc.name} className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800" />
      );
    } else if (isPdf) {
      return (
        <iframe src={url} title={doc.name} className="w-full h-[60vh] rounded-xl border-0 bg-white" />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <FileText size={64} className="text-slate-350 dark:text-slate-700 mb-4 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-1">
            Preview Not Supported
          </h4>
          <p className="text-xs text-slate-400 mb-4 max-w-xs">
            We don't support previewing {doc.name.split('.').pop().toUpperCase()} files in the browser yet. Please download the file to view its contents.
          </p>
          <button
            onClick={() => handleDownload(doc)}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Download File
          </button>
        </div>
      );
    }
  };

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Document Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Securely store audits, balance sheets, client contracts, and vendor receipts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-455">
          <HardDrive size={16} className="text-slate-400" />
          <span>Storage: {(docs.length * 1.2).toFixed(1)} MB / 500 MB</span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-white dark:bg-slate-900/60 hover:border-primary transition-all text-center">
        <input
          type="file"
          id="doc-upload"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <UploadCloud size={40} className="text-slate-400 dark:text-slate-650 animate-pulse-subtle" />
          <p className="font-bold text-sm text-slate-850 dark:text-slate-200">
            {uploading ? 'Processing file...' : 'Drag & drop file or click to choose'}
          </p>
          <p className="text-xs text-slate-400">PDF/DOCX/XLSX (Max 5MB), Images (Max 1MB)</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredDocs.map((doc) => (
            <motion.div
              layout
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md text-left flex flex-col justify-between"
            >
              <div>
                {/* Header Icon & Type */}
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/45 p-2 text-primary">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/80">
                    {doc.type}
                  </span>
                </div>

                {/* Name */}
                <h3 onClick={() => setPreviewDoc(doc)} className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-primary transition-colors cursor-pointer" title={doc.name}>
                  {doc.name}
                </h3>
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-slate-500 dark:text-slate-350">{doc.size}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {doc.date}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="Preview File"
                    className="p-1.5 rounded-lg border border-slate-250 text-slate-400 hover:text-primary hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    title="Download File"
                    className="p-1.5 rounded-lg border border-slate-250 text-slate-400 hover:text-primary hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 transition-colors"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    title="Delete File"
                    className="p-1.5 rounded-lg border border-slate-250 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredDocs.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40">
            <Folder size={40} className="text-slate-300 dark:text-slate-650 mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Vault is empty</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Upload important client records, tax calculations, or purchase receipts to start cataloging files.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-md">
                    {previewDoc.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Size: {previewDoc.size} | Date: {previewDoc.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Close Preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center">
                {renderPreviewContent(previewDoc)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
