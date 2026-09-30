export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const STATUS_STYLES = {
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700 border-amber-200',
  VERIFIED: 'bg-blue-100 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  ASSIGNED: 'bg-purple-100 text-purple-700 border-purple-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const PRIORITY_STYLES = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {priority}
    </span>
  );
}

export const CATEGORIES = [
  'Infrastructure',
  'Classroom',
  'Laboratory',
  'Library',
  'Cleanliness',
  'Wi-Fi / Internet',
  'Hostel',
  'Transport',
  'Other',
];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function getApiError(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'An unexpected error occurred. Please try again.'
  );
}

export function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-600">{message}</p>
    </div>
  );
}
