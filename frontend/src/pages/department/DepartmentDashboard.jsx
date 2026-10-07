import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock3, Layers, Loader } from "lucide-react";
import { departmentService } from "../../services";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import {
  StatusBadge,
  PriorityBadge,
  EmptyState,
  formatDate,
} from "../../utils/helpers";

export default function DepartmentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    departmentService
      .getComplaints()
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(
          e?.response?.data?.message || "Could not load department complaints.",
        ),
      );
  }, []);
  if (!data && !error)
    return <Spinner label="Loading department dashboard..." />;
  if (error) return <div className="p-5 text-sm text-red-600">{error}</div>;
  const { stats, complaints } = data;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Department Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Review assigned issues and keep students informed.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Assigned"
          value={stats.assigned}
          icon={Layers}
          color="purple"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Loader}
          color="indigo"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="emerald"
        />
      </div>
      <section className="card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-800">Recent Complaints</h3>
        </div>
        {complaints.length ? (
          <div className="divide-y divide-slate-100">
            {complaints.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to={`/department/complaints/${c.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{c.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {c.location || c.class?.className} ·{" "}
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Clock3 className="h-8 w-8 text-slate-400" />}
            title="No assigned complaints"
            message="New complaints routed to your department will appear here."
          />
        )}
      </section>
    </div>
  );
}
