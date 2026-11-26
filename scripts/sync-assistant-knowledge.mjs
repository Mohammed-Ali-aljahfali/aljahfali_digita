import fs from 'node:fs';
const source='assets/js/assistant-knowledge.js', target='supabase/functions/store-assistant/knowledge.js';
const content=fs.readFileSync(source);
if(process.argv.includes('--check')){
  if(!fs.existsSync(target)||!content.equals(fs.readFileSync(target))){console.error('Assistant knowledge bundle is stale. Run npm run assistant:sync before deployment.');process.exitCode=1;}
}else{
  fs.mkdirSync('supabase/functions/store-assistant',{recursive:true});
  fs.writeFileSync(target,content);
  console.log('Assistant public knowledge synchronized for Edge Function deployment.');
}
