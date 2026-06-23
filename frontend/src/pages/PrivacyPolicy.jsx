import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, FileText, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
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
              Effective Date: June 23, 2026. Hum aapke data ki safety aur privacy ko bohot serious lete hain.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Eye className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Zero Third Party Sale</h3>
              <p className="text-xs text-slate-400">Aapka business data kisi bhi teesre bande ko sale ya share nahi kiya jata.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Lock className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Encrypted Data</h3>
              <p className="text-xs text-slate-400">Pure database logs aur document transfers SSL/TLS encryption se protected hain.</p>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <Globe className="text-blue-500" size={24} />
              <h3 className="font-bold text-white">Google OAuth Guard</h3>
              <p className="text-xs text-slate-400">Direct Google Login authorization se secured password hacking risk is zero.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="bg-slate-850/50 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-10 backdrop-blur-sm">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">1.</span> Information We Collect
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Ezonix CRM ko smooth chalane ke liye hum ye specifications collect aur save karte hain:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Account Info:</strong> Google Sign-In verification ke time aapka Gmail address, display name aur profile image save hoti hai.</li>
                  <li><strong>Business Data:</strong> Jo customers data, products details, stocks quantity, transactions, reports, invoices aur files aap site par store karte hain.</li>
                  <li><strong>Usage Logs:</strong> System metrics jaise dynamic bypass access logs, audit checks aur backend authentication sessions key storage.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">2.</span> How We Use Your Data
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Aapka data strictly system validation ke liye use hota hai:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Aapke login settings verify karne ke liye taaki sirf white-listed Gmail accounts hi invite ho sakein.</li>
                  <li>Invoices automatically PDF formats me generate karne ke liye aur sales sheets compile karne ke liye.</li>
                  <li>Business performance dashboards dynamically show karne ke liye (such as active leads counts, balance charts).</li>
                  <li>Brute force aur suspicious attempts ko request control algorithms se protect karne ke liye.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">3.</span> Storage & Data Security
              </h2>
              <div className="text-slate-350 space-y-3 leading-relaxed">
                <p>Aapka database cloud storage systems (MongoDB) me securely encrypted storage engine par deployment settings ke sath store hota hai:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Security validation protocols hardcoded dev backdoors ko production builds se restrict karte hain.</li>
                  <li>Database checks automatic query sanitation processes utilize karte hain prevent MongoDB injection vulnerability logs.</li>
                  <li>Aapke bills attachments dynamically secure cloud repository (Cloudinary) me upload hote hain.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">4.</span> Your Rights & Access Controls
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Platform Admin ke pass supreme ownership data permissions settings control hoti hain. Admin kisi bhi user ke profile invite settings delete ya change kar sakte hain. Staff members files upload track kar sakte hain par core data delete check rights are locked for extreme data protection rules.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-500">5.</span> Policy Modifications
              </h2>
              <p className="text-slate-350 leading-relaxed">
                Kuch updates hone par policy modify ki ja sakti hai, jiski safety details aur date indicators header page information bar par reflect honge.
              </p>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-800">
              <h2 className="text-lg font-bold text-white">Contact & Support</h2>
              <p className="text-sm text-slate-400">
                Data privacy ke regarding kisi query ke liye support email par check karein: <span className="text-blue-400">ezonix3@gmail.com</span>
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
