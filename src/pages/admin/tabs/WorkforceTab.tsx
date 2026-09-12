import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';
import { mockSMMs, mockProducts } from '../../../data/mockData';

export function WorkforceTab() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-white">Workforce Directory</h2>
        <div className="flex items-center gap-2">
           <Button variant="outline">Division Filter</Button>
           <Button variant="outline">Performance Filter</Button>
        </div>
      </div>
      
      {/* Division Logic Notice */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-4">
         <div className="mt-0.5">
           <ShieldCheck className="w-5 h-5 text-indigo-400" />
         </div>
         <div>
            <h4 className="text-sm font-semibold text-indigo-300">Division Assignment Policy Active</h4>
            <p className="text-xs text-indigo-200/70 mt-1">SMMs must be assigned to work in a division different from their NID division. The system automatically flags cross-division violations.</p>
         </div>
      </div>
      
      <Card className="overflow-hidden border-white/5 bg-slate-900/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">SMM Profile</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Division Constraint</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Products ({mockSMMs[0].assignedProductIds.length}/4)</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Hub Progress</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Quality & Level</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockSMMs.map(smm => {
                 const isDivisionValid = smm.nidDivision !== smm.assignedWorkingDivision;
                 
                 return (
                <tr key={smm.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-white/10 shadow-inner">
                        {smm.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{smm.name}</div>
                        <div className="text-xs text-slate-500">{smm.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-500 w-8">NID:</span>
                         <Badge variant="secondary" className="text-[10px]">{smm.nidDivision}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-500 w-8">Work:</span>
                         <Badge variant={isDivisionValid ? 'success' : 'error'} className="text-[10px]">{smm.assignedWorkingDivision}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                      {smm.assignedProductIds.map(id => (
                        <Badge key={id} variant="outline" className="text-[10px] bg-slate-800">{mockProducts.find(p=>p.id===id)?.name.split(' ')[1]}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{smm.approvedEnrichedIds} / {smm.managedIds} IDs</span>
                        <span className="font-bold text-emerald-400">{Math.round((smm.approvedEnrichedIds/smm.managedIds)*100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{width: `${(smm.approvedEnrichedIds/smm.managedIds)*100}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-400">Score:</span>
                         <span className="text-sm font-bold text-emerald-400">{smm.qualityScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-400">Level:</span>
                         <Badge variant="default" className="text-[10px] bg-indigo-500/20">{smm.level}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="secondary" className="bg-slate-800 hover:bg-slate-700">Open Profile</Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
