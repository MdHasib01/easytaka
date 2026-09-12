const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

const badStr = `{(activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' || activeStage.status === 'Revision Required') && (

                       {(() => {`;
const goodStr = `{(activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' || activeStage.status === 'Revision Required') && (() => {`;
code = code.replace(badStr, goodStr);

// I also need to close it correctly since the replacement string ended with })()}
const endBadStr = `                            </Button>
                          );
                       })()}
                       )}
                    </div>`;
                    
const endGoodStr = `                            </Button>
                          );
                       })()}
                    </div>`;
                    
code = code.replace(endBadStr, endGoodStr);

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
