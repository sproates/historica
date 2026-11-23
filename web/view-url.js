import {siteBase} from './site-path.js';
import {encodeView as encode,decodeView as decode} from './generated/state/view-url.js';
export {bookmarkPanels} from './generated/state/view-url.js';
// Keep mount detection beside the browser assets, rather than under generated/state/.
export const encodeView=(state,view,data,base=siteBase)=>encode(state,view,data,base);
export const decodeView=(address,data,base=siteBase)=>decode(address,data,base);
