const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

const buttonStartStr = `{(activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' || activeStage.status === 'Revision Required') && (`;
const buttonEndStr = `                         </Button>
                       )}`;
                       
const buttonOld = `                         <Button onClick={() => setShowProofForm(true)} className="bg-indigo-600 hover:bg-indigo-500 px-8 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                           {activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review'}
                         </Button>`;

const buttonNew = `
                       {(() => {
                          let isDisabled = false;
                          let disableReason = '';
                          if (activeStage.id === 'stg4' && (account.persona?.completeness || 0) < 100) {
                             isDisabled = true;
                             disableReason = 'Persona Incomplete';
                          }
                          if (activeStage.id === 'stg5' && (account.contentEntries?.length || 0) < 10) {
                             isDisabled = true;
                             disableReason = 'More Content Required';
                          }
                          if (activeStage.id === 'stg7' && (account.notes?.length || 0) < 5) {
                             isDisabled = true;
                             disableReason = 'More Notes Required';
                          }
                          
                          return (
                            <Button 
                              onClick={() => setShowProofForm(true)} 
                              disabled={isDisabled}
                              className={\`\${isDisabled ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'} px-8\`}
                            >
                              {isDisabled ? disableReason : (activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review')}
                            </Button>
                          );
                       })()}
`;

code = code.replace(buttonOld, buttonNew);
fs.writeFileSync('src/pages/smm/Hub.tsx', code);
