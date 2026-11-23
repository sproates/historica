export type ThemePreference='system'|'light'|'dark';
export const themePreference=(value: unknown): ThemePreference=>value==='light'||value==='dark'?value:'system';
export const resolvedTheme=(preference: ThemePreference,darkSystem: boolean): 'light'|'dark'=>preference==='system'?(darkSystem?'dark':'light'):preference;
export function startTheme(root: Document, storage: Pick<Storage,'getItem'|'setItem'>, system: MediaQueryList): void {
 let preference: ThemePreference='system';
 try{preference=themePreference(storage.getItem('historica-theme'));}catch{}
 const controls=root.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
 const apply=()=>{const theme=resolvedTheme(preference,system.matches);root.documentElement.dataset['theme']=theme;controls.forEach(control=>{control.setAttribute('aria-pressed',String(theme==='dark'));control.title=theme==='dark'?'Switch to light mode':'Switch to dark mode';});};
 controls.forEach(control=>control.addEventListener('click',()=>{preference=resolvedTheme(preference,system.matches)==='dark'?'light':'dark';try{storage.setItem('historica-theme',preference);}catch{}apply();}));
 system.addEventListener('change',apply);apply();
}
if(typeof document!=='undefined'){
 // Access to localStorage itself can throw in restricted browser contexts.
 let storage: Pick<Storage,'getItem'|'setItem'>;
 try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
 startTheme(document,storage,window.matchMedia('(prefers-color-scheme: dark)'));
}
