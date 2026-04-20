'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';

const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll();
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await projectAPI.create(form);
      setProjects([res.data.project, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6366f1' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its issues?')) return;
    try {
      await projectAPI.delete(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    totalIssues: projects.reduce((acc, p) => acc + (p.issueCount || 0), 0),
    openIssues: projects.reduce((acc, p) => acc + (p.openIssues || 0), 0),
  };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Here's what's happening with your projects.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: stats.total, color: 'var(--accent)' },
            { label: 'Active Projects', value: stats.active, color: 'var(--success)' },
            { label: 'Total Issues', value: stats.totalIssues, color: 'var(--info)' },
            { label: 'Open Issues', value: stats.openIssues, color: 'var(--warning)' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20">
            <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Create your first project to start tracking issues.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Your Projects ({projects.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <Modal title="Create New Project" onClose={() => { setShowModal(false); setError(''); }}>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Project Name *</label>
              <input className="input-field" placeholder="e.g. Backend API v2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field" placeholder="What is this project about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : 'none', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3" style={{ paddingTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</> : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
