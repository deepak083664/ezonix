import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Google Login Callback
  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success('Successfully logged in with Google!');
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Setup Google Identity Services Button
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '536012882296-158fbprbf62cvi6c9evin9thg93jrobo.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
          }
        );
      }
    };

    const timer = setTimeout(initializeGoogle, 800);
    return () => clearTimeout(timer);
  }, []);

  // Developer Bypass Login Handler
  const handleDevBypass = async () => {
    setLoading(true);
    try {
      await loginWithGoogle('dev-bypass-admin');
      toast.success('Development bypass authentication successful!');
      navigate('/app');
    } catch (err) {
      toast.error('Bypass authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-16 rounded-xl object-contain shadow-md"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            EZO<span className="text-primary">INX</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-550 dark:text-slate-400">
            Sign in to manage your business dashboard
          </p>
        </div>

        {/* Action Panel */}
        <div className="mt-8 space-y-4">
          <div className="w-full" id="googleSignInBtn"></div>

          {/* Fallback bypass option */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-semibold">
              <span className="bg-white px-3 text-slate-400 dark:bg-slate-900">
                Or Local Dev Mode
              </span>
            </div>
          </div>

          <button
            onClick={handleDevBypass}
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl border border-slate-200 py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 transition-all cursor-pointer"
          >
            <LogIn size={14} /> Continue as Tester
          </button>
        </div>

        {/* Footer info warning */}
        <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 dark:bg-blue-950/20 dark:border-blue-900/30">
          <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed text-center">
            <b>ezoinx</b> uses secure token sessions. Google logins automatically authorize and create database profiles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
