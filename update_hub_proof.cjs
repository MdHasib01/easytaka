const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

// Add import
const importProof = `import { ProofSubmission } from '../../components/ProofSubmission';\n`;
if (!code.includes('import { ProofSubmission }')) {
  const lastImport = code.lastIndexOf('import ');
  const nextLine = code.indexOf('\n', lastImport);
  code = code.substring(0, nextLine + 1) + importProof + code.substring(nextLine + 1);
}

// In EnrichmentTab, we need state for proof submission
code = code.replace(
  `function EnrichmentTab({ account, onSubmitStage }: { account: SocialAccount, onSubmitStage: (stageId: string) => void }) {
  const [selectedStage, setSelectedStage] = useState<string>(account.stages[0]?.id || '');`,
  `function EnrichmentTab({ account, onSubmitStage }: { account: SocialAccount, onSubmitStage: (stageId: string, proofData?: any) => void }) {
  const [selectedStage, setSelectedStage] = useState<string>(account.stages[0]?.id || '');
  const [showProofForm, setShowProofForm] = useState(false);`
);

// We need to modify when Submit is clicked, it shows the form, unless it's already shown
const submitButtonStr = `<Button onClick={() => onSubmitStage(activeStage.id)} className="bg-indigo-600 hover:bg-indigo-500 px-8 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                           {activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review'}
                         </Button>`;

const submitButtonReplacement = `<Button onClick={() => setShowProofForm(true)} className="bg-indigo-600 hover:bg-indigo-500 px-8 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                           {activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review'}
                         </Button>`;

code = code.replace(submitButtonStr, submitButtonReplacement);

// Render the proof form above the checklist if showProofForm is true
const requirementsStr = `<h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Requirements</h4>`;
const newRequirementsStr = `
                    {showProofForm ? (
                      <div className="mb-6">
                        <ProofSubmission 
                          stage={activeStage} 
                          onCancel={() => setShowProofForm(false)}
                          onSubmit={(data) => {
                            setShowProofForm(false);
                            onSubmitStage(activeStage.id, data);
                          }} 
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Requirements</h4>
`;

code = code.replace(requirementsStr, newRequirementsStr);

// Close the fragment after the submit button
const buttonDivCloseStr = `</div>
                 </div>
              </div>
            )}
         </div>`;

const newButtonDivCloseStr = `</div>
                      </>
                    )}
                 </div>
              </div>
            )}
         </div>`;

code = code.replace(buttonDivCloseStr, newButtonDivCloseStr);

// Also we need to make sure we reset showProofForm when selectedStage changes
code = code.replace(
  `onClick={() => setSelectedStage(stage.id)}`,
  `onClick={() => { setSelectedStage(stage.id); setShowProofForm(false); }}`
);

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
