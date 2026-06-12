const Plan = require('../models/Plan');
const WebsiteContent = require('../models/WebsiteContent');

const seedPlans = async () => {
  const count = await Plan.countDocuments();
  if (count > 0) return;

  const defaultPlans = [
    {
      name: 'Basic',
      description: 'Essential toolset for small businesses starting out.',
      price: 19,
      billingCycle: 'monthly',
      features: ['Lead Management', 'Customer Directory', 'Sales Invoicing', 'Basic Financial Reports'],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Pro',
      description: 'Complete operational CRM for growing mid-sized enterprises.',
      price: 49,
      billingCycle: 'monthly',
      features: ['All Basic features', 'Inventory Management', 'Procurement & Purchase Logs', 'Expense Overhead Tracking', 'Structured Excel Reports', 'Local Storage Fallbacks'],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Enterprise',
      description: 'Advanced features and dedicated support for large-scale operations.',
      price: 99,
      billingCycle: 'monthly',
      features: ['All Pro features', 'Role-Based Access Control', 'Sleek PDF Printing Engine', 'Priority Technical Support', 'Dynamic Branding Configs', 'Unlimited Team Collaboration'],
      isActive: true,
      sortOrder: 3,
    },
  ];

  await Plan.create(defaultPlans);
  console.log('🌱 Default subscription plans seeded successfully.');
};

const seedWebsiteContent = async () => {
  const defaultContent = [
    {
      key: 'branding',
      value: {
        siteName: 'Ezonix',
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.png',
      },
    },
    {
      key: 'hero',
      value: {
        headline: 'Automate & Accelerate Your Business Operations',
        subheadline: 'The comprehensive CRM and ERP hub designed for modern enterprises. Track leads, balance accounts, build custom invoices, manage inventory, and generate financial reports in one beautiful dashboard.',
        ctaText: 'Get Started Now',
        ctaLink: '/login',
        secondaryCtaText: 'View Pricing',
        secondaryCtaLink: '#pricing',
        overviewImage: '/crm_dashboard_mockup.png',
      },
    },
    {
      key: 'features',
      value: [
        {
          title: 'Customer Management',
          description: 'Maintain complete client profiles, track transaction histories, and consult customer accounts in one workspace.',
          icon: 'Users',
        },
        {
          title: 'Product Management',
          description: 'Coordinate SKU directories, define custom categories, manage prices, and control real-time stock levels.',
          icon: 'Package',
        },
        {
          title: 'Lead Management',
          description: 'Capture prospective clients, track interactions, and transition pipelines seamlessly to boost sales ratios.',
          icon: 'Flame',
        },
        {
          title: 'Client Directories',
          description: 'Keep detailed customer dossiers, log individual payment histories, and consult immediate balance ledgers.',
          icon: 'Users',
        },
        {
          title: 'Task Trackers',
          description: 'Schedule actions, establish deadline alarms, allocate responsibilities to team members, and stay aligned.',
          icon: 'CheckSquare',
        },
        {
          title: 'Document Management',
          description: 'Organize files, aggregate digital business sheets, and attach operational receipt documents directly inside logs.',
          icon: 'Folder',
        },
        {
          title: 'Invoice Billing Creator',
          description: 'Assemble multi-row item tables, compute automatic tax values, decrease inventory levels, and export PDF sheets.',
          icon: 'FileSpreadsheet',
        },
        {
          title: 'Analytics & Reporting',
          description: 'Extract instant Excel files summarizing sales, expenditures, purchases, and compile monthly balance statements.',
          icon: 'BarChart3',
        },
        {
          title: 'Team Collaboration',
          description: 'Assign distinct roles (Admin, Manager, Staff) to regulate interface modifications and restrict settings access.',
          icon: 'MessageSquare',
        },
      ],
    },
    {
      key: 'testimonials',
      value: [
        {
          name: 'Sarah Jenkins',
          role: 'Operations Director',
          company: 'Nexus Logistics',
          quote: 'Ezonix has revolutionized how we track invoices and inventory. The transition from spreadsheets was seamless, and the Excel reporting module saves us hours every single week!',
          avatar: '',
        },
        {
          name: 'David Chen',
          role: 'Founder',
          company: 'Vertex Digital',
          quote: 'The invite-only Google authentication is exactly the level of security we wanted. The dashboard gives me a real-time HUD of outstanding invoices and cash flow.',
          avatar: '',
        },
      ],
    },
    {
      key: 'faq',
      value: [
        {
          question: 'How do I invite team members to Ezonix?',
          answer: 'As an administrator, you can navigate to the SaaS Admin Console, go to the Users tab, and enter the email address and assign a role (Admin, Manager, Staff). Once added, they can securely log in using their Google account.',
        },
        {
          question: 'What happens when a subscription expires?',
          answer: 'When a subscription passes its expiry date or status is changed to expired/cancelled, non-admin users will see an access blocked screen. Admin users will retain access to renew subscriptions.',
        },
        {
          question: 'Does Ezonix support local file storage?',
          answer: 'Yes! While Cloudinary integration is supported for production cloud storage, Ezonix automatically falls back to secure local storage under the public/uploads directory if cloud keys are not configured.',
        },
      ],
    },
    {
      key: 'contact',
      value: {
        email: 'ezonix3@gmail.com',
        phone: '+1 (555) 019-2834',
        address: '100 Enterprise Parkway, Suite 500, San Francisco, CA 94107',
      },
    },
  ];

  for (const item of defaultContent) {
    await WebsiteContent.findOneAndUpdate(
      { key: item.key },
      { value: item.value },
      { upsert: true, new: true }
    );
  }
  console.log('🌱 Default landing page CMS blocks seeded and synced successfully.');
};

const runSeeder = async () => {
  try {
    await seedPlans();
    await seedWebsiteContent();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = runSeeder;
