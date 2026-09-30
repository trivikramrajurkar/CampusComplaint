import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { getApiError } from '../../utils/helpers';

export default function RegisterPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    classId: '',
  });
  const [classes, setClasses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authService
      .getClasses()
      .then((res) => setClasses(res.data.classes))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.classId) {
      toast('Please fill in all required fields.', 'error');
      return;
    }
    if (form.password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(form);
      login(res.data.token, res.data.user);
      toast('Registration successful!', 'success');
      navigate('/student/dashboard');
    } catch (err) {
      toast(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Create Student Account</h1>
          <p className="mt-1 text-sm text-slate-500">Register to submit and track complaints</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@campus.edu"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className="input"
              />
            </div>
            <div>
              <label className="label">Class *</label>
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select your class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
