import React, { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Field, FormError, Input, Select } from '../../../components/ui/Form';
import { BrandLogoUpload } from '../../../components/BrandLogoUpload';
import { useAuth } from '../../../contexts/AuthContext';
import { api, errorMessage } from '../../../lib/api';
import { PLATFORMS } from '../../../lib/constants';
import {
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Percent,
  Coins,
  ClipboardList,
  Building2,
  Loader2,
  Save,
} from 'lucide-react';

export function BrandDetailsTab({ brand }: { brand: any }) {
  const { refresh } = useAuth();
  // Brand Profile State
  const [profileForm, setProfileForm] = useState({
    name: brand?.name || '',
    logo: brand?.logo || '🏷️',
    industry: brand?.industry || '',
    primaryPlatform: brand?.primaryPlatform || 'Facebook',
    status: (brand?.status || 'Active') as 'Active' | 'Inactive',
    emailGuideline: brand?.emailGuideline || '',
  });
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch brand data if brand has an id
  useEffect(() => {
    if (brand?.id) {
      setLoadingBrand(true);
      api<any>(`/brands/${brand.id}`)
        .then((b) => {
          if (b) {
            setProfileForm({
              name: b.name || '',
              logo: b.logo || '🏷️',
              industry: b.industry || '',
              primaryPlatform: b.primaryPlatform || 'Facebook',
              status: b.status || 'Active',
              emailGuideline: b.emailGuideline || '',
            });
          }
        })
        .catch(() => {
          // If fetch fails, retain initial prop values
        })
        .finally(() => setLoadingBrand(false));
    }
  }, [brand?.id]);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!brand?.id) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);

    try {
      await api(`/brands/${brand.id}`, {
        method: 'PATCH',
        body: profileForm,
      });
      await refresh();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  // Enrichment Rules State
  const [isEditing, setIsEditing] = useState(false);
  const [stages, setStages] = useState([
    { id: 'stg1', name: 'Account Setup & Security', weight: 10, required: true, xpReward: 50, active: true },
    { id: 'stg2', name: 'Profile Identity Complete', weight: 15, required: true, xpReward: 100, active: true },
    { id: 'stg3', name: 'Profile Information Complete', weight: 15, required: true, xpReward: 100, active: true },
    { id: 'stg4', name: 'Persona Setup Complete', weight: 15, required: true, xpReward: 150, active: true },
    { id: 'stg5', name: 'Content Foundation', weight: 15, required: true, xpReward: 200, active: true },
    { id: 'stg6', name: 'Account Activity / Readiness', weight: 10, required: true, xpReward: 100, active: true },
    { id: 'stg7', name: 'Persona Notes & Consistency', weight: 10, required: true, xpReward: 100, active: true },
    { id: 'stg8', name: 'Final Eligibility Review', weight: 10, required: true, xpReward: 250, active: true },
  ]);

  const totalWeight = stages.reduce((sum, stage) => sum + (stage.active ? stage.weight : 0), 0);
  const isValid = totalWeight === 100;

  return (
    <div className="space-y-6 max-w-4xl p-4 md:p-6 mx-auto">
      {/* Brand Profile Information */}
      <Card className="border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
        <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-indigo-400 flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Brand Profile
          </CardTitle>
          {profileSaved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-6">

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Brand Logo & Icon</span>
              <BrandLogoUpload
                value={profileForm.logo}
                onChange={(logo) => setProfileForm((f) => ({ ...f, logo }))}
                disabled={savingProfile || loadingBrand}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Brand Name" required className="sm:col-span-2">
                <Input
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={120}
                  disabled={savingProfile || loadingBrand}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={profileForm.status}
                  onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))}
                  disabled={savingProfile || loadingBrand}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Industry">
                <Input
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm((f) => ({ ...f, industry: e.target.value }))}
                  placeholder="e.g. FMCG / Baby Care"
                  maxLength={120}
                  disabled={savingProfile || loadingBrand}
                />
              </Field>
              <Field label="Primary Platform">
                <Select
                  value={profileForm.primaryPlatform}
                  onChange={(e) => setProfileForm((f) => ({ ...f, primaryPlatform: e.target.value }))}
                  disabled={savingProfile || loadingBrand}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="Email Guideline"
              hint="Format shown to SMMs when creating social accounts for this brand"
            >
              <Input
                value={profileForm.emailGuideline}
                onChange={(e) => setProfileForm((f) => ({ ...f, emailGuideline: e.target.value }))}
                placeholder="firstname.brand.number@gmail.com"
                maxLength={200}
                disabled={savingProfile || loadingBrand}
              />
            </Field>

            <FormError message={profileError} />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingProfile || loadingBrand}>
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Brand Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-xl font-bold text-white">Configuration Rules</h2>
        <Button variant={isEditing ? 'default' : 'outline'} onClick={() => setIsEditing(!isEditing)} disabled={isEditing && !isValid}>
          {isEditing ? 'Save Changes' : 'Edit Rules'}
        </Button>
      </div>

        
        <Card className="border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
           <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-indigo-400 flex items-center gap-2"><Layers className="w-5 h-5"/> Enrichment Configuration</CardTitle>
              <div className="flex items-center gap-3">
                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                    <span className="text-xs font-bold tracking-wide uppercase">Total Weight</span>
                    <span className="text-sm font-bold">{totalWeight} / 100</span>
                    {isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                 </div>
              </div>
           </CardHeader>
           <CardContent className="pt-6 space-y-4">
              {!isValid && (
                 <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-2 text-rose-400 text-sm mb-4">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Enrichment stage weights must total 100%.
                 </div>
              )}
              
              <div className="space-y-4">
                 {stages.map((stage, idx) => (
                    <div key={stage.id} className={`p-4 rounded-xl border transition-all ${!stage.active ? 'bg-slate-900/30 border-white/5 opacity-60' : 'bg-slate-900 border-white/10'}`}>
                       <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div className="flex-1 space-y-3 w-full">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                                <input 
                                  type="text" 
                                  value={stage.name} 
                                  disabled={!isEditing} 
                                  onChange={(e) => {
                                    const newStages = [...stages];
                                    newStages[idx].name = e.target.value;
                                    setStages(newStages);
                                  }}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-70 focus:outline-none focus:border-indigo-500"
                                />
                                <Badge variant={stage.required ? 'default' : 'secondary'} className={stage.required ? 'bg-indigo-500/20 text-indigo-300' : ''}>
                                  {stage.required ? 'Required' : 'Optional'}
                                </Badge>
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-4 ml-7">
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs text-slate-400 w-12">Weight</span>
                                  <input 
                                    type="number" 
                                    value={stage.weight} 
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      const newStages = [...stages];
                                      newStages[idx].weight = parseInt(e.target.value) || 0;
                                      setStages(newStages);
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-white disabled:opacity-70"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs text-slate-400 w-16">XP Reward</span>
                                  <input 
                                    type="number" 
                                    value={stage.xpReward} 
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      const newStages = [...stages];
                                      newStages[idx].xpReward = parseInt(e.target.value) || 0;
                                      setStages(newStages);
                                    }}
                                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-white disabled:opacity-70"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4 text-slate-500" />
                                  <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-800" disabled={!isEditing}>Edit Checklist</Button>
                                </div>
                             </div>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-2 self-end md:self-center ml-7 md:ml-0">
                               <button 
                                 onClick={() => {
                                    const newStages = [...stages];
                                    newStages[idx].active = !newStages[idx].active;
                                    setStages(newStages);
                                 }}
                                 className={`text-xs px-2 py-1 rounded ${stage.active ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                               >
                                 {stage.active ? 'Disable' : 'Enable'}
                               </button>
                               <button className="p-1 text-slate-500 hover:text-rose-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                 ))}
                 
                 {isEditing && (
                    <Button variant="outline" className="w-full border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 bg-slate-900/50">
                       <Plus className="w-4 h-4 mr-2" /> Add New Stage
                    </Button>
                 )}
              </div>
           </CardContent>
        </Card>

     </div>
  )
}
