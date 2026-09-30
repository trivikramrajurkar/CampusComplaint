import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Search } from 'lucide-react';
import { coordinatorService } from '../../services';
import Spinner from '../../components/Spinner';
import {
  StatusBadge,
  PriorityBadge,
  formatDate,
  EmptyState,
} from '../../utils/helpers';

export default function CoordinatorComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    coordinatorService
      .getComplaints()
      .then((res) => setComplaints(res.data.complaints))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load complaints.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.student?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Complaints</h2>
        <p className="text-sm text-slate-500">Complaints from your assigned classes</p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading complaints..." />
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8 text-slate-400" />}
            title="No complaints found"
            message="Try adjusting your filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700">{c.student?.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{c.class?.className || '—'}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/coordinator/complaints/${c.id}`}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.category}</td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
