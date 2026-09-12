import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, IdCard, Loader2, Plus, Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BrandLogo } from '../../components/BrandLogo';
import { Field, FormError, Input, Select, Textarea } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { api, errorMessage } from '../../lib/api';
import { initials, ROLE_LABELS } from '../../lib/auth';
import { cn } from '../../lib/utils';
import type { AdminBrand, ManagedUser, NidDetails, Role, Verification, VerificationStatus } from '../../types';

const VERIFICATION_VARIANT: Record<VerificationStatus, 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Verified: 'success',
  Rejected: 'error',
};

const CREATABLE_ROLES: Role[] = ['MANAGER', 'REVIEWER', 'ADMIN'];

// ---- Create user ---------------------------------------------------------------------

const EMPTY_USER = { name: '', email: '', phone: '', password: '', role: 'MANAGER' as Role, brandId: '' };

function CreateUserModal({
  open,
  brands,
  onClose,
  onCreated,
}: {
  open: boolean;
  brands: AdminBrand[];
  onClose(): void;
  onCreated(user: ManagedUser): void;
}) {
  const [form, setForm] = useState(EMPTY_USER);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_USER);
      setError(null);
    }
  }, [open]);

  const set = (key: keyof typeof EMPTY_USER) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const needsBrand = form.role !== 'ADMIN';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { brandId, phone, ...rest } = form;
      const body = { ...rest, ...(phone.trim() && { phone }), ...(needsBrand && { brandId }) };
      onCreated(await api<ManagedUser>('/users', { method: 'POST', body }));
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create user"
      description="SMMs sign up themselves (with NID) or are invited from a brand's Workforce tab."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-user" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create user
          </Button>
        </>
      }
    >
      <form id="create-user" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" required>
          <Select value={form.role} onChange={set('role')}>
            {CREATABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        {needsBrand ? (
          <Field label="Brand" required>
            <Select required value={form.brandId} onChange={set('brandId')}>
              <option value="">Select a brand…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.logo} {b.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <p className="text-xs text-slate-400 self-end pb-2.5">Admins manage every brand and all users.</p>
        )}
        <Field label="Full name" required>
          <Input required minLength={2} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Phone">
          <Input type="tel" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Email" required>
          <Input type="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Temporary password" required hint="At least 6 characters">
          <Input required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <div className="sm:col-span-2">
          <FormError message={error} />
        </div>
      </form>
    </Modal>
  );
}

// ---- NID review ----------------------------------------------------------------------

function NidImage({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group relative block aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950"
        >
          <img src={url} alt={label} className="w-full h-full object-contain" />
          <span className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>
      ) : (
        <div className="aspect-[1.6] rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500">
          No image
        </div>
      )}
    </div>
  );
}

