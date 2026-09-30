import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Send, Paperclip, MessageSquare } from 'lucide-react';
import { complaintService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import {
  StatusBadge,
  PriorityBadge,
  formatDate,
  formatDateTime,
  getApiError,
} from '../../utils/helpers';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    Promise.all([
      complaintService.getById(id),
      complaintService.getFeedback(id).catch(() => ({ data: { feedback: null } })),
    ])
      .then(([compRes, fbRes]) => {
        setComplaint(compRes.data.complaint);
        setFeedback(fbRes.data.feedback);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast('Please select a rating from 1 to 5.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await complaintService.submitFeedback(id, { rating, comment });
      toast('Feedback submitted successfully!', 'success');
      setShowFeedbackForm(false);
      setRating(0);
      setComment('');
      loadData();
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading complaint..." />;
  if (error) return <div className="p-5 text-sm text-red-600">{error}</div>;
  if (!complaint) return <div className="p-5 text-sm text-slate-500">Complaint not found.</div>;

  const isResolved = complaint.status === 'RESOLVED';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/student/complaints"
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
        {/* Main info */}
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

          {/* Coordinator remarks */}
          {(complaint.coordinatorRemark || complaint.rejectionReason) && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Coordinator Remarks</h3>
              {complaint.coordinatorRemark && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500">Remark</p>
                  <p className="mt-1 text-sm text-slate-700">{complaint.coordinatorRemark}</p>
                </div>
              )}
              {complaint.rejectionReason && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-600">Rejection Reason</p>
                  <p className="mt-1 text-sm text-red-700">{complaint.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin remarks */}
          {complaint.adminRemark && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Admin / Resolution Remarks</h3>
              <p className="text-sm text-slate-700">{complaint.adminRemark}</p>
              {complaint.resolvedAt && (
                <p className="mt-2 text-xs text-slate-500">
                  Resolved on {formatDateTime(complaint.resolvedAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Status Timeline</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-700">{formatDate(complaint.createdAt)}</dd>
              </div>
              {complaint.department && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Department</dt>
                  <dd className="text-slate-700">{complaint.department.name}</dd>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Resolved</dt>
                  <dd className="text-slate-700">{formatDate(complaint.resolvedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Feedback section */}
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </h3>

            {feedback ? (
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= feedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    {feedback.rating}/5
                  </span>
                </div>
                {feedback.comment && (
                  <p className="mt-2 text-sm text-slate-600">{feedback.comment}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Submitted on {formatDate(feedback.createdAt)}
                </p>
              </div>
            ) : isResolved ? (
              showFeedbackForm ? (
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div>
                    <label className="label">Rating *</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Comment (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="input resize-y"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting} className="btn-primary flex-1">
                      <Send className="h-4 w-4" />
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="btn-primary w-full"
                >
                  Submit Feedback
                </button>
              )
            ) : (
              <p className="text-sm text-slate-500">
                Feedback will be available after your complaint is resolved.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
