import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { getApiError } from '../../utils/helpers';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter your email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      login(res.data.token, res.data.user);
      toast('Login successful!', 'success');
      const map = {
        STUDENT: '/student/dashboard',
        COORDINATOR: '/coordinator/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(map[res.data.user.role] || '/login');
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
          <h1 className="text-xl font-bold text-slate-800">Campus Complaint &amp; Feedback Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
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
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-center text-sm text-slate-500">
              New student?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-600">Test credentials (password: password123):</p>
            <p>Admin: admin@campus.edu</p>
            <p>Coordinator: coord.a@campus.edu</p>
            <p>Student: student1@campus.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
