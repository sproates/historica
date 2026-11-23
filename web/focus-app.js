import {startExplorer} from './generated/browser/explorer.js';
import prototypeData from './generated/content/prototype-data.js';
import {siteBase} from './site-path.js';

await startExplorer(siteBase,prototypeData);
