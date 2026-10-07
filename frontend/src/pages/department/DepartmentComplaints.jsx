import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { departmentService } from "../../services";
import Spinner from "../../components/Spinner";
import { StatusBadge, PriorityBadge, formatDate } from "../../utils/helpers";

export default function DepartmentComplaints() {
  const [complaints, setComplaints] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    departmentService
      .getComplaints()
      .then((r) => setComplaints(r.data.complaints))
      .catch((e) =>
        setError(e?.response?.data?.message || "Could not load complaints."),
      );
  }, []);
  if (!complaints && !error) return <Spinner label="Loading complaints..." />;
  if (error) return <p className="p-5 text-sm text-red-600">{error}</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">
        Department Complaints
      </h2>
      <div className="card divide-y divide-slate-100">
        {complaints.length ? (
          complaints.map((c) => (
            <Link
              key={c.id}
              to={`/department/complaints/${c.id}`}
              className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-800">{c.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {c.category} · {c.location || "Location not provided"} ·{" "}
                  {formatDate(c.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No complaints assigned yet.
          </p>
        )}
      </div>
    </div>
  );
}
