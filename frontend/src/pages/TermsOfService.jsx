import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, CheckSquare, RefreshCw, HelpCircle, FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white font-sans scroll-smooth overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-wider uppercase text-white">
              EZO<span className="text-blue-500">NIX</span>
            </span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-400 mb-2">
              <Scale size={40} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Effective Date: June 23, 2026. Humare CRM portal aur services ko use karne ke basic rules and regulations.
            </p>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <CheckSquare className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Invite-Only Access</h3>
              <p className="text-xs text-slate-400">Log-in system strictly authenticated users ke liye reserved hai jinhe admin manually email invite bhejte hain.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <RefreshCw className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Data Ownership</h3>
              <p className="text-xs text-slate-400">Aapka input data (customers database, stock items list, invoice copies) 100% aapka hi property hai.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <HelpCircle className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Fair Usage Rules</h3>
              <p className="text-xs text-slate-400">Reverse engineering aur system exploit validation bypassing block filters limits apply hoti hain.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="bg-slate-850/50 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-10 backdrop-blur-sm">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">1.</span> Acceptable Use of CRM
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Ezonix CRM systems ko businesses internal workflows aur analytics automate karne ke liye design kiya gaya hai. Isme strict protocols guidelines hain:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Aap security controls jaise rate limits ya default database filters settings ko tamper nahi karenge.</li>
                  <li>System me malicious elements ya unauthorized scripts, queries injection attempts block list trigger karenge.</li>
                  <li>Google Authenticated access login permissions strictly individual emails level par verify honi chahiye.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">2.</span> Account Invites & Roles Access
              </h2>
              <p className="text-slate-350 leading-relaxed">
                System admin permanent user permissions setup handle karte hain. Admin emails access settings `.env` levels par system safeguards dynamically check karte hain. Role-Based Access Control logic (RBAC) details ko modify karna security reasons se restriction algorithms ke scope me locked hai.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">3.</span> Intellectual Property & CRM Handover
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Humare business contract guidelines ke basis par software handover rules specified hain:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>CRM system control user administration setting dynamic configurations setup handovers completion ke baad client property ban jati hai.</li>
                  <li>Original core design interfaces layout framework libraries copyrights indicators protected hain.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">4.</span> Limitations of Liability & Warranty Disclaimers
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Ezonix CRM software client code security upgrades validation run karke deploy kiya gaya hai. Internet protocols exceptions, network errors ya host failure reports key criteria "As-Is" framework limits me handle honge. Dynamic backups aur security safety checks complete safety ensure karte hain par network level issues completely third party servers limits indicators under dynamic setup rehte hain.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">5.</span> Agreement Termination
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Admin keys revoke hone par ya invalid email validations security configuration system updates checks ke response control system auto flags initiate kar sakta hai. System settings access controls dynamic settings changes support manual setups me rehte hain.
              </p>
            </section>

          </div>
        </motion.div>
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Ezonix CRM Panel. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
