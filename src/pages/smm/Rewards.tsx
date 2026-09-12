import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Star, Gift, Wifi, Coffee } from 'lucide-react';
import { mockSMMs } from '../../data/mockData';

export default function SMMRewards() {
  const smm = mockSMMs[0];

  const items = [
    { id: 1, title: '1GB Mobile Data', cost: 500, icon: Wifi, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 2, title: '৳100 Bonus Voucher', cost: 800, icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 3, title: 'Streak Shield', cost: 1500, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 4, title: 'Coffee Shop Gift Card', cost: 2500, icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-amber-600/90 to-orange-600/90 p-8 rounded-3xl text-white shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)] border border-amber-400/30 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Reward Store</h1>
          <p className="text-amber-100 mt-2 font-medium">Redeem your hard-earned XP for real perks.</p>
        </div>
        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 relative z-10 shadow-inner">
          <Star className="w-10 h-10 text-amber-300 fill-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
          <div>
            <p className="text-xs font-bold text-amber-200/80 uppercase tracking-widest mb-1">Available XP</p>
            <p className="text-3xl font-bold drop-shadow-sm">{smm.redeemableXp}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map(item => {
          const canAfford = smm.redeemableXp >= item.cost;
          return (
            <Card key={item.id} className="bg-slate-900/60 flex flex-col justify-between hover:border-white/20 transition-all group">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${item.bg} ${item.color} border ${item.border} shadow-inner`}>
                  <item.icon className="w-7 h-7 drop-shadow-md" />
                </div>
                <h3 className="font-semibold text-white text-lg leading-tight">{item.title}</h3>
                
                <div className="mt-auto pt-8 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <Star className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" /> {item.cost}
                  </div>
                  <Button 
                    size="sm" 
                    variant={canAfford ? 'default' : 'secondary'}
                    className={canAfford ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] border-none font-bold' : ''}
                    disabled={!canAfford}
                  >
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
