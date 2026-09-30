import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, Play, CheckCheck, Paperclip } from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import {
  StatusBadge,
  PriorityBadge,
  formatDate,
  formatDateTime,
  getApiError,
} from '../../utils/helpers';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDept, setSelectedDept] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComplaint = () => {
    Promise.all([
      adminService.getComplaintById(id),
      adminService.getDepartments().catch(() => ({ data: { departments: [] } })),
    ])
      .then(([compRes, deptRes]) => {
        setComplaint(compRes.data.complaint);
        setDepartments(deptRes.data.departments);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async () => {
    if (!selectedDept) {
      toast('Please select a department.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await adminService.assign(id, {
        departmentId: selectedDept,
        adminRemark: assignRemark,
      });
      toast('Department assigned successfully!', 'success');
      setSelectedDept('');
      setAssignRemark('');
      loadComplaint();
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'RESOLVED' && !statusRemark.trim()) {
      toast('A resolution remark is required to resolve.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await adminService.updateStatus(id, {
        status: newStatus,
        adminRemark: statusRemark || undefined,
      });
      toast(`Status updated to ${newStatus.replace(/_/g, ' ')}.`, 'success');
      setStatusRemark('');
      loadComplaint();
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading complaint..." />;
  if (error) return <div className="p-5 text-sm text-red-600">{error}</div>;
  if (!complaint) return <div className="p-5 text-sm text-slate-500">Complaint not found.</div>;

  const status = complaint.status;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/complaints"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to complaints
        </Link>
        <h2 className="text-lg font-bold text-slate-800">{complaint.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs text-slate-400">ID: {complaint.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Complaint Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-slate-700">{complaint.description}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium text-slate-500">Category</dt>
                  <dd className="mt-1 text-slate-700">{complaint.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Location</dt>
                  <dd className="mt-1 text-slate-700">{complaint.location || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Student</dt>
                  <dd className="mt-1 text-slate-700">{complaint.student?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd className="mt-1 text-slate-700">{complaint.student?.email || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Class</dt>
                  <dd className="mt-1 text-slate-700">{complaint.class?.className || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Submitted</dt>
                  <dd className="mt-1 text-slate-700">{formatDateTime(complaint.createdAt)}</dd>
                </div>
              </div>
              {complaint.attachmentUrl && (
                <div>
                  <dt className="font-medium text-slate-500">Attachment</dt>
                  <dd className="mt-1">
                    <a
                      href={complaint.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
                    >
                      <Paperclip className="h-4 w-4" />
                      View attachment
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {complaint.coordinatorRemark && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Coordinator Remarks</h3>
              <p className="text-sm text-slate-700">{complaint.coordinatorRemark}</p>
            </div>
          )}

          {complaint.adminRemark && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Admin Remarks</h3>
              <p className="text-sm text-slate-700">{complaint.adminRemark}</p>
              {complaint.resolvedAt && (
                <p className="mt-2 text-xs text-slate-500">
                  Resolved on {formatDateTime(complaint.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {complaint.feedback && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Student Feedback</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= complaint.feedback.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-medium text-slate-700">
                  {complaint.feedback.rating}/5
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="mt-2 text-sm text-slate-600">{complaint.feedback.comment}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Status Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Department</dt>
                <dd className="text-slate-700">{complaint.department?.name || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-700">{formatDate(complaint.createdAt)}</dd>
              </div>
              {complaint.resolvedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Resolved</dt>
                  <dd className="text-slate-700">{formatDate(complaint.resolvedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Department Assignment */}
          {status === 'VERIFIED' && (
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Layers className="h-4 w-4" />
                Assign Department
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="input"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={assignRemark}
                  onChange={(e) => setAssignRemark(e.target.value)}
                  placeholder="Assignment remark (optional)"
                  className="input"
                />
                <button
                  onClick={handleAssign}
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Assigning...' : 'Assign & Set to Assigned'}
                </button>
              </div>
            </div>
          )}

          {/* Status Management */}
          {['ASSIGNED', 'IN_PROGRESS'].includes(status) && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Update Status</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  placeholder={
                    status === 'IN_PROGRESS'
                      ? 'Resolution remark (required to resolve)'
                      : 'Admin remark (optional)'
                  }
                  className="input"
                />
                {status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    disabled={submitting}
                    className="btn-secondary w-full"
                  >
                    <Play className="h-4 w-4" />
                    Mark In Progress
                  </button>
                )}
                {status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusUpdate('RESOLVED')}
                    disabled={submitting}
                    className="btn-success w-full"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'RESOLVED' && (
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Completed</h3>
              <p className="text-sm text-slate-500">
                This complaint has been resolved. The student can now submit feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
