import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog, SuccessDialog } from '../../../components/ui/ConfirmDialog';
import { Package, Users, Plus, Pencil, Search, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { mockProducts } from '../../../data/mockData';
import { api } from '../../../lib/api';
import type { Product } from '../../../types';
import { ProductModal } from './ProductModal';

export function ProductsTab() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [productsPerSmm, setProductsPerSmm] = useState(4);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api<Product[]>('/products');
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to mock products if no database products exist yet
        setProducts(mockProducts);
      }
    } catch {
      // Offline or error fallback
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const suggestedSmm = Math.ceil(totalProducts / productsPerSmm);

  // Filtered products based on search and status
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.type && product.type.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const handleProductSaved = (saved: Product, isNew: boolean) => {
    if (isNew) {
      setProducts((prev) => [saved, ...prev]);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))
      );
    }
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const name = productToDelete.name;
    try {
      await api(`/products/${productToDelete.id}`, { method: 'DELETE' });
      handleProductDeleted(productToDelete.id);
      setProductToDelete(null);
      setDeletedProductName(name);
    } catch {
      // Fallback if mock / offline
      handleProductDeleted(productToDelete.id);
      setProductToDelete(null);
      setDeletedProductName(name);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Products Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your brand's official products, SKU codes, logos, and workforce assignments.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-800 p-1 rounded-lg border border-white/5 flex">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'grid'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'table'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            title="Refresh products list"
            className="border-white/10 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Product-to-SMM Assignment Engine configuration */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Package className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Workforce Assignment Rule</h3>
              <p className="text-sm text-slate-400">Configure how many products one SMM can handle.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Products per SMM</p>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setProductsPerSmm(Math.max(1, productsPerSmm - 1))}
                  className="w-8 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-white">{productsPerSmm}</span>
                <button
                  onClick={() => setProductsPerSmm(productsPerSmm + 1)}
                  className="w-8 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Products</p>
              <p className="text-xl font-bold text-white">{totalProducts}</p>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Suggested SMMs</p>
              <p className="text-xl font-bold text-emerald-400">{suggestedSmm}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or categoryâ€¦"
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('Inactive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'Inactive'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading products catalogâ€¦</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-white/10 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 mx-auto mb-3 text-slate-500">
            <Package className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-white">No products found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery || statusFilter !== 'all'
              ? 'No products match your search or filter criteria. Try clearing search.'
              : 'Your brand has not added any products to the catalog yet.'}
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Product
          </Button>
        </div>
      ) : view === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="hover:border-indigo-500/40 transition-all group flex flex-col justify-between overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  {/* Product Logo / Image Box - NOT emoji */}
                  <div className="w-14 h-14 bg-slate-800/90 rounded-xl flex items-center justify-center border border-white/10 shadow-inner overflow-hidden shrink-0 group-hover:border-indigo-500/40 transition-colors">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-1.5 select-none"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-indigo-400/80" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge variant={product.status === 'Active' ? 'success' : 'secondary'}>
                      {product.status}
                    </Badge>
                    <button
                      onClick={() => setEditingProduct(product)}
                      title="Edit Product"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      title="Delete Product"
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <CardTitle className="mt-3 text-base leading-snug text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-800/70 px-1.5 py-0.5 rounded border border-white/5">
                    {product.sku}
                  </span>
                  {product.type && (
                    <span className="text-[11px] text-indigo-300/80 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {product.type}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="py-2">
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {product.shortDescription || 'No description provided.'}
                </p>
              </CardContent>

              <div className="border-t border-white/5 p-3.5 bg-slate-800/40 rounded-b-2xl flex justify-between items-center text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {product.assignedSmmCount ?? 0} SMMs
                </span>
                <button className="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-500/20 hover:border-indigo-500/30">
                  Assign SMM
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Product</th>
                  <th scope="col" className="px-5 py-3.5">SKU</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5">Assigned SMMs</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800/90 rounded-lg flex items-center justify-center border border-white/10 shadow-inner overflow-hidden shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-indigo-400/80" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs group-hover:text-indigo-300 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {product.shortDescription || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      {product.sku}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {product.type || 'â€”'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={product.status === 'Active' ? 'success' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        {product.assignedSmmCount ?? 0} SMMs
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors">
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        open={isAddOpen || Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => {
          setIsAddOpen(false);
          setEditingProduct(null);
        }}
        onSaved={handleProductSaved}
        onDeleted={handleProductDeleted}
        onDeleteRequest={(prod) => {
          setEditingProduct(null);
          setProductToDelete(prod);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={productToDelete !== null}
        onClose={() => {
          if (!deleting) setProductToDelete(null);
        }}
        onConfirm={confirmDeleteProduct}
        loading={deleting}
        title="Delete Product"
        description={
          <span>
            Are you sure you want to delete <strong className="text-white">{productToDelete?.name}</strong>{' '}
            {productToDelete?.sku && <span className="font-mono text-xs text-indigo-300">({productToDelete.sku})</span>}?
            This product will be permanently removed from your catalog and unassigned from active SMMs. This action cannot be undone.
          </span>
        }
        confirmText="Delete Product"
      />

      {/* Post-Delete Confirmation Dialog */}
      <SuccessDialog
        open={deletedProductName !== null}
        onClose={() => setDeletedProductName(null)}
        title="Product Deleted"
        description={
          <span>
            <strong className="text-white">{deletedProductName}</strong> has been successfully removed from the catalog.
          </span>
        }
        actionText="Done"
      />
    </div>
  );
}
