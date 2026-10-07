import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCheck, Paperclip } from "lucide-react";
import { departmentService } from "../../services";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";
import {
  StatusBadge,
  PriorityBadge,
  formatDateTime,
  getApiError,
} from "../../utils/helpers";
import api from "../../services/api";

function attachmentHref(path) {
  return path?.startsWith("http")
    ? path
    : `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${path}`;
}
export default function DepartmentComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = () =>
    departmentService
      .getComplaint(id)
      .then((r) => setComplaint(r.data.complaint))
      .catch((e) => toast(getApiError(e), "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  const action = async (status) => {
    if (!message.trim()) {
      toast("Add a progress message first.", "error");
      return;
    }
    setBusy(true);
    try {
      if (status === "IN_PROGRESS" && complaint.status === "ASSIGNED")
        await departmentService.accept(id, { message: message.trim() });
      else
        await departmentService.update(id, { status, message: message.trim() });
      toast("Complaint progress updated.", "success");
      setMessage("");
      await load();
    } catch (e) {
      toast(getApiError(e), "error");
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Spinner label="Loading complaint..." />;
  if (!complaint)
    return <p className="p-5 text-slate-500">Complaint unavailable.</p>;
  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/department/complaints"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to complaints
        </Link>
        <h2 className="text-xl font-bold text-slate-800">{complaint.title}</h2>
        <div className="mt-2 flex gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card space-y-4 p-5">
            <h3 className="font-semibold">Complaint details</h3>
            <p className="text-sm text-slate-700">{complaint.description}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Category</dt>
                <dd>{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd>{complaint.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Student</dt>
                <dd>
                  {complaint.student?.name} · {complaint.class?.className}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Department</dt>
                <dd>{complaint.department?.name}</dd>
              </div>
            </dl>
            {complaint.attachmentUrl && (
              <a
                className="inline-flex items-center gap-2 text-sm text-brand-600"
                href={attachmentHref(complaint.attachmentUrl)}
                target="_blank"
                rel="noreferrer"
              >
                <Paperclip className="h-4 w-4" />
                View attachment
              </a>
            )}
            {complaint.coordinatorRemark && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <b>Coordinator remark</b>
                <p>{complaint.coordinatorRemark}</p>
              </div>
            )}
          </section>
          <section className="card p-5">
            <h3 className="mb-4 font-semibold">Progress history</h3>
            <div className="space-y-4">
              {complaint.updates?.map((u) => (
                <div key={u.id} className="border-l-2 border-brand-200 pl-4">
                  <p className="text-sm font-medium text-slate-800">
                    {u.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {u.user?.name || "System"} · {formatDateTime(u.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="card h-fit space-y-4 p-5">
          <h3 className="font-semibold">Update progress</h3>
          {complaint.status === "ASSIGNED" ||
          complaint.status === "IN_PROGRESS" ? (
            <>
              <textarea
                className="input min-h-28"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what has been done or what happens next..."
                disabled={busy}
              />
              {complaint.status === "ASSIGNED" ? (
                <button
                  className="btn-primary w-full"
                  disabled={busy}
                  onClick={() => action("IN_PROGRESS")}
                >
                  {busy ? "Updating..." : "Accept complaint and start work"}
                </button>
              ) : (
                <>
                  <button
                    className="btn-secondary w-full"
                    disabled={busy}
                    onClick={() => action("IN_PROGRESS")}
                  >
                    {busy ? "Updating..." : "Post progress update"}
                  </button>
                  <button
                    className="btn-success w-full"
                    disabled={busy}
                    onClick={() => action("RESOLVED")}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Resolve complaint
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              This complaint is{" "}
              {complaint.status.toLowerCase().replaceAll("_", " ")}.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
