import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Package, Users, Plus } from 'lucide-react';
import { mockProducts } from '../../../data/mockData';

export function ProductsTab() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [productsPerSmm, setProductsPerSmm] = useState(4);
  const totalProducts = mockProducts.length;
  const suggestedSmm = Math.ceil(totalProducts / productsPerSmm);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-white">Products Catalog</h2>
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg border border-white/5 flex">
             <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Grid</button>
             <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Table</button>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </div>
      </div>

      {/* Product-to-SMM Assignment Engine configuration */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20">
         <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Package className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                  <h3 className="font-semibold text-white">Workforce Assignment Rule</h3>
                  <p className="text-sm text-slate-400">Configure how many products one SMM can handle.</p>
               </div>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Products per SMM</p>
                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-white/10">
                     <button onClick={() => setProductsPerSmm(Math.max(1, productsPerSmm - 1))} className="w-8 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center">-</button>
                     <span className="w-8 text-center font-bold text-white">{productsPerSmm}</span>
                     <button onClick={() => setProductsPerSmm(productsPerSmm + 1)} className="w-8 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center">+</button>
                  </div>
               </div>
               
               <div className="h-10 w-px bg-white/10"></div>
               
               <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Products</p>
                  <p className="text-xl font-bold text-white">{totalProducts}</p>
               </div>
               
               <div className="h-10 w-px bg-white/10"></div>
               
               <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Suggested SMMs</p>
                  <p className="text-xl font-bold text-emerald-400">{suggestedSmm}</p>
               </div>
            </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockProducts.map(product => (
          <Card key={product.id} className="hover:border-indigo-500/40 transition-colors group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-white/5 shadow-inner">
                  📦
                </div>
                <Badge variant={product.status === 'Active' ? 'success' : 'secondary'}>{product.status}</Badge>
              </div>
              <CardTitle className="mt-4 text-base">{product.name}</CardTitle>
              <p className="text-xs text-slate-400 font-mono mt-1">{product.sku}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 line-clamp-2">{product.shortDescription}</p>
            </CardContent>
            <div className="border-t border-white/5 p-4 bg-slate-800/30 rounded-b-2xl flex justify-between items-center text-sm text-slate-400">
               <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" /> {product.assignedSmmCount} SMMs</span>
               <button className="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors">Assign SMM</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
