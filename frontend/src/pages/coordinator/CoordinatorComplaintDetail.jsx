import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Paperclip } from 'lucide-react';
import { coordinatorService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import {
  StatusBadge,
  PriorityBadge,
  formatDate,
  formatDateTime,
  getApiError,
} from '../../utils/helpers';

export default function CoordinatorComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyRemark, setVerifyRemark] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComplaint = () => {
    coordinatorService
      .getComplaintById(id)
      .then((res) => setComplaint(res.data.complaint))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await coordinatorService.verify(id, { coordinatorRemark: verifyRemark });
      toast('Complaint verified successfully!', 'success');
      setVerifyOpen(false);
      setVerifyRemark('');
      loadComplaint();
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast('Rejection reason is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await coordinatorService.reject(id, {
        rejectionReason: rejectReason,
        coordinatorRemark: rejectRemark,
      });
      toast('Complaint rejected.', 'info');
      setRejectOpen(false);
      setRejectReason('');
      setRejectRemark('');
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

  const isPending = complaint.status === 'PENDING_VERIFICATION';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/coordinator/complaints"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to complaints
        </Link>
        <h2 className="text-lg font-bold text-slate-800">{complaint.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
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

          {(complaint.coordinatorRemark || complaint.rejectionReason) && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Your Remarks</h3>
              {complaint.coordinatorRemark && (
                <p className="text-sm text-slate-700">{complaint.coordinatorRemark}</p>
              )}
              {complaint.rejectionReason && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-600">Rejection Reason</p>
                  <p className="mt-1 text-sm text-red-700">{complaint.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {complaint.adminRemark && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Admin Remarks</h3>
              <p className="text-sm text-slate-700">{complaint.adminRemark}</p>
              {complaint.department && (
                <p className="mt-2 text-xs text-slate-500">
                  Department: {complaint.department.name}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Actions</h3>
            {isPending ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => setVerifyOpen(true)} className="btn-success w-full">
                  <CheckCircle className="h-4 w-4" />
                  Verify Complaint
                </button>
                <button onClick={() => setRejectOpen(true)} className="btn-danger w-full">
                  <XCircle className="h-4 w-4" />
                  Reject Complaint
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                This complaint has already been {complaint.status.toLowerCase().replace(/_/g, ' ')}.
                No further actions available.
              </p>
            )}
          </div>

          {complaint.resolvedAt && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Resolution</h3>
              <p className="text-sm text-slate-700">{complaint.adminRemark || '—'}</p>
              <p className="mt-2 text-xs text-slate-500">
                Resolved on {formatDate(complaint.resolvedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Verify Modal */}
      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify Complaint">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Verify this complaint to forward it to the Admin for department assignment.
          </p>
          <div>
            <label className="label">Remark (optional)</label>
            <textarea
              value={verifyRemark}
              onChange={(e) => setVerifyRemark(e.target.value)}
              rows={3}
              className="input resize-y"
              placeholder="Add a remark for the admin..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleVerify} disabled={submitting} className="btn-success flex-1">
              {submitting ? 'Verifying...' : 'Confirm Verify'}
            </button>
            <button onClick={() => setVerifyOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Complaint">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Rejection will send the complaint back to the student with a reason.
          </p>
          <div>
            <label className="label">Rejection Reason *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="input resize-y"
              placeholder="Explain why this complaint is being rejected..."
            />
          </div>
          <div>
            <label className="label">Additional Remark (optional)</label>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows={2}
              className="input resize-y"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleReject} disabled={submitting} className="btn-danger flex-1">
              {submitting ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button onClick={() => setRejectOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