function NidReviewModal({
  userId,
  onClose,
  onReviewed,
}: {
  userId: string | null;
  onClose(): void;
  onReviewed(userId: string, verification: Verification): void;
}) {
  const [details, setDetails] = useState<NidDetails | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<'Approve' | 'Reject' | null>(null);

  useEffect(() => {
    if (!userId) return;
    setDetails(null);
    setNote('');
    setError(null);
    api<NidDetails>(`/users/${userId}/nid`)
      .then(setDetails)
      .catch((err) => setError(errorMessage(err)));
  }, [userId]);

  const review = async (action: 'Approve' | 'Reject') => {
    if (!userId) return;
    if (action === 'Reject' && !note.trim()) {
      setError('Give a reason for rejecting. The SMM will see it.');
      return;
    }
    setSaving(action);
    setError(null);
    try {
      const { verification } = await api<{ verification: Verification }>(`/users/${userId}/verification`, {
        method: 'POST',
        body: { action, ...(note.trim() && { note: note.trim() }) },
      });
      onReviewed(userId, verification);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  const status = details?.verification?.status;

  return (
    <Modal
      open={userId !== null}
      onClose={onClose}
      size="lg"
      title="Review National ID"
      description={details ? `${details.user.name} · ${details.user.email}` : undefined}
      footer={
        <>
          <Button variant="danger" onClick={() => review('Reject')} disabled={!details || saving !== null}>
            {saving === 'Reject' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reject
          </Button>
          <Button onClick={() => review('Approve')} disabled={!details || saving !== null}>
            {saving === 'Approve' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 mr-2" />
            )}
            Approve
          </Button>
        </>
      }
    >
      {!details && !error && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}
      {details && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">NID number</p>
              <p className="font-mono text-white">{details.number ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">NID division</p>
              <p className="text-white">{details.nidDivision}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Brand</p>
              {details.brand ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <BrandLogo logo={details.brand.logo} className="w-5 h-5 text-xs rounded-md shrink-0" />
                  <span className="text-white text-sm">{details.brand.name}</span>
                </div>
              ) : (
                <p className="text-white">—</p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p>
              {status && <Badge variant={VERIFICATION_VARIANT[status]}>{status}</Badge>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NidImage label="Front" url={details.frontUrl} />
            <NidImage label="Back" url={details.backUrl} />
          </div>

          {details.verification?.note && (
            <p className="text-xs text-slate-400">
              Previous note: <span className="text-slate-200">{details.verification.note}</span>
            </p>
          )}

          <Field label="Note to the SMM" hint="Required when rejecting">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
          </Field>
        </div>
      )}
      <div className={cn(details && 'mt-4')}>
        <FormError message={error} />
      </div>
    </Modal>
  );
}

// ---- Page ----------------------------------------------------------------------------

type Tab = 'all' | 'verification';

export default function ManageUsers() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [role, setRole] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [verification, setVerification] = useState<VerificationStatus>('Pending');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadPendingCount = useCallback(() => {
    api<ManagedUser[]>('/users?verification=Pending')
      .then((list) => setPendingCount(list.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api<AdminBrand[]>('/brands').then(setBrands).catch(() => {});
    loadPendingCount();
  }, [loadPendingCount]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tab === 'verification') {
      params.set('verification', verification);
    } else {
      if (role) params.set('role', role);
      if (status) params.set('status', status);
    }
    if (brand) params.set('brand', brand);
    if (debouncedQuery) params.set('q', debouncedQuery);

    let cancelled = false;
    setUsers(null);
    setError(null);
    api<ManagedUser[]>(`/users?${params}`)
      .then((list) => !cancelled && setUsers(list))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [tab, role, brand, status, verification, debouncedQuery]);

  const replaceUser = (updated: ManagedUser) =>
    setUsers((list) => list?.map((u) => (u.id === updated.id ? updated : u)) ?? null);

  const toggleStatus = async (user: ManagedUser) => {
    setTogglingId(user.id);
    try {
      const next = user.status === 'Active' ? 'Suspended' : 'Active';
      replaceUser(await api<ManagedUser>(`/users/${user.id}`, { method: 'PATCH', body: { status: next } }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const onReviewed = (userId: string, v: Verification) => {
    setUsers((list) => {
      if (!list) return list;
      // In the verification tab the user no longer matches the current status filter.
      if (tab === 'verification' && v.status !== verification) return list.filter((u) => u.id !== userId);
      return list.map((u) => (u.id === userId && u.smm ? { ...u, smm: { ...u.smm, verification: v } } : u));
    });
    loadPendingCount();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage users</h2>
          <p className="text-sm text-slate-400 mt-1">Admins, brand admins, reviewers and SMMs across every brand.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Create user
        </Button>
      </div>

      <div className="flex gap-1 p-1 bg-slate-900/60 border border-white/10 rounded-xl w-fit">
        {(
          [
            ['all', 'All users'],
            ['verification', 'NID verification'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              tab === value ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {label}
            {value === 'verification' && pendingCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email…" className="pl-9" />
        </div>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.logo} {b.name}
            </option>
          ))}
        </Select>
        {tab === 'all' ? (
          <>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any status</option>
              <option>Active</option>
              <option>Suspended</option>
            </Select>
          </>
        ) : (
          <Select value={verification} onChange={(e) => setVerification(e.target.value as VerificationStatus)}>
            <option value="Pending">Pending review</option>
            <option value="Rejected">Rejected</option>
            <option value="Verified">Verified</option>
          </Select>
        )}
      </div>

      <FormError message={error} />

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Brand</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">NID</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users === null && !error && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin inline" />
                </td>
              </tr>
            )}
            {users?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500">
                  {tab === 'verification' ? `No ${verification.toLowerCase()} NID verifications` : 'No users match these filters'}
                </td>
              </tr>
            )}
            {users?.map((user) => {
              const isSelf = user.id === session?.user.id;
              const v = user.smm?.verification;
              return (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-100 truncate">
                          {user.name} {isSelf && <span className="text-xs text-slate-500">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {user.brand ? (
                      <div className="flex items-center gap-1.5">
                        <BrandLogo logo={user.brand.logo} className="w-5 h-5 text-xs rounded-md shrink-0" />
                        <span className="truncate">{user.brand.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">All brands</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {v ? <Badge variant={VERIFICATION_VARIANT[v.status]}>{v.status}</Badge> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {user.smm?.hasNid && (
                        <Button size="sm" variant="outline" onClick={() => setReviewingId(user.id)}>
                          <IdCard className="w-4 h-4 mr-1.5" /> Review NID
                        </Button>
                      )}
                      {!isSelf && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(user)}
                          disabled={togglingId === user.id}
                          className={user.status === 'Active' ? 'text-rose-300' : 'text-emerald-300'}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : user.status === 'Active' ? (
                            <UserX className="w-4 h-4 mr-1.5" />
                          ) : (
                            <UserCheck className="w-4 h-4 mr-1.5" />
                          )}
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateUserModal
        open={creating}
        brands={brands}
        onClose={() => setCreating(false)}
        onCreated={(user) => setUsers((list) => (list ? [user, ...list] : [user]))}
      />
      <NidReviewModal userId={reviewingId} onClose={() => setReviewingId(null)} onReviewed={onReviewed} />
    </div>
  );
}
