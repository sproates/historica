import {safeReturnUrl} from '../explorer/return-state.js';
const link=document.querySelector<HTMLAnchorElement>('[data-explorer-return]');
if(link){
 const base=new URL(document.baseURI).pathname;
 try{const saved=safeReturnUrl(sessionStorage.getItem('historica-explorer-return'),base);if(saved){link.href=saved;if(new URL(saved,location.origin).searchParams.get('view')==='browse')link.textContent='← Back to Browse';}}catch{}
}
