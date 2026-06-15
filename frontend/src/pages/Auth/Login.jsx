import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Google Login Callback
  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      const data = await loginWithGoogle(response.credential);
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
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '536012882296-158fbprbf62cvi6c9evin9thg93jrobo.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });
        const btn = document.getElementById('googleSignInBtn');
        if (btn) {
          window.google.accounts.id.renderButton(btn, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
          });
          clearInterval(intervalId);
        }
      }
      attempts++;
      if (attempts > 50) { // Stop checking after 5 seconds (50 * 100ms)
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-16 rounded-xl object-contain bg-slate-900 dark:bg-slate-800/50 p-2 shadow-md"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            EZO<span className="text-primary">NIX</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your business dashboard
          </p>
        </div>

        {/* Action Panel */}
        <div className="mt-8 space-y-4">
          <div className="w-full" id="googleSignInBtn"></div>
        </div>

        {/* Footer info warning */}
        <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 dark:bg-blue-950/20 dark:border-blue-900/30">
          <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed text-center">
            <b>ezonix</b> uses secure token sessions. Google logins automatically authorize and create database profiles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
