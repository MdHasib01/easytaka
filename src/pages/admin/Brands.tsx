import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Loader2, Pencil, Plus, Search, ShieldAlert, UserCog, Users } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { BrandLogoUpload } from '../../components/BrandLogoUpload';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, FormError, Input, Select } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { api, errorMessage } from '../../lib/api';
import { PLATFORMS } from '../../lib/constants';
import type { AdminBrand } from '../../types';

const EMPTY_BRAND = { name: '', logo: '🏷️', industry: '', primaryPlatform: 'Facebook', emailGuideline: '' };

function CreateBrandModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose(): void;
  onCreated(brand: AdminBrand): void;
}) {
  const [form, setForm] = useState(EMPTY_BRAND);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_BRAND);
      setError(null);
    }
  }, [open]);

  const set = (key: keyof typeof EMPTY_BRAND) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = Object.fromEntries((Object.entries(form) as [string, string][]).filter(([, v]) => v.trim() !== ''));
      const brand = await api<AdminBrand>('/brands', { method: 'POST', body });
      onCreated({ ...brand, smmCount: 0, staffCount: 0, pendingVerifications: 0 });
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
      title="Create brand"
      description="The brand gets the default enrichment pipeline. You can change it later from Brand Details."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-brand" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create brand
          </Button>
        </>
      }
    >
      <form id="create-brand" onSubmit={submit} className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-1.5">Brand Logo</span>
          <BrandLogoUpload
            value={form.logo}
            onChange={(logo) => setForm((f) => ({ ...f, logo }))}
            disabled={saving}
          />
        </div>

        <Field label="Brand name" required>
          <Input required value={form.name} onChange={set('name')} maxLength={120} placeholder="e.g. Acme Studio" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Industry">
            <Input value={form.industry} onChange={set('industry')} placeholder="e.g. FMCG / Baby Care" maxLength={120} />
          </Field>
          <Field label="Primary platform">
            <Select value={form.primaryPlatform} onChange={set('primaryPlatform')}>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Email guideline"
          hint="Shown to SMMs when they add a new social ID"
        >
          <Input
            value={form.emailGuideline}
            onChange={set('emailGuideline')}
            placeholder="firstname.brand.number@gmail.com"
            maxLength={200}
          />
        </Field>

        <FormError message={error} />
      </form>
    </Modal>
  );
}

function EditBrandModal({
  brand,
  open,
  onClose,
  onUpdated,
}: {
  brand: AdminBrand | null;
  open: boolean;
  onClose(): void;
  onUpdated(brand: AdminBrand): void;
}) {
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: '',
    logo: '🏷️',
    status: 'Active' as 'Active' | 'Inactive',
    industry: '',
    primaryPlatform: 'Facebook',
    emailGuideline: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand && open) {
      setForm({
        name: brand.name || '',
        logo: brand.logo || '🏷️',
        status: brand.status || 'Active',
        industry: brand.industry || '',
        primaryPlatform: brand.primaryPlatform || 'Facebook',
        emailGuideline: brand.emailGuideline || '',
      });
      setError(null);
    }
  }, [brand, open]);

  if (!brand) return null;

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api<AdminBrand>(`/brands/${brand.id}`, {
        method: 'PATCH',
        body: form,
      });
      onUpdated({ ...brand, ...updated });
      await refresh().catch(() => {});
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
      title="Edit brand"
      description={`Update settings and information for ${brand.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-brand" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-brand" onSubmit={submit} className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-1.5">Brand Logo</span>
          <BrandLogoUpload
            value={form.logo}
            onChange={(logo) => setForm((f) => ({ ...f, logo }))}
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Brand name" required className="sm:col-span-2">
            <Input required value={form.name} onChange={set('name')} maxLength={120} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Industry">
            <Input value={form.industry} onChange={set('industry')} placeholder="e.g. FMCG / Baby Care" maxLength={120} />
          </Field>
          <Field label="Primary platform">
            <Select value={form.primaryPlatform} onChange={set('primaryPlatform')}>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Email guideline"
          hint="Shown to SMMs when they add a new social ID"
        >
          <Input
            value={form.emailGuideline}
            onChange={set('emailGuideline')}
            placeholder="firstname.brand.number@gmail.com"
            maxLength={200}
          />
        </Field>

        <FormError message={error} />
      </form>
    </Modal>
  );
}

export default function Brands() {
  const { loginAsBrand } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<AdminBrand[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    api<AdminBrand[]>('/brands')
      .then(setBrands)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (brands ?? []).filter((b) => !q || `${b.name} ${b.industry ?? ''}`.toLowerCase().includes(q));
  }, [brands, query]);

  const openBrand = async (brand: AdminBrand) => {
    setOpeningId(brand.id);
    setError(null);
    try {
      await loginAsBrand(brand.id);
      navigate('/admin/brand/overview', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setOpeningId(null);
    }
  };

  const handleBrandUpdated = (updated: AdminBrand) => {
    setBrands((list) =>
      list ? list.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)) : [updated]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Brands</h2>
          <p className="text-sm text-slate-400 mt-1">Open a brand to work in it as its Brand Admin or edit brand information.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brands…" className="pl-9" />
          </div>
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" /> Create brand
          </Button>
        </div>
      </div>

      <FormError message={error} />

      {brands === null && !error && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}

      {brands !== null && visible.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-white/10">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">{brands.length ? 'No brands match your search' : 'No brands yet'}</p>
          {!brands.length && (
            <Button className="mt-4" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Create the first brand
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((brand) => (
          <div
            key={brand.id}
            className="group text-left rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-5 hover:border-indigo-500/40 hover:bg-slate-900/70 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4">
                <BrandLogo logo={brand.logo} className="w-14 h-14 text-3xl shrink-0 ring-2 ring-white/10 shadow-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-white truncate">{brand.name}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={brand.status === 'Active' ? 'success' : 'secondary'}>{brand.status}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                        onClick={() => setEditingBrand(brand)}
                        title="Edit brand"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{brand.industry || 'No industry set'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{brand.primaryPlatform}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="rounded-xl bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> SMMs
                  </p>
                  <p className="text-lg font-semibold text-white">{brand.smmCount}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <UserCog className="w-3 h-3" /> Staff
                  </p>
                  <p className="text-lg font-semibold text-white">{brand.staffCount}</p>
                </div>
                <div
                  className={
                    brand.pendingVerifications
                      ? 'rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2'
                      : 'rounded-xl bg-white/5 px-3 py-2'
                  }
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> NID
                  </p>
                  <p className={brand.pendingVerifications ? 'text-lg font-semibold text-amber-300' : 'text-lg font-semibold text-white'}>
                    {brand.pendingVerifications}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openBrand(brand)}
              disabled={openingId !== null}
              className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 text-sm w-full text-left cursor-pointer group/action focus:outline-none"
            >
              <span className="text-slate-400 group-hover/action:text-indigo-300 transition-colors">Log in as Brand Admin</span>
              {openingId === brand.id ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover/action:text-indigo-300 group-hover/action:translate-x-0.5 transition-all" />
              )}
            </button>
          </div>
        ))}
      </div>

      <CreateBrandModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(brand) =>
          setBrands((list) => [...(list ?? []), brand].sort((a, b) => a.name.localeCompare(b.name)))
        }
      />

      <EditBrandModal
        brand={editingBrand}
        open={editingBrand !== null}
        onClose={() => setEditingBrand(null)}
        onUpdated={handleBrandUpdated}
      />
    </div>
  );
}
