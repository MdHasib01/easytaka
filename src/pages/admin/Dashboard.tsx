import React from 'react';
import { useParams } from 'react-router-dom';
import { mockBrands } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import type { Brand } from '../../types';
import { Package, Users, ShieldCheck, AlertCircle, Settings } from 'lucide-react';
import AdminBrands from './Brands';
import AdminManageUsers from './ManageUsers';
import { OverviewTab } from './tabs/OverviewTab';
import { BrandDetailsTab } from './tabs/BrandDetailsTab';
import { ProductsTab } from './tabs/ProductsTab';
import { WorkforceTab } from './tabs/WorkforceTab';
import { MissionsTab } from './tabs/MissionsTab';
import { RapidTasksTab } from './tabs/RapidTasksTab';
import { ReviewCenterTab } from './tabs/ReviewCenterTab';

export type WorkspaceScope = 'brand' | 'platform';

export default function BrandDashboard({ scope = 'brand' }: { scope?: WorkspaceScope }) {
  const isPlatform = scope === 'platform';
  const { tab } = useParams();
  const currentTab = tab || 'overview';
  const { session } = useAuth();

  // Brand identity from session or default mock
  const brand: Brand = session?.brand
    ? {
        ...mockBrands[0],
        id: session.brand.id,
        name: session.brand.name,
        logo: session.brand.logo,
        status: session.brand.status,
        industry: session.brand.industry || mockBrands[0].industry,
        primaryPlatform: session.brand.primaryPlatform || mockBrands[0].primaryPlatform,
      }
    : mockBrands[0];

  return (
    <div className="space-y-6">
      {/* Brand workspace summary badges */}
      {!isPlatform && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-900/40 border border-white/5 rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Package className="w-3.5 h-3.5 text-indigo-400" /> 12 Products
          </span>
          <span className="text-white/10 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> 10 SMM
          </span>
          <span className="text-white/10 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 320 Managed IDs
          </span>
          <span className="text-white/10 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-medium text-amber-400/90">
            <AlertCircle className="w-3.5 h-3.5" /> 8 Pending Reviews
          </span>
        </div>
      )}

      {/* Active Tab Content */}
      <div className="w-full">
        {currentTab === 'overview' && <OverviewTab />}
        {!isPlatform && currentTab === 'details' && <BrandDetailsTab brand={brand} />}
        {isPlatform && currentTab === 'brands' && <AdminBrands />}
        {isPlatform && currentTab === 'users' && <AdminManageUsers />}
        {currentTab === 'products' && <ProductsTab />}
        {currentTab === 'workforce' && <WorkforceTab />}
        {currentTab === 'missions' && <MissionsTab />}
        {currentTab === 'rapid-tasks' && <RapidTasksTab />}
        {currentTab === 'review' && <ReviewCenterTab />}

        {/* Stubs for future flows */}
        {['reviewers', 'gamification', 'reports', 'messages'].includes(currentTab) && (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-white/10 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 mx-auto mb-4">
              <Settings className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-200 capitalize mb-2">
              {currentTab.replace('-', ' ')} Module
            </h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Deep logic implementation pending next sequence instruction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
