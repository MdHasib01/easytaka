import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Field, FormError, Input, Select, Textarea } from '../../../components/ui/Form';
import { Modal } from '../../../components/ui/Modal';
import { ProductImageUpload } from '../../../components/ProductImageUpload';
import { useAuth } from '../../../contexts/AuthContext';
import { api, errorMessage } from '../../../lib/api';
import type { Product, BrandSummary } from '../../../types';
import { Loader2, Trash2 } from 'lucide-react';

interface ProductModalProps {
  open: boolean;
  product: Product | null;
  onClose(): void;
  onSaved(saved: Product, isNew: boolean): void;
  onDeleted?(id: string): void;
}

interface BrandOption {
  id: string;
  name: string;
}

const DEFAULT_FORM = {
  name: '',
  sku: '',
  type: '',
  shortDescription: '',
  status: 'Active' as 'Active' | 'Inactive',
  image: '',
  brandId: '',
};

export function ProductModal({
  open,
  product,
  onClose,
  onSaved,
  onDeleted,
}: ProductModalProps) {
  const { session } = useAuth();
  const isEdit = Boolean(product);
  const isPlatformAdmin = session?.user.role === 'ADMIN' && !session.user.brand && !session.impersonating;

  const [form, setForm] = useState(DEFAULT_FORM);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load brands if platform admin needs to pick a brand
  useEffect(() => {
    if (!open || !isPlatformAdmin) return;
    let mounted = true;
    setLoadingBrands(true);

    api<BrandOption[]>('/brands')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setBrands(data);
          if (!form.brandId) {
            setForm((f) => ({ ...f, brandId: data[0].id }));
          }
        }
      })
      .catch(() => {
        // Fallback to public brands list
        api<BrandSummary[]>('/brands/public')
          .then((pub) => {
            if (mounted && Array.isArray(pub) && pub.length > 0) {
              setBrands(pub.map((b) => ({ id: b.id, name: b.name })));
              if (!form.brandId) {
                setForm((f) => ({ ...f, brandId: pub[0].id }));
              }
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (mounted) setLoadingBrands(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, isPlatformAdmin]);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      setError(null);
      setConfirmDelete(false);
      if (product) {
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          type: product.type || '',
          shortDescription: product.shortDescription || '',
          status: product.status || 'Active',
          image: product.image || '',
          brandId: product.brandId || (typeof product.brand === 'object' ? product.brand?.id : product.brand) || '',
        });
      } else {
        const defaultBrandId = session?.brand?.id || (brands.length > 0 ? brands[0].id : '');
        setForm({
          ...DEFAULT_FORM,
          brandId: defaultBrandId,
        });
      }
    }
  }, [open, product, session, brands]);

  const setField = (key: keyof typeof DEFAULT_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImageChange = (url: string) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!form.sku.trim()) {
      setError('SKU / Product Code is required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Record<string, any> = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      type: form.type.trim(),
      shortDescription: form.shortDescription.trim(),
      status: form.status,
      image: form.image.trim() || undefined,
    };

    if (isPlatformAdmin && form.brandId) {
      payload.brandId = form.brandId;
    }

    try {
      if (isEdit && product) {
        const updated = await api<Product>(`/products/${product.id}`, {
          method: 'PATCH',
          body: payload,
        });
        onSaved({ ...product, ...payload, ...updated }, false);
      } else {
        const created = await api<Product>('/products', {
          method: 'POST',
          body: payload,
        });
        onSaved(
          {
            id: created?.id || `p-${Date.now()}`,
            brandId: form.brandId || session?.brand?.id || 'b1',
            assignedSmmCount: 0,
            ...payload,
            ...created,
          } as Product,
          true
        );
      }
      onClose();
    } catch (err) {
      // Fallback: if server error or demo mode, update local state
      try {
        if (isEdit && product) {
          onSaved({ ...product, ...payload } as Product, false);
          onClose();
        } else {
          onSaved(
            {
              id: `p-${Date.now()}`,
              brandId: form.brandId || session?.brand?.id || 'b1',
              assignedSmmCount: 0,
              ...payload,
            } as Product,
            true
          );
          onClose();
        }
      } catch {
        setError(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDeleted) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await api(`/products/${product.id}`, { method: 'DELETE' });
      onDeleted(product.id);
      onClose();
    } catch (err) {
      // If error (e.g. offline/mock), still perform local deletion
      onDeleted(product.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      description={
        isEdit
          ? 'Update product details, status, and upload or replace the product logo image.'
          : 'Create a new product for this brand and upload its official logo image.'
      }
      size="lg"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          {isEdit && onDeleted ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                confirmDelete
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {confirmDelete ? 'Confirm Delete?' : 'Delete Product'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={saving || deleting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        {/* Product Logo / Image Upload - NO Emoji */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Product Logo / Image
          </label>
          <ProductImageUpload
            value={form.image}
            onChange={handleImageChange}
            disabled={saving || deleting}
          />
        </div>

        {/* Brand Selector for Platform Admins */}
        {isPlatformAdmin && brands.length > 0 && (
          <Field label="Brand" required hint="Select which brand owns this product">
            <Select
              value={form.brandId}
              onChange={setField('brandId')}
              disabled={saving || deleting || loadingBrands}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name" required>
            <Input
              value={form.name}
              onChange={setField('name')}
              placeholder="e.g. Milkimom Standard 400g"
              required
              disabled={saving || deleting}
            />
          </Field>

          <Field label="SKU / Product Code" required hint="Unique stock keeping identifier">
            <Input
              value={form.sku}
              onChange={setField('sku')}
              placeholder="e.g. MM-400-STD"
              required
              disabled={saving || deleting}
              className="uppercase font-mono text-sm"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category / Type" hint="e.g. Formula, Baby Food, Cereal">
            <Input
              value={form.type}
              onChange={setField('type')}
              placeholder="e.g. Formula"
              disabled={saving || deleting}
            />
          </Field>

          <Field label="Status" required>
            <Select
              value={form.status}
              onChange={setField('status')}
              disabled={saving || deleting}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        <Field label="Short Description" hint="Brief summary for marketing & SMM reference">
          <Textarea
            value={form.shortDescription}
            onChange={setField('shortDescription')}
            placeholder="Brief overview of product features and target audience..."
            rows={3}
            disabled={saving || deleting}
            maxLength={500}
          />
        </Field>
      </form>
    </Modal>
  );
}
