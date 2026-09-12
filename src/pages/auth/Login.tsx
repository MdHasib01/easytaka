import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, FormError, Input } from '../../components/ui/Form';
import { useAuth } from '../../contexts/AuthContext';
import { errorMessage } from '../../lib/api';
import { homePathFor } from '../../lib/auth';
import { AuthShell } from './AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await login(email, password);
      navigate(homePathFor(session), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your EasyTaka account."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="text-sm text-slate-400 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-indigo-300 hover:text-indigo-200 font-medium"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
