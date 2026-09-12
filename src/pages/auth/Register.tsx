import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IdCard, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, FormError, Input, Select } from '../../components/ui/Form';
import { useAuth } from '../../contexts/AuthContext';
import { api, errorMessage } from '../../lib/api';
import { DIVISIONS, NID_IMAGE_MAX_BYTES, NID_IMAGE_TYPES, NID_NUMBER_PATTERN } from '../../lib/constants';
import type { BrandSummary } from '../../types';
import { AuthShell } from './AuthShell';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  brandId: '',
  nidNumber: '',
  nidDivision: '',
  assignedWorkingDivision: '',
};

function NidImagePicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange(file: File | null, error?: string): void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (picked?: File) => {
    if (!picked) return;
    if (!NID_IMAGE_TYPES.includes(picked.type)) return onChange(null, `${label}: use a JPEG, PNG or WebP image`);
    if (picked.size > NID_IMAGE_MAX_BYTES) return onChange(null, `${label}: the image must be 5 MB or smaller`);
    onChange(picked);
  };

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-300">
        {label}
        <span className="text-rose-400 ml-0.5">*</span>
      </span>
      {preview ? (
        <div className="relative aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950">
          <img src={preview} alt={label} className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="aspect-[1.6] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-colors text-slate-400">
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs">Tap to upload a photo</span>
          <input
            type="file"
            accept={NID_IMAGE_TYPES.join(',')}
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<BrandSummary[]>('/brands/public')
      .then(setBrands)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): string | null => {
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.brandId) return 'Choose the brand you want to work for';
    if (!NID_NUMBER_PATTERN.test(form.nidNumber.trim())) return 'NID number must be 10, 13 or 17 digits';
    if (!form.nidDivision) return 'Choose the division printed on your NID';
    if (form.assignedWorkingDivision && form.assignedWorkingDivision === form.nidDivision) {
      return 'Working division must be different from your NID division';
    }
    if (!nidFront || !nidBack) return 'Upload photos of both the front and back of your NID';
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

    const body = new FormData();
    const { confirmPassword: _confirm, ...fields } = form;
    for (const [key, value] of Object.entries(fields) as [string, string][]) {
      if (value.trim()) body.append(key, value.trim());
    }
    body.set('password', form.password);
    body.append('nidFront', nidFront!);
    body.append('nidBack', nidBack!);

    setSubmitting(true);
    try {
      await register(body);
      navigate('/verification', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  const onImage = (setter: (f: File | null) => void) => (file: File | null, problem?: string) => {
    setter(file);
    setError(problem ?? null);
  };

  return (
    <AuthShell
      wide
      title="Create your SMM account"
      subtitle="Your National ID is checked by an admin before your workspace is unlocked."
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input required minLength={2} value={form.name} onChange={set('name')} autoComplete="name" />
            </Field>
            <Field label="Phone">
              <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+8801…" autoComplete="tel" />
            </Field>
            <Field label="Email" required className="sm:col-span-2">
              <Input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
            </Field>
            <Field label="Password" required hint="At least 6 characters">
              <Input type="password" required value={form.password} onChange={set('password')} autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" required>
              <Input
                type="password"
                required
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Brand" required className="sm:col-span-2">
              <Select required value={form.brandId} onChange={set('brandId')}>
                <option value="">Select a brand…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.logo} {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <IdCard className="w-4 h-4" /> National ID verification
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="NID number" required hint="10, 13 or 17 digits" className="sm:col-span-2">
              <Input
                required
                inputMode="numeric"
                value={form.nidNumber}
                onChange={set('nidNumber')}
                placeholder="e.g. 1234567890"
              />
            </Field>
            <Field label="NID division" required hint="As printed on your NID">
              <Select required value={form.nidDivision} onChange={set('nidDivision')}>
                <option value="">Select…</option>
                {DIVISIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field label="Preferred working division" hint="Must differ from your NID division">
              <Select value={form.assignedWorkingDivision} onChange={set('assignedWorkingDivision')}>
                <option value="">No preference</option>
                {DIVISIONS.filter((d) => d !== form.nidDivision).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <NidImagePicker label="NID front" file={nidFront} onChange={onImage(setNidFront)} />
            <NidImagePicker label="NID back" file={nidBack} onChange={onImage(setNidBack)} />
          </div>
        </section>

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitting ? 'Uploading NID…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-slate-400 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-medium">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
