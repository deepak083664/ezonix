import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password, data.role);
      toast.success('Account registered successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <TrendingUp size={28} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Start managing inventory & invoice streams
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:text-white"
                />
              </div>
              {errors.name && (
                <span className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <ShieldAlert size={12} /> {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  placeholder="john@example.com"
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' },
                  })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:text-white"
                />
              </div>
              {errors.password && (
                <span className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <ShieldAlert size={12} /> {errors.password.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Access Role
              </label>
              <select
                {...register('role')}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:text-white"
              >
                <option value="staff">Staff (Default)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
