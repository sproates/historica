import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const read=path=>fs.readFileSync(path,'utf8');
test('front page and About links point to published histories and creator profiles',()=>{
 const home=read('web/index.html'),about=read('web/about.html'),routes=JSON.parse(read('web/data/routes.json'));
 for(const match of home.matchAll(/href="(\/(?:person|period|area|event|state|city)\/[^"?]+)(?:\?[^\"]*)?"/g))assert.ok(routes.includes(match[1]),match[1]);
 for(const url of ['https://sproates.net','https://www.linkedin.com/in/sproates/','https://github.com/sproates'])assert.ok(about.includes(`href="${url}"`));
 assert.ok(home.includes('home.js'));assert.ok(!home.includes('focus-app.js'));
 assert.ok(read('web/focus.html').includes('focus-app.js'));
});
test('preview serves the introduction, About and bookmarked focus separately',async()=>{
 const server=spawn('python3',['scripts/preview-server.py','--port','4186'],{stdio:['ignore','ignore','pipe']});
 try{
  let ready=false;
  for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:4186/');if(r.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,50));}
  assert.ok(ready,'preview starts');
  for(const [path,expected] of [['/','History, alongside history.'],['/about','Created by Ian Sproates'],['/person/alexander?comparison=full','id="focus-title"'],['/person/socrates','id="focus-title"']]){
   const response=await fetch('http://127.0.0.1:4186'+path);assert.equal(response.status,200);assert.ok((await response.text()).includes(expected),path);
  }
  assert.equal((await fetch('http://127.0.0.1:4186/person/not-real')).status,404);
 }finally{server.kill();await once(server,'exit');}
});
