'use client';
import { AlertTriangle, ArrowUp, Minus, ArrowDown, Pencil, Trash2, User } from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <AlertTriangle size={11} />, label: 'Critical' },
  high:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  icon: <ArrowUp size={11} />,      label: 'High' },
  medium:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  icon: <Minus size={11} />,        label: 'Medium' },
  low:      { color: '#8888aa', bg: 'rgba(136,136,170,0.1)', icon: <ArrowDown size={11} />,    label: 'Low' },
};

const STATUS_CONFIG = {
  'todo':        { color: '#8888aa', bg: 'rgba(136,136,170,0.1)', label: 'To Do' },
  'in-progress': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'In Progress' },
  'done':        { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  label: 'Done' },
};

export default function IssueCard({ issue, onEdit, onDelete, onStatusChange }) {
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.todo;

  const nextStatus = {
    'todo': 'in-progress',
    'in-progress': 'done',
    'done': 'todo',
  };

  return (
    <div className="card card-hover" style={{ padding: '1rem 1.125rem' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
          {issue.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(issue)} className="btn-ghost" style={{ padding: '0.25rem 0.4rem' }} title="Edit">
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(issue._id)} className="btn-danger" style={{ padding: '0.25rem 0.4rem' }} title="Delete">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {issue.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {issue.description}
        </p>
      )}

      {/* Tags */}
      {issue.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {issue.tags.map((tag) => (
            <span key={tag} style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', padding: '0.1rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginTop: '0.5rem' }}>
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className="badge" style={{ background: priority.bg, color: priority.color }}>
            {priority.icon} {priority.label}
          </span>

          {/* Status - clickable to cycle */}
          <button
            onClick={() => onStatusChange && onStatusChange(issue._id, nextStatus[issue.status])}
            className="badge"
            style={{ background: status.bg, color: status.color, border: 'none', cursor: onStatusChange ? 'pointer' : 'default' }}
            title={onStatusChange ? 'Click to advance status' : ''}
          >
            {status.label}
          </button>
        </div>

        {/* Assignee + date */}
        <div className="flex items-center gap-2">
          {issue.assignee ? (
            <div className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white' }}>
                {issue.assignee.name?.[0]?.toUpperCase()}
              </div>
              {issue.assignee.name}
            </div>
          ) : (
            <div className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <User size={11} /> Unassigned
            </div>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
