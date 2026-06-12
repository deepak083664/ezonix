import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API, { BACKEND_URL } from '../services/api';
import { useForm } from 'react-hook-form';
import { Building2, Save, Image as ImageIcon, ShieldAlert, BadgeAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      const s = res.data.data.setting;
      if (s) {
        setValue('businessName', s.businessName);
        setValue('gstNumber', s.gstNumber);
        setValue('address', s.address);
        setValue('phone', s.phone);
        setValue('email', s.email);
        setValue('invoicePrefix', s.invoicePrefix);
        setValue('defaultTaxRate', s.defaultTaxRate);
        if (s.logoUrl) {
          setLogoPreview(s.logoUrl.startsWith('http') ? s.logoUrl : `${BACKEND_URL}${s.logoUrl}`);
        }
      }
    } catch (err) {
      toast.error('Failed to load business configuration.');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (data) => {
    if (!isAdmin) {
      toast.error('Only administrators can update settings.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('businessName', data.businessName);
    formData.append('gstNumber', data.gstNumber);
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('invoicePrefix', data.invoicePrefix);
    formData.append('defaultTaxRate', data.defaultTaxRate);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await API.patch('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Configuration saved successfully!');
      if (res.data.data.setting?.logoUrl) {
        setLogoPreview(
          res.data.data.setting.logoUrl.startsWith('http')
            ? res.data.data.setting.logoUrl
            : `${BACKEND_URL}${res.data.data.setting.logoUrl}`
        );
      }
      // Refresh page context (can reload setting)
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save configuration settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Configuration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage business identity profiles, defaults tax parameters, and serial invoice prefixes.
        </p>
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20 flex gap-3 text-red-800 dark:text-red-400">
          <BadgeAlert size={20} className="shrink-0" />
          <div className="text-xs">
            <b>Access Restricted:</b> You are logged in with the <b>Staff</b> role. Configuration editing is limited to administrators only.
          </div>
        </div>
      )}

      {/* Main Form container */}
      <form
        onSubmit={handleSubmit(handleUpdate)}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        {/* Business branding row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center border-b border-slate-100 pb-6 dark:border-slate-800">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <Building2 className="text-slate-400" size={32} />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Corporate Branding
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Upload logo image. JPG, JPEG or PNG formats supported.
            </p>
            {isAdmin && (
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 select-none">
                <ImageIcon size={14} /> Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Business Legal Name *
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              {...register('businessName', { required: 'Name is required' })}
              className="form-input"
            />
            {errors.businessName && <span className="text-xs text-red-500">{errors.businessName.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              GSTIN / Tax GST Identifier
            </label>
            <input type="text" disabled={!isAdmin} {...register('gstNumber')} className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Contact Phone
            </label>
            <input type="text" disabled={!isAdmin} {...register('phone')} className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Contact Email Address
            </label>
            <input type="email" disabled={!isAdmin} {...register('email')} className="form-input" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Company Billing Address
          </label>
          <textarea disabled={!isAdmin} {...register('address')} rows="2" className="form-input" />
        </div>

        {/* Invoice Presets */}
        <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Invoicing Presets
          </h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Serial Prefix (e.g. INV)
              </label>
              <input type="text" disabled={!isAdmin} {...register('invoicePrefix')} className="form-input" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Default GST Tax Rate (%)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                {...register('defaultTaxRate')}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        {isAdmin && (
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary py-2.5 px-6 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} /> Save Configuration
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
