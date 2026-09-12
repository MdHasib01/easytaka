import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { mockProducts, mockSMMs } from '../../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OverviewTab() {
  const stats = [
    { label: 'Total Products', value: mockProducts.length.toString() },
    { label: 'Assigned SMMs', value: mockSMMs.length.toString() },
    { label: 'Active IDs', value: '16' },
    { label: 'Pending Enrichment', value: '4' },
    { label: 'Quality Score', value: '94%' },
  ];

  const data = [
    { name: 'Mon', completed: 12, target: 15 },
    { name: 'Tue', completed: 15, target: 15 },
    { name: 'Wed', completed: 14, target: 15 },
    { name: 'Thu', completed: 18, target: 15 },
    { name: 'Fri', completed: 15, target: 15 },
    { name: 'Sat', completed: 10, target: 10 },
    { name: 'Sun', completed: 8, target: 10 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:border-indigo-500/30 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="md:col-span-2">
        <CardHeader className="border-b border-white/5">
          <CardTitle>Mission Completion (7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#818cf8'}}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="border-b border-white/5">
          <CardTitle>Needs Attention</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <div>
              <p className="text-sm font-medium text-amber-400">4 Enriched IDs Pending Review</p>
              <p className="text-xs text-amber-500/70 mt-0.5">Awaiting approval</p>
            </div>
            <Button size="sm" variant="secondary" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30">Review</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <div>
              <p className="text-sm font-medium text-rose-400">1 SMM Missing Targets</p>
              <p className="text-xs text-rose-500/70 mt-0.5">Rafi Islam</p>
            </div>
            <Button size="sm" variant="secondary" className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30">View</Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
             <h4 className="text-sm font-medium text-slate-400 mb-4">Weekly Payroll Estimate</h4>
             <div className="text-3xl font-bold text-emerald-400 font-mono">৳12,450</div>
             <p className="text-xs text-slate-500 mt-2">Based on current approved ID tiers and completed rapid tasks.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
