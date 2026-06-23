import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Users, 
  CheckSquare, 
  Folder, 
  FileSpreadsheet, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Check, 
  Loader2,
  Lock,
  Package
} from 'lucide-react';
import API, { BACKEND_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Map string names to Lucide Icon components
const iconMap = {
  Flame,
  Users,
  CheckSquare,
  Folder,
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Shield,
  Package
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [cmsContent, setCmsContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Fetch plans and CMS content on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, cmsRes] = await Promise.all([
          API.get('/plans'),
          API.get('/website-content')
        ]);
        setPlans(plansRes.data.data.plans || []);
        setCmsContent(cmsRes.data.data.content || null);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmittingContact(true);
    // Simulate API call
    setTimeout(() => {
      setSubmittingContact(false);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  // Fallback contents if API is loading or empty
  const hero = cmsContent?.hero || {
    headline: 'Automate & Accelerate Your Business Operations',
    subheadline: 'The comprehensive CRM and ERP hub designed for modern enterprises. Track leads, balance accounts, build custom invoices, manage inventory, and generate financial reports in one beautiful dashboard.',
    ctaText: 'Get Started Now',
    ctaLink: '/login',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#features',
    overviewImage: '/crm_dashboard_mockup.png'
  };

  const branding = cmsContent?.branding || {
    siteName: 'Ezonix',
    logoUrl: '/logo.png',
  };

  const featuresList = cmsContent?.features || [
    { title: 'Customer Management', description: 'Maintain complete client profiles, track transaction histories, and consult customer accounts in one workspace.', icon: 'Users' },
    { title: 'Product Management', description: 'Coordinate SKU directories, define custom categories, manage prices, and control real-time stock levels.', icon: 'Package' },
    { title: 'Lead Management', description: 'Capture prospective clients, track interactions, and transition pipelines.', icon: 'Flame' },
    { title: 'Client Directories', description: 'Keep detailed customer dossiers, log payment histories, and consult ledgers.', icon: 'Users' },
    { title: 'Task Trackers', description: 'Schedule actions, establish deadline alarms, and allocate responsibilities.', icon: 'CheckSquare' },
    { title: 'Document Management', description: 'Organize files and attach operational receipt documents directly inside logs.', icon: 'Folder' },
    { title: 'Invoice Billing Creator', description: 'Assemble multi-row item tables, compute taxes, and export PDF sheets.', icon: 'FileSpreadsheet' },
    { title: 'Analytics & Reporting', description: 'Extract instant Excel files summarizing sales, expenditures, and purchases.', icon: 'BarChart3' },
    { title: 'Team Collaboration', description: 'Assign distinct roles (Admin, Manager, Staff) to regulate interface modifications.', icon: 'MessageSquare' }
  ];

  const testimonials = cmsContent?.testimonials || [
    { name: 'Sarah Jenkins', role: 'Operations Director', company: 'Nexus Logistics', quote: 'Ezonix has revolutionized how we track invoices and inventory. The transition from spreadsheets was seamless, and the Excel reporting module saves us hours every week!' },
    { name: 'David Chen', role: 'Founder', company: 'Vertex Digital', quote: 'The invite-only Google authentication is exactly the level of security we wanted. The dashboard gives me a real-time HUD of outstanding invoices and cash flow.' }
  ];

  const contactDetails = cmsContent?.contact || {
    email: 'ezonix3@gmail.com',
    phone: '+1 (555) 019-2834',
    address: '100 Enterprise Parkway, Suite 500, San Francisco, CA 94107'
  };

  const defaultMockPlans = [
    { name: 'Basic', price: 19, billingCycle: 'monthly', description: 'Essential toolset for small businesses starting out.', features: ['Lead Management', 'Customer Directory', 'Sales Invoicing', 'Basic Financial Reports'] },
    { name: 'Pro', price: 49, billingCycle: 'monthly', description: 'Complete operational CRM for growing mid-sized enterprises.', features: ['All Basic features', 'Inventory Management', 'Procurement & Purchase Logs', 'Expense Overhead Tracking'] },
    { name: 'Enterprise', price: 99, billingCycle: 'monthly', description: 'Advanced features and dedicated support for large-scale operations.', features: ['All Pro features', 'Role-Based Access Control', 'Sleek PDF Printing Engine', 'Priority Technical Support'] }
  ];

  const finalPlans = plans.length > 0 ? plans : defaultMockPlans;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white font-sans scroll-smooth overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-contain bg-slate-800 p-1" />
            <span className="text-2xl font-black tracking-wider uppercase text-white">
              EZO<span className="text-blue-500">NIX</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              to={isAuthenticated ? "/app" : "/login"} 
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <Lock size={14} /> {isAuthenticated ? "Go to Dashboard" : "CRM Portal Login"}
            </Link>
          </div>

          {/* Mobile Menu Btn */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 z-40 bg-slate-900 border-b border-slate-800 px-6 py-8 md:hidden flex flex-col gap-6 shadow-2xl"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400">Features</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400">Contact</a>
            <hr className="border-slate-800" />
            <Link 
              to={isAuthenticated ? "/app" : "/login"} 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg"
            >
              <Lock size={14} /> {isAuthenticated ? "Go to Dashboard" : "CRM Portal Login"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 uppercase tracking-widest">
                🚀 Dynamic CRM & ERP Hub
              </span>
              <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
                {hero.headline}
              </h1>
              <p className="text-sm sm:text-xl text-slate-400 leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto font-light">
                {hero.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link 
                  to={isAuthenticated ? "/app" : (hero.ctaLink === '/login' ? '/login' : hero.ctaLink)} 
                  className="w-56 sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-5 sm:py-3.5 sm:px-8 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all"
                >
                  {isAuthenticated ? "Go to CRM Panel" : hero.ctaText} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
                <a 
                  href={hero.secondaryCtaLink} 
                  className="w-56 sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:bg-slate-800 py-2.5 px-5 sm:py-3.5 sm:px-8 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all"
                >
                  {hero.secondaryCtaText}
                </a>
              </div>
            </motion.div>
          </div>

          {/* CRM Screenshots Section / Overview Image */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-slate-950 p-2 sm:p-4 max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              <span className="text-xs text-slate-500 font-mono ml-4">ezonix-app-dashboard.sh</span>
            </div>
            <img 
              src={hero.overviewImage || '/crm_dashboard_mockup.png'} 
              alt="Ezonix Platform Overview" 
              className="w-full h-auto rounded-xl border border-slate-800 object-cover shadow-inner"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 lg:py-32 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Equipped with Complete SaaS CRM Capabilities
            </h2>
            <p className="text-slate-400 font-light text-xs sm:text-sm">
              Ditch outdated systems. Ezonix offers high-fidelity, production-ready features to pilot your company.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {featuresList.map((feat, index) => {
              const IconComp = iconMap[feat.icon] || Shield;
              return (
                <div 
                  key={index}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-6 lg:p-8 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all duration-300"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                    <IconComp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <h3 className="text-xs sm:text-base lg:text-lg font-bold text-white mb-1 sm:mb-3 group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 leading-normal sm:leading-relaxed font-light">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 lg:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Trusted by Leading Business Operations
            </h2>
            <p className="text-slate-400 font-light text-xs sm:text-sm">
              See how modern companies rely on the Ezonix CRM hub to secure transactions and run operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col justify-between shadow-lg"
              >
                <p className="text-xs sm:text-base text-slate-300 leading-relaxed italic mb-4 sm:mb-8 font-light">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-600/25 text-blue-400 flex items-center justify-center font-black text-xs sm:text-sm uppercase shrink-0">
                    {test.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">{test.name}</h4>
                    <p className="text-[9px] sm:text-[11px] text-slate-400 leading-tight">
                      {test.role}, <span className="text-blue-400">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-12 sm:py-20 lg:py-32 bg-slate-950 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto items-stretch">
            {/* Contact Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Get in Touch</h2>
                <p className="text-slate-400 font-light text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
                  Looking to license Ezonix for your business? Send us a message and our support team will follow up within 24 hours.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm font-light">{contactDetails.email}</span>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl">
              {contactSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="h-12 w-12 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center mb-4 border border-green-500/30">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-400 font-light">Thank you for contacting us. We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Jane Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="jane@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message</label>
                    <textarea 
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="How can we help your business?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingContact}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 font-bold text-xs text-white transition-all shadow-md shadow-blue-500/10"
                  >
                    {submittingContact ? <Loader2 size={16} className="animate-spin" /> : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={branding.logoUrl} alt="Logo" className="h-6 w-6 object-contain bg-slate-900" />
            <span className="font-bold tracking-wider text-slate-400">
              EZO<span className="text-blue-500">NIX</span>
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-light">
              &copy; {new Date().getFullYear()} {branding.siteName} CRM Platform. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500 font-light flex items-center justify-center gap-1">
              Designed and developed by
              <a 
                href="https://launchliftx.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors ml-1"
              >
                launchliftx
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
