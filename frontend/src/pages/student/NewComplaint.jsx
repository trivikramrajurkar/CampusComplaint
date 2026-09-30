import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { complaintService } from '../../services';
import { CATEGORIES, PRIORITIES, getApiError } from '../../utils/helpers';

export default function NewComplaint() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    priority: 'MEDIUM',
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast('File size must be under 5MB.', 'error');
        return;
      }
      setAttachment(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description) {
      toast('Title, category, and description are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('priority', form.priority);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await complaintService.create(formData);
      toast('Complaint submitted successfully!', 'success');
      navigate('/student/complaints');
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Submit New Complaint</h2>
        <p className="text-sm text-slate-500">Fill in the details below to submit your complaint</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Complaint Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Projector not working in Room 201"
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue in detail..."
              className="input resize-y"
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Room 201, Main Building"
              className="input"
            />
          </div>

          <div>
            <label className="label">Attachment (optional)</label>
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer">
                <Upload className="h-4 w-4" />
                Choose file
                <input type="file" onChange={handleFile} className="hidden" accept="image/*,application/pdf" />
              </label>
              {attachment && (
                <span className="text-sm text-slate-600">{attachment.name}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">Max 5MB. Images or PDF only.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Send className="h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/complaints')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
