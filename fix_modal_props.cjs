const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

code = code.replace(
  `onSubmitStage={(stageId) => submitStage(selectedAccount.id, stageId)}`,
  `onSubmitStage={(stageId, proofData) => submitStage(selectedAccount.id, stageId, proofData)}`
);

code = code.replace(
  `function AccountWorkspaceModal({ account, onClose, onSubmitStage }: { account: SocialAccount, onClose: () => void, onSubmitStage: (stageId: string) => void }) {`,
  `function AccountWorkspaceModal({ account, onClose, onSubmitStage }: { account: SocialAccount, onClose: () => void, onSubmitStage: (stageId: string, proofData?: any) => void }) {`
);

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
