export type ThemePreference='system'|'light'|'dark';
export const themePreference=(value: unknown): ThemePreference=>value==='light'||value==='dark'?value:'system';
export const resolvedTheme=(preference: ThemePreference,darkSystem: boolean): 'light'|'dark'=>preference==='system'?(darkSystem?'dark':'light'):preference;
export function startTheme(root: Document, storage: Pick<Storage,'getItem'|'setItem'>, system: MediaQueryList): void {
 let preference: ThemePreference='system';
 try{preference=themePreference(storage.getItem('historica-theme'));}catch{}
 const controls=root.querySelectorAll<HTMLSelectElement>('[data-theme-picker]');
 const apply=()=>{root.documentElement.dataset['theme']=resolvedTheme(preference,system.matches);controls.forEach(control=>{control.value=preference;});};
 controls.forEach(control=>control.addEventListener('change',()=>{preference=themePreference(control.value);try{storage.setItem('historica-theme',preference);}catch{}apply();}));
 system.addEventListener('change',apply);apply();
}
if(typeof document!=='undefined'){
 // Access to localStorage itself can throw in restricted browser contexts.
 let storage: Pick<Storage,'getItem'|'setItem'>;
 try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
 startTheme(document,storage,window.matchMedia('(prefers-color-scheme: dark)'));
}
