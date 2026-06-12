# ApexCRM - Production-Ready Business Management CRM Web Application

ApexCRM is a professional, SaaS-quality Business Management and CRM dashboard web application designed specifically for small and medium enterprises. It replicates the premium, high-fidelity user experiences of tools like Stripe, Linear, and Notion.

---

## Technical Architecture Stack

### Frontend Application
- **React 19 & Vite**: Ultra-fast hot module reloading, modern React features, and code splitting.
- **Tailwind CSS v4**: Advanced theme variable directives for seamless dark mode compatibility.
- **React Router (v6)**: Dynamic declarative routing with protected session middleware layouts.
- **Axios & React Hook Form**: Robust REST requests interceptors and input schema validation controls.
- **Recharts & Framer Motion**: Stunning, premium financial charts and smooth modal/drawer animation streams.
- **React Hot Toast**: Beautiful micro-notifications for user action feedback.

### Backend API Service
- **Node.js & Express.js**: Asynchronous API endpoints designed in a clean MVC (Model-View-Controller) architecture.
- **MongoDB Atlas & Mongoose**: Fully structured schemas with object reference validations.
- **JWT Session Security**: Secure access tokens and validation middleware checks.
- **Cloudinary Integration**: Cloud-based product image and settings logo uploads.
- **Local Fallback Storage**: Automatically falls back to local disk storage (`public/uploads`) if Cloudinary credentials are not configured, ensuring flawless local execution.
- **Export Engines**:
  - **Sleek PDF Invoices**: Programmatically generated print layouts utilizing `pdfkit`.
  - **Structured Excel Reports**: Comprehensive date-range data tables compiled using `exceljs`.

---

## Core Enterprise Modules

1. **Authentication Gateway**: Email/Password registrations, secure login panels, JWT validation checks, mock forgot/reset pipelines for quick testing, and Google OAuth 2.0 Web Client authentication.
2. **Dashboard HUD**: Total Sales/Purchases/Expenses/Outstanding stats, monthly growth AreaCharts, recent invoices timeline, recent customers, and immediate low-stock alert warnings.
3. **Customer Database**: CRUD directories, search parameters, and a chronological general ledger statement showing cumulative balance values.
4. **Product Inventory**: SKU identifiers, category folders, prices, quantities, and low stock thresholds.
5. **Invoice Billing Creator**: Real-time invoice serial generation, multi-row line additions, item taxes, item discounts, automated inventory stock reductions, instant printing, and downloadable PDF streams.
6. **Procurement Purchases Log**: Supply intake tracking to replenish item quantities.
7. **Expense Overhead Tracker**: Operational cash logs (Rent, Salary, Internet, Marketing, Other) with document receipt uploads.
8. **Payment Reconciliations**: Record receipts against pending invoices with partial payment support.
9. **Reports Export**: Sales, purchases, and expenses reports filtered by date ranges, compiled with summaries, and downloadable as formatted Excel sheets.
10. **Branding Settings**: Dynamic business profiles, billing addresses, GST settings, and invoice prefix configurations.

---

## Security Protocols Engaged

- **Helmet**: Secures Express apps by setting various HTTP response headers.
- **CORS Policies**: Explicitly restricts request origins.
- **Express Rate Limit**: Prevents automated brute-force attacks.
- **Mongo Sanitize**: Sanitizes user-supplied data to prevent MongoDB Operator Injection.
- **Role-Based Access Control**: Restricts settings modifications and reports compiles to `admin` accounts.

---

## Direct Start Instructions

### Prerequisites
- Node.js installed locally.
- MongoDB service running locally (for default `.env` fallback) or MongoDB Atlas connection string.

### Backend Setup
1. Navigate into directory:
   ```bash
   cd backend
   ```
2. Configure `.env` file (copied from `.env.example`).
3. Start local development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate into directory:
   ```bash
   cd frontend
   ```
2. Build assets / Start local server:
   ```bash
   npm run dev
   ```
3. Open in browser: [http://localhost:5173](http://localhost:5173).
