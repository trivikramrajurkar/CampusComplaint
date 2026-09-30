import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Loader, CheckCircle, PlusCircle, Inbox } from 'lucide-react';
import { complaintService } from '../../services';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { StatusBadge, PriorityBadge, formatDate, EmptyState } from '../../utils/helpers';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    complaintService
      .getMy()
      .then((res) => setComplaints(res.data.complaints))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load complaints.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING_VERIFICATION').length,
    inProgress: complaints.filter((c) =>
      ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
    ).length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  };

  const recent = complaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your complaints</p>
        </div>
        <Link to="/student/complaints/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          New Complaint
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Complaints" value={stats.total} icon={FileText} color="brand" />
        <StatCard label="Pending Verification" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} color="indigo" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="emerald" />
      </div>

      <div className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Recent Complaints</h3>
        </div>
        {loading ? (
          <Spinner label="Loading complaints..." />
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8 text-slate-400" />}
            title="No complaints yet"
            message="Submit your first complaint to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        to={`/student/complaints/${c.id}`}
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
