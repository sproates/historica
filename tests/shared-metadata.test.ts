import test from 'node:test';
import assert from 'node:assert/strict';
import {metadataHead,description} from '../web/generated/presentation/metadata.js';

test('shared metadata supplies canonical search and social fields with explicit staging indexing',()=>{
 const html=metadataHead('Socrates · Historica','A life in Athens.','/person/socrates',{noindex:true});
 assert.match(html,/rel="canonical" href="https:\/\/historica.online\/person\/socrates"/);
 assert.match(html,/name="robots" content="noindex, follow"/);
 for(const field of ['og:title','og:description','og:url','og:image','og:image:width','og:image:height','og:image:alt'])assert.ok(html.includes(`property="${field}"`),field);
 for(const field of ['twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'])assert.ok(html.includes(`name="${field}"`),field);
 assert.match(metadataHead('Title','Description','/'),/index, follow, max-image-preview:large/);
});
test('authored metadata cannot break out of tags or structured data',()=>{
 const value='</script><script>alert("test")</script> & < >';
 const html=metadataHead(value,value,'/about',{website:true});
 assert.ok(!html.includes('<script>alert'));
 assert.match(html,/&lt;\/script&gt;/);
 const json=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
 assert.ok(!json.includes('<'));
 assert.equal(JSON.parse(json).description,value);
 assert.equal(JSON.parse(json).creator.name,'Ian Sproates');
});
test('description excerpts use one consistent readable length',()=>{
 assert.equal(description(' A\n\nshort   description. '),'A short description.');
 const excerpt=description('A longer historical description. '.repeat(20));
 assert.ok(excerpt.length<=170);assert.ok(excerpt.endsWith('…'));
});
