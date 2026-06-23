import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
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
              <Shield size={40} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Effective Date: June 23, 2026. We are committed to safeguarding the privacy and security of your business and operational data.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Eye className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">No Data Sharing</h3>
              <p className="text-xs text-slate-400">Your organization's operational database is never sold, traded, or shared with third parties.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Lock className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">End-to-End Encryption</h3>
              <p className="text-xs text-slate-400">All data transfers and invoice document storage protocols are protected using SSL/TLS encryption.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Globe className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">OAuth Secure Access</h3>
              <p className="text-xs text-slate-400">Exclusive integration with Google Account authentication ensures password leak risks are eliminated.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="bg-slate-850/50 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-10 backdrop-blur-sm">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">1.</span> Information Collection
              </h2>
              <div className="text-slate-300 space-y-3 leading-relaxed">
                <p>To deliver a seamless, integrated CRM and ERP experience, Ezonix collects and stores the following types of information:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Account Credentials:</strong> During Google Sign-In verification, we collect your Google email address, display name, and profile image URL for verification and profile display.</li>
                  <li><strong>Operational Records:</strong> Information input by users, including customer profiles, transaction records, inventory quantities, and bill sheets.</li>
                  <li><strong>System Logs:</strong> Internal logging for diagnostic purposes, including application logs, runtime parameters, and security event indicators.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">2.</span> Purpose of Data Processing
              </h2>
              <div className="text-slate-300 space-y-3 leading-relaxed">
                <p>All data collected is processed strictly to maintain CRM core services and execute admin directives:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>To verify user credentials against authorization whitelists compiled by system administrators.</li>
                  <li>To compile database metrics dynamically for dashboard visualization and generate downloadable billing sheets.</li>
                  <li>To enforce security constraints, prevent suspicious activities, and log authentication sessions.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">3.</span> Storage & Infrastructure Security
              </h2>
              <div className="text-slate-300 space-y-3 leading-relaxed">
                <p>Ezonix maintains strict technical safeguards to secure backend storage infrastructures:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>All production database connections (MongoDB) employ authorization controls and connection parameters isolated from development layers.</li>
                  <li>Automatic query sanitizers protect database endpoints from unauthorized access or malicious payloads.</li>
                  <li>Uploaded invoice document attachments are stored securely within dedicated digital repositories (Cloudinary).</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">4.</span> Administrative Rights & Role Integrity
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Platform Administrators hold comprehensive rights over organizational data and account invitations. Access parameters are governed by Role-Based Access Control (RBAC). Modification of core system layers, administrative configurations, and critical files deletion rights are restricted to authorized accounts only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">5.</span> Policy Modifications
              </h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify this Privacy Policy to align with new system enhancements or security configurations. Any updates will be indicated by a revised effective date at the top of this document.
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Contact & Support
              </h2>
              <p className="text-sm text-slate-400">
                For questions regarding data protection, access requests, or policy details, please contact us at: <span className="text-blue-400 font-bold">ezonix3@gmail.com</span>
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

export default PrivacyPolicy;
