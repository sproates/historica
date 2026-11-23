import fs from 'node:fs';
const countries: {features:Array<{properties:{ADM0_A3:string};geometry:unknown}>}=JSON.parse(fs.readFileSync('web/data/ne_50m_admin_0_countries.json','utf8'));
const regions=countries.features.filter(f=>['GBR','IRL','IMN'].includes(f.properties.ADM0_A3)).map(f=>f.geometry);
if(regions.length!==3)throw new Error('Missing Britain and Ireland map geography');
fs.writeFileSync('web/data/map-regions.json',JSON.stringify(regions)+'\n');
