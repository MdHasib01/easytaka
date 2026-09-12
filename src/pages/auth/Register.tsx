import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, IdCard, ImagePlus, Loader2, Users, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, FormError, Input, Select } from '../../components/ui/Form';
import { useAuth } from '../../contexts/AuthContext';
import { errorMessage } from '../../lib/api';
import { homePathFor } from '../../lib/auth';
import { DIVISIONS, NID_IMAGE_MAX_BYTES, NID_IMAGE_TYPES, NID_NUMBER_PATTERN } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { AuthShell } from './AuthShell';

type RoleTab = 'MANAGER' | 'SMM';

const EMPTY_SMM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  nidNumber: '',
  nidDivision: '',
  assignedWorkingDivision: '',
};

const EMPTY_BRAND_ADMIN = {
  name: '',
  email: '',
  phone: '',
  brandName: '',
  password: '',
  confirmPassword: '',
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
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role')?.toLowerCase();
  const initialRole: RoleTab = roleParam === 'brand' || roleParam === 'manager' || roleParam === 'admin' ? 'MANAGER' : 'SMM';

  const [role, setRole] = useState<RoleTab>(initialRole);
  const [smmForm, setSmmForm] = useState(EMPTY_SMM);
  const [brandForm, setBrandForm] = useState(EMPTY_BRAND_ADMIN);
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (newRole: RoleTab) => {
    setRole(newRole);
    setError(null);
    setSearchParams({ role: newRole === 'MANAGER' ? 'brand' : 'smm' });
  };

  const setSmm = (key: keyof typeof EMPTY_SMM) => (e: { target: { value: string } }) =>
    setSmmForm((f) => ({ ...f, [key]: e.target.value }));

  const setBrand = (key: keyof typeof EMPTY_BRAND_ADMIN) => (e: { target: { value: string } }) =>
    setBrandForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): string | null => {
    if (role === 'MANAGER') {
      if (brandForm.name.trim().length < 2) return 'Please enter your full name';
      if (brandForm.password.length < 6) return 'Password must be at least 6 characters';
      if (brandForm.password !== brandForm.confirmPassword) return 'Passwords do not match';
      return null;
    }

    // SMM validation
    if (smmForm.name.trim().length < 2) return 'Please enter your full name';
    if (smmForm.password.length < 6) return 'Password must be at least 6 characters';
    if (smmForm.password !== smmForm.confirmPassword) return 'Passwords do not match';
    if (!NID_NUMBER_PATTERN.test(smmForm.nidNumber.trim())) return 'NID number must be 10, 13 or 17 digits';
    if (!smmForm.nidDivision) return 'Choose the division printed on your NID';
    if (smmForm.assignedWorkingDivision && smmForm.assignedWorkingDivision === smmForm.nidDivision) {
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

    setSubmitting(true);
    try {
      if (role === 'MANAGER') {
        const payload = {
          role: 'MANAGER',
          name: brandForm.name.trim(),
          email: brandForm.email.trim(),
          phone: brandForm.phone.trim() || undefined,
          brandName: brandForm.brandName.trim() || undefined,
          password: brandForm.password,
        };
        const session = await register(payload);
        navigate(homePathFor(session), { replace: true });
      } else {
        const body = new FormData();
        body.append('role', 'SMM');
        const { confirmPassword: _confirm, ...fields } = smmForm;
        for (const [key, value] of Object.entries(fields) as [string, string][]) {
          if (value.trim()) body.append(key, value.trim());
        }
        body.set('password', smmForm.password);
        body.append('nidFront', nidFront!);
        body.append('nidBack', nidBack!);

        await register(body);
        navigate('/verification', { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  const onImage = (setter: (f: File | null) => void) => (file: File | null, problem?: string) => {
    setter(file);
    setError(problem ?? null);
  };

  const isBrandAdmin = role === 'MANAGER';

  return (
    <AuthShell
      wide={!isBrandAdmin}
      title={isBrandAdmin ? 'Create Brand Admin account' : 'Create your SMM account'}
      subtitle={
        isBrandAdmin
          ? 'Set up your workspace to manage your brand, products, missions, and workforce.'
          : 'Your National ID is checked by an admin before your workspace is unlocked.'
      }
    >
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl mb-8 shadow-inner">
        <button
          type="button"
          onClick={() => handleTabChange('MANAGER')}
          className={cn(
            'py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isBrandAdmin
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
          )}
        >
          <Building2 className="w-4 h-4" />
          Brand Admin
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('SMM')}
          className={cn(
            'py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            !isBrandAdmin
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
          )}
        >
          <Users className="w-4 h-4" />
          SMM
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {isBrandAdmin ? (
          /* Brand Admin Registration Form */
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Brand Admin Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input
                  required
                  minLength={2}
                  value={brandForm.name}
                  onChange={setBrand('name')}
                  autoComplete="name"
                  placeholder="e.g. Sarah Jenkins"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={brandForm.phone}
                  onChange={setBrand('phone')}
                  placeholder="+8801…"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Work email" required className="sm:col-span-2">
                <Input
                  type="email"
                  required
                  value={brandForm.email}
                  onChange={setBrand('email')}
                  autoComplete="email"
                  placeholder="admin@brand.com"
                />
              </Field>
              <Field label="Brand / Company name" hint="Optional" className="sm:col-span-2">
                <Input
                  value={brandForm.brandName}
                  onChange={setBrand('brandName')}
                  placeholder="e.g. Apex Lifestyle"
                />
              </Field>
              <Field label="Password" required hint="At least 6 characters">
                <Input
                  type="password"
                  required
                  value={brandForm.password}
                  onChange={setBrand('password')}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm password" required>
                <Input
                  type="password"
                  required
                  value={brandForm.confirmPassword}
                  onChange={setBrand('confirmPassword')}
                  autoComplete="new-password"
                />
              </Field>
            </div>
          </section>
        ) : (
          /* SMM Registration Form */
          <>
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <Input required minLength={2} value={smmForm.name} onChange={setSmm('name')} autoComplete="name" />
                </Field>
                <Field label="Phone">
                  <Input type="tel" value={smmForm.phone} onChange={setSmm('phone')} placeholder="+8801…" autoComplete="tel" />
                </Field>
                <Field label="Email" required className="sm:col-span-2">
                  <Input type="email" required value={smmForm.email} onChange={setSmm('email')} autoComplete="email" />
                </Field>
                <Field label="Password" required hint="At least 6 characters">
                  <Input
                    type="password"
                    required
                    value={smmForm.password}
                    onChange={setSmm('password')}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password" required>
                  <Input
                    type="password"
                    required
                    value={smmForm.confirmPassword}
                    onChange={setSmm('confirmPassword')}
                    autoComplete="new-password"
                  />
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
                    value={smmForm.nidNumber}
                    onChange={setSmm('nidNumber')}
                    placeholder="e.g. 1234567890"
                  />
                </Field>
                <Field label="NID division" required hint="As printed on your NID">
                  <Select required value={smmForm.nidDivision} onChange={setSmm('nidDivision')}>
                    <option value="">Select…</option>
                    {DIVISIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Preferred working division" hint="Must differ from your NID division">
                  <Select value={smmForm.assignedWorkingDivision} onChange={setSmm('assignedWorkingDivision')}>
                    <option value="">No preference</option>
                    {DIVISIONS.filter((d) => d !== smmForm.nidDivision).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                <NidImagePicker label="NID front" file={nidFront} onChange={onImage(setNidFront)} />
                <NidImagePicker label="NID back" file={nidBack} onChange={onImage(setNidBack)} />
              </div>
            </section>
          </>
        )}

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitting
            ? isBrandAdmin
              ? 'Creating account…'
              : 'Uploading NID…'
            : isBrandAdmin
              ? 'Create Brand Admin account'
              : 'Create SMM account'}
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
