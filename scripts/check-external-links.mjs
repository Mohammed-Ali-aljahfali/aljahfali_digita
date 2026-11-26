// Low-volume, read-only link checks. No authentication, forms, orders or uploads.
import fs from 'node:fs';
const names=['index.html','about.html','contact.html','pricing.html','subscriptions.html'];
const links=new Set();
for(const file of names){for(const m of fs.readFileSync(file,'utf8').matchAll(/<a\b[^>]*href="(https:\/\/[^"#]+)"/g)){const u=new URL(m[1].replace(/&amp;/g,'&'));if(u.hostname==='aljahfalidigital.com')continue;links.add(u.href);}}
const results=[];
for(const url of links){
 try{const res=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});results.push({url,status:res.status,result:res.ok?'reachable':res.status===404||res.status===410?'missing':'restricted-or-unverified'});}
 catch(e){results.push({url,result:'unverified-network',reason:e.name});}
}
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/external-links.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
