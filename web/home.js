import {startHome} from './generated/browser/home.js';
import prototypeData from './generated/content/prototype-data.js';
import {siteBase} from './site-path.js';

await startHome(siteBase,prototypeData);
