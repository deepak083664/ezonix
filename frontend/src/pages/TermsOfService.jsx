import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, CheckSquare, RefreshCw, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
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
              Effective Date: June 23, 2026. Please review the rules, terms, and guidelines governing the use of Ezonix CRM services.
            </p>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <CheckSquare className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Invite-Only Policy</h3>
              <p className="text-xs text-slate-400">Access to the application is restricted exclusively to whitelisted email accounts invited by the Administrator.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <RefreshCw className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Data Ownership</h3>
              <p className="text-xs text-slate-400">All customer logs, transaction dossiers, inventory configurations, and documents remain 100% user property.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <HelpCircle className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Acceptable Use</h3>
              <p className="text-xs text-slate-400">Strict boundaries govern queries, API calls, and authentication requests to maintain system performance.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="bg-slate-850/50 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-10 backdrop-blur-sm">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">1.</span> User Account Integrity & Security
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Ezonix CRM operates as an invite-only platform. Users are bound by the following protocols:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Users must authenticate solely using active, verified Google Accounts.</li>
                  <li>Circumventing validation scripts, exploiting developmental features, or bypassing role restriction logic is strictly prohibited.</li>
                  <li>Administrators hold ultimate responsibility for reviewing and auditing user accounts under their whitelist directory.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">2.</span> Prohibited Activities
              </h2>
              <p className="text-slate-350 leading-relaxed">
                You agree not to engage in any activity that interferes with or disrupts Ezonix services. This includes transmitting malware, executing structured injection payloads against database endpoints, bypassing rate-limiting middleware, or attempting brute-force attacks on whitelisted sessions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">3.</span> Intellectual Property & Software Handover
              </h2>
              <div className="text-slate-355 space-y-3 leading-relaxed">
                <p>Upon formal software handover and configuration deployment, ownership parameters are set as follows:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>The local database instances, environment files, and operational files belong exclusively to the client enterprise.</li>
                  <li>Original core design patterns, structural framework libraries, and source code frameworks remain copyrighted property.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">4.</span> Disclaimer of Warranties & Liability limits
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Ezonix is provided on an "as-is" and "as-available" basis. While we execute robust security audits, compile dependency lists, and maintain server middleware, we do not warrant that the application will run entirely uninterrupted or be free from third-party networking issues. The platform owner is advised to schedule regular offline report database backups.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">5.</span> Account Revocation & Service Termination
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Platform Administrators reserve the right to deactivate or terminate any user profile or whitelisted email address at their sole discretion if operational guidelines are violated.
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
