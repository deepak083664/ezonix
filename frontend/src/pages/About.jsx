import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Users, Target, Heart, Shield, Award } from 'lucide-react';

const About = () => {
  // Ensure the page scrolls to the top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-400 mb-2">
              <Building2 size={40} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              About Ezonix
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Empowering modern enterprises with clean, unified, and secure business management tools.
            </p>
          </div>

          {/* Core Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-855 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Target className="text-blue-500" size={24} />
              <h3 className="font-bold text-white text-lg">Our Mission</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                To streamline daily business operations by unifying invoices, leads, inventory, and analytics in a single hub.
              </p>
            </div>
            <div className="bg-slate-855 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Shield className="text-blue-500" size={24} />
              <h3 className="font-bold text-white text-lg">Security First</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                To protect proprietary transaction data utilizing high-grade Google Authentication and dynamic validation protocols.
              </p>
            </div>
            <div className="bg-slate-855 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Heart className="text-blue-500" size={24} />
              <h3 className="font-bold text-white text-lg">Zero Friction</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Designed to operate directly on client systems with complete ownership and without recurring subscription models.
              </p>
            </div>
          </div>

          {/* Company Context & Details */}
          <div className="bg-slate-850/50 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-10 backdrop-blur-sm">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500"><Users size={20} /></span> Who We Are
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Ezonix CRM is a bespoke enterprise resource planning (ERP) and client relationship management (CRM) platform designed specifically to meet the operational demands of growing businesses. We eliminate the administrative overhead of juggling disjointed spreadsheets, receipt attachments, customer accounts, and tax billing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500"><Award size={20} /></span> Product Philosophy
              </h2>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  We believe that business management tools should be beautiful, fast, and entirely under the user's control:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Complete Ownership:</strong> Once configured, the platform environment belongs completely to the business administrator.</li>
                  <li><strong>No Hidden Costs:</strong> No monthly usage limits, subscription billing packages, or arbitrary user caps.</li>
                  <li><strong>Enterprise Grade Security:</strong> Protected against basic injection attacks, token spoofing, and dev-bypass security flaws.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-805">
              <h2 className="text-lg font-bold text-white">Need Support?</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                For deployment support, customization inquiries, or administrative assistance, please contact us directly at <span className="text-blue-400">ezonix3@gmail.com</span>
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

export default About;
