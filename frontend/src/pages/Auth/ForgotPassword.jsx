import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Mail, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: data.email });
      toast.success('Reset code retrieved!');
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-blue-100 p-3 text-primary dark:bg-blue-900/30 dark:text-blue-400">
            <KeyRound size={28} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Enter your email to retrieve a password reset token
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="admin@example.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:text-white"
              />
            </div>
            {errors.email && (
              <span className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <ShieldAlert size={12} /> {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Requesting...' : 'Request Token'}
            </button>
          </div>
        </form>

        {/* Display reset token if available */}
        {resetToken && (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/40 dark:bg-yellow-950/20">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
              Reset Token Issued:
            </h4>
            <p className="mt-1 break-all text-xs font-mono text-slate-600 dark:text-slate-300 select-all">
              {resetToken}
            </p>
            <div className="mt-3">
              <Link
                to={`/reset-password/${resetToken}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Go to password reset page &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
