import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'));
const paths=['','about.html','pricing.html','contact.html','subscriptions.html',...catalog.filter(p=>p.is_active!==false).map(p=>'product.html?id='+encodeURIComponent(p.id))];
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+paths.map(p=>'  <url><loc>'+escape('https://aljahfalidigital.com/'+p)+'</loc></url>').join('\n')+'\n</urlset>\n');
console.log(`Sitemap: ${paths.length} URLs from preserved catalog. Rerun after approved catalog export.`);
