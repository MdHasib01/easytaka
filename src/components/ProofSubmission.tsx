import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { CheckCircle2, Upload, Link as LinkIcon, FileText, AlertTriangle } from 'lucide-react';
import { EnrichmentStage } from '../types';

interface ProofSubmissionProps {
  stage: EnrichmentStage;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProofSubmission({ stage, onSubmit, onCancel }: ProofSubmissionProps) {
  const [checklist, setChecklist] = useState(stage.checklist.map(c => ({...c, checked: false})));
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  
  const allChecked = checklist.length === 0 || checklist.every(c => c.checked);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleSubmit = () => {
    onSubmit({
      checklistConfirmed: true,
      profileUrl: url,
      notes: notes,
      status: 'Submitted',
      date: new Date().toLocaleDateString() + ', ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-white/10 p-5 space-y-6">
       <div>
          <h4 className="text-lg font-bold text-white mb-2">Submit Proof for {stage.name}</h4>
          <p className="text-sm text-slate-400">Complete the checklist and provide any required links or notes for the reviewer.</p>
       </div>
       
       {checklist.length > 0 && (
         <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 space-y-3">
            <h5 className="text-sm font-medium text-slate-300 mb-2">Verification Checklist</h5>
            {checklist.map(item => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                 <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'}`}>
                    {item.checked && <CheckCircle2 className="w-4 h-4" />}
                 </div>
                 <span className={`text-sm ${item.checked ? 'text-slate-200' : 'text-slate-400'}`}>{item.label}</span>
              </label>
            ))}
            
            {!allChecked && (
              <div className="flex items-center gap-2 text-xs text-amber-400 mt-4 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You must confirm all checklist items before submitting.</span>
              </div>
            )}
         </div>
       )}
       
       <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-500" /> Reference URL (Optional)
             </label>
             <input 
               type="url" 
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               placeholder="https://facebook.com/profile..."
               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
             />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Reviewer Notes (Optional)
             </label>
             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Add any context for the reviewer..."
               rows={3}
               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
             ></textarea>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-dashed border-slate-600 flex flex-col items-center justify-center text-center">
             <Upload className="w-6 h-6 text-slate-500 mb-2" />
             <p className="text-sm font-medium text-slate-300">Upload Screenshots (Optional)</p>
             <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse</p>
             <Button variant="outline" size="sm" className="mt-3 bg-slate-900">Select Files</Button>
          </div>
       </div>
       
       <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="secondary" onClick={onCancel} className="bg-slate-800 hover:bg-slate-700">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!allChecked}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Proof
          </Button>
       </div>
    </div>
  );
}
