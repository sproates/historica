/** URL inputs are optional. Invalid dates must not produce year zero or reversed windows. */
export function explorerPeriod(params:URLSearchParams):{from:number;to:number}{
 const read=(key:string,fallback:number)=>{const value=Number(params.get(key));return params.has(key)&&Number.isInteger(value)&&value!==0?Math.max(-5500,Math.min(200,value)):fallback;};
 const from=read('from',-5500),to=read('to',200);
 return from<=to?{from,to}:{from:to,to:from};
}
export interface Country {properties:{NAME:string;ADM0_A3:string;LABEL_X:number;LABEL_Y:number};geometry:{type:string;coordinates:number[][][]|number[][][][]}}
function inside(p:number[],ring:number[][]){let value=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i]!,b=ring[j]!;if((a[1]!>p[1]!)!==(b[1]!>p[1]!)&&p[0]!<(b[0]!-a[0]!)*(p[1]!-a[1]!)/(b[1]!-a[1]!)+a[0]!)value=!value;}return value;}
/** Frame the main component, retaining longitude continuity across the dateline. */
export function mainCountryRing(country:Country):[number,number][]{
 const {LABEL_X:lon,LABEL_Y:lat}=country.properties;
 const unwrap=(p:number[]):[number,number]=>[lon+((p[0]!-lon+540)%360)-180,p[1]!];
 const polygons=(country.geometry.type==='Polygon'?[country.geometry.coordinates]:country.geometry.coordinates) as number[][][][];
 const rings=polygons.map(p=>p[0]!.map(unwrap));
 return rings.find(ring=>inside([lon,lat],ring))||rings[0]||[];
}

export interface CountrySearch {name:string;code:string;bounds:[number,number,number,number]}
