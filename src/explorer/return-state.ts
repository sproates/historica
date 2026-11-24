/** Accept only this site's explorer route. Never turn saved browser state into an external redirect. */
export function safeReturnUrl(value:unknown,base='/'):string|null{
 if(typeof value!=='string'||!value.startsWith(base+'?'))return null;
 try{const url=new URL(value,'https://historica.invalid');if(url.origin!=='https://historica.invalid'||url.pathname!==base)return null;return url.pathname+url.search;}catch{return null;}
}
export function rememberExplorer(url:string){try{sessionStorage.setItem('historica-explorer-return',url);}catch{}}
