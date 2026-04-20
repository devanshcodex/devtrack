'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <nav className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>DevTrack</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.375rem 0.75rem', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }} className="hidden sm:block">
              {user?.name}
            </span>
          </div>
          <button onClick={logout} className="btn-ghost" style={{ padding: '0.375rem 0.625rem' }} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
