import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Layers, Loader, CheckCheck, Inbox } from 'lucide-react';
import { adminService } from '../../services';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import {
  StatusBadge,
  PriorityBadge,
  formatDate,
  EmptyState,
} from '../../utils/helpers';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .getComplaints()
      .then((res) => setComplaints(res.data.complaints))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load complaints.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    verified: complaints.filter((c) => c.status === 'VERIFIED').length,
    assigned: complaints.filter((c) => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  };

  const verifiedList = complaints.filter((c) => c.status === 'VERIFIED').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">Manage verified complaints and assign departments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verified" value={stats.verified} icon={CheckCircle} color="blue" />
        <StatCard label="Assigned" value={stats.assigned} icon={Layers} color="purple" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} color="indigo" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCheck} color="emerald" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Awaiting Assignment</h3>
          <Link to="/admin/complaints" className="text-sm text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {loading ? (
          <Spinner label="Loading complaints..." />
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : verifiedList.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8 text-slate-400" />}
            title="No verified complaints"
            message="Verified complaints from coordinators will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifiedList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700">{c.student?.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{c.class?.className || '—'}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/complaints/${c.id}`}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={c.priority} />
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
