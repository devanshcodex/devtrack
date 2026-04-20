'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, issueAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import IssueCard from '../../components/IssueCard';
import Modal from '../../components/Modal';
import { Plus, ArrowLeft, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';

const STATUSES = [
  { key: 'todo',        label: 'To Do',       color: 'var(--text-muted)' },
  { key: 'in-progress', label: 'In Progress',  color: 'var(--warning)' },
  { key: 'done',        label: 'Done',         color: 'var(--success)' },
];

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const emptyIssue = { title: '', description: '', status: 'todo', priority: 'medium', tags: '' };

export default function ProjectPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIssue, setEditIssue] = useState(null);
  const [form, setForm] = useState(emptyIssue);
  const [saving, setSaving] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) fetchAll();
  }, [user, id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [projRes, issueRes] = await Promise.all([
        projectAPI.getOne(id),
        issueAPI.getByProject(id),
      ]);
      setProject(projRes.data.project);
      setIssues(issueRes.data.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditIssue(null);
    setForm(emptyIssue);
    setError('');
    setShowModal(true);
  };

  const openEdit = (issue) => {
    setEditIssue(issue);
    setForm({
      title: issue.title,
      description: issue.description || '',
      status: issue.status,
      priority: issue.priority,
      tags: issue.tags?.join(', ') || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      projectId: id,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editIssue) {
        const res = await issueAPI.update(editIssue._id, payload);
        setIssues(issues.map((i) => (i._id === editIssue._id ? res.data.issue : i)));
      } else {
        const res = await issueAPI.create(payload);
        setIssues([res.data.issue, ...issues]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save issue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (issueId) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await issueAPI.delete(issueId);
      setIssues(issues.filter((i) => i._id !== issueId));
    } catch {
      alert('Failed to delete issue.');
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const res = await issueAPI.update(issueId, { status: newStatus });
      setIssues(issues.map((i) => (i._id === issueId ? res.data.issue : i)));
    } catch {
      alert('Failed to update status.');
    }
  };

  const filteredIssues = filterPriority
    ? issues.filter((i) => i.priority === filterPriority)
    : issues;

  const issuesByStatus = (status) => filteredIssues.filter((i) => i.status === status);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24">
          <p style={{ color: 'var(--text-secondary)' }}>Project not found.</p>
          <Link href="/dashboard" className="btn-primary mt-4">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={14} /> Dashboard
        </Link>

        {/* Project header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" fill="white" viewBox="0 0 24 24" opacity={0.9}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{project.name}</h1>
              {project.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{project.description}</p>
              )}
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary shrink-0">
            <Plus size={16} /> New Issue
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {STATUSES.map((s) => {
            const count = issuesByStatus(s.key).length;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                {s.label}
              </div>
            );
          })}

          {/* Priority filter */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-field"
              style={{ padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.8rem' }}
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATUSES.map((col) => {
            const colIssues = issuesByStatus(col.key);
            return (
              <div key={col.key}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                      {col.label}
                    </span>
                  </div>
                  <span style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', borderRadius: 999, padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {colIssues.length}
                  </span>
                </div>

                {/* Issues */}
                <div className="flex flex-col gap-3">
                  {colIssues.length === 0 ? (
                    <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No issues
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create / Edit Issue Modal */}
      {showModal && (
        <Modal title={editIssue ? 'Edit Issue' : 'Create New Issue'} onClose={() => setShowModal(false)}>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input-field" placeholder="e.g. Fix login redirect bug" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input-field" placeholder="Describe the issue in detail…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ resize: 'vertical' }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tags (comma separated)</label>
              <input className="input-field mono" placeholder="bug, ui, auth" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>

            <div className="flex gap-3" style={{ paddingTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : editIssue ? 'Save Changes' : 'Create Issue'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
