import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

// Recreate this owned output directory so renamed/deleted sources leave no stale modules.
fs.rmSync('web/generated',{recursive:true,force:true});
const result=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.json'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
