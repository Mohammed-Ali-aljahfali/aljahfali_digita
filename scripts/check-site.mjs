import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root=process.cwd();
const files=fs.readdirSync(root).filter(p=>p.endsWith('.html')&&!p.startsWith('scratch'));
const errors=[],warnings=[],external=new Set();
for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)){
  let ref=match[1].replace(/&amp;/g,'&');
  if(/^(?:https?:)?\/\//.test(ref)){external.add(ref);continue;}
  if(/^(?:mailto:|tel:|data:|#)/.test(ref))continue;
  const local=decodeURIComponent(ref.split(/[?#]/)[0]);
  if(local&&!fs.existsSync(path.resolve(root,local)))errors.push(`${file}: missing ${local}`);
 }
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/src=|application\/ld\+json|application\/json/.test(match[1]))continue;
  try{new vm.Script(match[2],{filename:file});}catch(e){errors.push(`${file}: ${e.message}`);}
 }
 if(['admin.html','account.html','login.html','cart.html','checkout.html'].includes(file)&&!/name="robots"[^>]*noindex/.test(html))errors.push(`${file}: missing noindex`);
}
for(const file of fs.readdirSync('assets/js').filter(p=>p.endsWith('.js'))){try{new vm.Script(fs.readFileSync('assets/js/'+file,'utf8'),{filename:file});}catch(e){errors.push(`${file}: ${e.message}`);}}
const products=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'));
for(const p of products){if(!fs.existsSync(p.icon))errors.push(`${p.id}: missing logo`);}
const baseline=JSON.parse(fs.readFileSync('docs/baseline.json','utf8'));
for(const p of ['assets/data/products.json','assets/data/products.js']){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 if(hash!==baseline.files.find(f=>f.path===p).sha256)errors.push(`${p}: original catalog changed`);
}
if(!fs.readFileSync('sitemap.xml','utf8').includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))errors.push('Incorrect sitemap namespace');
if(fs.readFileSync('admin.html','utf8').includes('ADMIN_PIN'))errors.push('Legacy client PIN remains');
fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/static-check.json',JSON.stringify({date:new Date().toISOString(),pages:files.length,products:products.length,errors,warnings,externalLinks:[...external]},null,2));
console.log(JSON.stringify({pages:files.length,products:products.length,externalLinks:external.size,errors,warnings},null,2));
process.exitCode=errors.length?1:0;
