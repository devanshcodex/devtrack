'use client';
import Link from 'next/link';
import { Folder, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';

const STATUS_COLORS = {
  active: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', label: 'Active' },
  archived: { bg: 'rgba(136,136,170,0.1)', color: '#8888aa', label: 'Archived' },
};

export default function ProjectCard({ project, onDelete }) {
  const status = STATUS_COLORS[project.status] || STATUS_COLORS.active;
  const totalIssues = project.issueCount || 0;
  const openIssues = project.openIssues || 0;
  const doneIssues = totalIssues - openIssues;

  const progressPct = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  return (
    <div className="card card-hover flex flex-col" style={{ padding: '1.25rem', position: 'relative' }}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div style={{ width: 38, height: 38, borderRadius: 10, background: project.color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Folder size={18} color="white" />
          </div>
          <div>
            <Link href={`/project/${project._id}`} style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-primary)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-bright)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
              {project.name}
            </Link>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
              by {project.owner?.name || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
          {onDelete && (
            <button onClick={() => onDelete(project._id)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} title="Delete project">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3" style={{ marginTop: 'auto' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={13} style={{ color: 'var(--warning)' }} />
          {openIssues} open
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
          {doneIssues} done
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Clock size={13} />
          {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Progress bar */}
      {totalIssues > 0 && (
        <div>
          <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--success)', borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'right' }}>
            {progressPct}% complete
          </div>
        </div>
      )}
    </div>
  );
}
