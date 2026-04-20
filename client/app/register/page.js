'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,106,255,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>DevTrack</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Start tracking issues in minutes</p>
        </div>

        <div className="card p-8">
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" type="text" name="name" placeholder="Alex Johnson" value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
