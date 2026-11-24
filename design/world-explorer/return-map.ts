// Local preview enhancement only; production history pages are untouched.
const header=document.querySelector('body[data-static-history] header');
if(header&&!document.getElementById('explorer-return')){
 const link=document.createElement('a');link.id='explorer-return';link.textContent='← Back to the map';link.href='/';
 try{const saved=sessionStorage.getItem('historica-explorer-return');if(saved?.startsWith('/?')){link.href=saved;if(new URL(saved,location.origin).searchParams.get('view')==='browse')link.textContent='← Back to Browse';}}catch{}
 link.style.cssText='font-size:14px;white-space:nowrap;color:var(--accent,#315bd6);padding:8px 0';
 header.append(link);
}
