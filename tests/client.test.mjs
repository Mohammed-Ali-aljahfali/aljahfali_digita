import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync('assets/js/supabase-client.js','utf8');
function setup({key='',client,local={},fetchImpl=globalThis.fetch}={}){
 const context={URL,Intl,console,setTimeout,clearTimeout,AbortController,crypto:globalThis.crypto,atob:globalThis.atob,fetch:globalThis.fetch,location:{href:'https://store.example/subscriptions.html'},localStorage:{getItem:k=>local[k]??null,setItem:(k,v)=>local[k]=v,removeItem:k=>delete local[k]},sessionStorage:{removeItem(){}},ALJAHFALI_CONFIG:{supabaseUrl:'https://test.supabase.co',supabasePublishableKey:key},PRODUCTS_CATALOG:[{id:'original',is_active:true,prices:{usd:12}}],supabase:{createClient:()=>client}};
 context.fetch=fetchImpl;context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/store-core.js','utf8'),context);vm.runInContext(code,context);return context;
}

test('assistant transport sends only bounded public conversation and authenticated session to the store function',async()=>{
 let request;
 const c=setup({key:'sb_publishable_test',client:{auth:{getSession:async()=>({data:{session:{access_token:'session-test-token'}},error:null})}},fetchImpl:async(url,options)=>{request={url,options};return {ok:true,json:async()=>({answer:'المعلومة المعتمدة',mode:'guide',sources:[]})};}});
 const reply=await c.AlJahfaliCloud.askAssistant({message:'كيف أشتري؟',user_id:'forged-user',private_data:'must not send',history:[{role:'user',content:'السعر',password:'must not send'}],context:{page:'subscriptions.html',currency:'sar',admin:true}});
 assert.equal(reply.mode,'guide');assert.equal(request.url,'https://test.supabase.co/functions/v1/store-assistant');
 assert.equal(request.options.headers.Authorization,'Bearer session-test-token');assert.equal(request.options.headers.apikey,'sb_publishable_test');
 const body=JSON.parse(request.options.body);assert.equal(body.user_id,undefined);assert.equal(body.private_data,undefined);assert.equal(body.context.admin,undefined);assert.equal(body.history[0].password,undefined);
});

test('assistant transport preserves rate/auth errors without exposing provider or server details',async()=>{
 for(const [status,expected] of [[429,'rate_limit'],[401,'auth_required'],[503,'assistant_unavailable']]){
  const c=setup({key:'sb_publishable_test',client:{auth:{getSession:async()=>({data:{session:null}})}},fetchImpl:async()=>({ok:false,status,json:async()=>({message:'gsk_PRIVATE_PROVIDER_ERROR'})})});
  await assert.rejects(c.AlJahfaliCloud.askAssistant({message:'مرحبا'}),error=>error.code===expected&&!error.message.includes('gsk_'));
 }
});

test('cancelled assistant request never starts a network call and guests send no fake bearer session',async()=>{
 let calls=0;
 const c=setup({key:'sb_publishable_test',client:{auth:{getSession:async()=>({data:{session:null}})}},fetchImpl:async(_url,options)=>{calls++;assert.equal(options.headers.Authorization,undefined);return {ok:true,json:async()=>({answer:'مساعدة',mode:'guide'})};}});
 const abort=new AbortController();abort.abort();await assert.rejects(c.AlJahfaliCloud.askAssistant({message:'مرحبا'},{signal:abort.signal}),{name:'AbortError'});assert.equal(calls,0);
 await c.AlJahfaliCloud.askAssistant({message:'مرحبا'});assert.equal(calls,1);
});

test('assistant article saves restrict mutations to public article fields',async()=>{
 const changes=[];const q={select(){return this;},eq(){return this;},maybeSingle:async()=>({data:null}),insert(value){changes.push(value);return this;},single:async()=>({data:{id:'new-article'}})};
 const c=setup({key:'sb_publishable_test',client:{auth:{getUser:async()=>({data:{user:{id:'admin'}}})},rpc:async()=>({data:true}),from:table=>{assert.equal(table,'assistant_articles');return q;}}});
 await c.AlJahfaliCloud.save('assistant_articles',{id:'form-id',title:'مساعدة',body:'معلومات معتمدة',published:true,created_at:'fake',role:'admin',secret:'secret'});
 assert.deepEqual(Object.keys(changes[0]).sort(),['body','published','title']);
});
test('absent credentials permit catalog only; financial writes fail closed',async()=>{const c=setup();assert.equal((await c.AlJahfaliCloud.fetchProducts()).length,1);assert.equal(await c.AlJahfaliCloud.getCurrentUser(),null);await assert.rejects(c.AlJahfaliCloud.createOrder({items:[]}),/غير متاحة/);await assert.rejects(c.AlJahfaliCloud.getUserOrders(),/سجّل الدخول/);});
test('client rejects secret or service role credentials',()=>{const key='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';const c=setup({key});assert.equal(c.AlJahfaliCloud.config.isConfigured(),false);assert.throws(()=>c.AlJahfaliCloud.config.setCredentials('https://test.supabase.co','sb_secret_abc'));});
test('authoritative empty catalog does not resurrect archived local products',async()=>{const q={select(){return this;},eq(){return this;},order(){return this;},limit(){return Promise.resolve({data:[],error:null});}};const c=setup({key:'sb_publishable_abc',client:{from:()=>q}});assert.equal((await c.AlJahfaliCloud.fetchProducts()).length,0);assert.equal(c.AlJahfaliCloud.catalogSource,'cloud');});
test('failed authoritative order does not create local success or rewrite request identity',async()=>{let sent;const local={};const c=setup({key:'sb_publishable_abc',local,client:{rpc:(name,args)=>{sent={name,args};return Promise.resolve({error:{code:'price_changed',message:'PRICE_CHANGED'},data:null});}}});const req={idempotency_key:'same-key',expected_total:12,items:[{product_id:'original',quantity:1}]};await assert.rejects(c.AlJahfaliCloud.createOrder(req),/تغير السعر/);assert.equal(sent.name,'create_order');assert.equal(sent.args.p_request.idempotency_key,'same-key');assert.equal(local.aljahfali_orders,undefined);});
test('cached local identity cannot authenticate a user',async()=>{const c=setup({local:{aljahfali_current_user:JSON.stringify({id:'fake',role:'admin'})}});assert.equal(await c.AlJahfaliCloud.getCurrentUser(),null);await assert.rejects(c.AlJahfaliCloud.requireAdmin(),/سجّل الدخول/);});
test('explicit connection settings replace URL and public key atomically',()=>{
 const local={};const c=setup({key:'sb_publishable_deployed',local});
 c.AlJahfaliCloud.config.setCredentials(' https://staging.supabase.co ',' sb_publishable_staging ');
 assert.equal(c.AlJahfaliCloud.config.getUrl(),'https://staging.supabase.co');assert.equal(c.AlJahfaliCloud.config.getKey(),'sb_publishable_staging');
 assert.deepEqual(JSON.parse(local.aljahfali_supabase_connection),{url:'https://staging.supabase.co',key:'sb_publishable_staging'});
 assert.throws(()=>c.AlJahfaliCloud.config.setCredentials('https://bad.supabase.co','sb_secret_bad'));
 assert.equal(c.AlJahfaliCloud.config.getUrl(),'https://staging.supabase.co');
});
test('legacy local settings never mix another project key into deployed runtime URL',()=>{
 const pair={aljahfali_supabase_url:'https://legacy.supabase.co',aljahfali_supabase_key:'sb_publishable_legacy'};
 const deployed=setup({key:'sb_publishable_deployed',local:{...pair}});
 assert.equal(deployed.AlJahfaliCloud.config.getUrl(),'https://test.supabase.co');assert.equal(deployed.AlJahfaliCloud.config.getKey(),'sb_publishable_deployed');
 const fallback=setup({local:{...pair}});
 assert.equal(fallback.AlJahfaliCloud.config.getUrl(),'https://legacy.supabase.co');assert.equal(fallback.AlJahfaliCloud.config.getKey(),'sb_publishable_legacy');
 const orphan=setup({local:{aljahfali_supabase_key:'sb_publishable_orphan'}});assert.equal(orphan.AlJahfaliCloud.config.isConfigured(),false);
});
test('database commerce failures have specific safe Arabic messages',async()=>{
 for(const [message,expected]of [['AUTH_REQUIRED',/سجّل الدخول/],['COUPON_UNAVAILABLE',/رمز الخصم/],['PLAN_UNAVAILABLE',/الباقة/],['QUANTITY_NOT_ALLOWED',/الكمية/],['PAYMENT_NOT_ALLOWED',/إثبات دفع/],['TOO_MANY_PENDING_ORDERS',/طلبات معلقة/]]){
  const c=setup({key:'sb_publishable_abc',client:{rpc:()=>Promise.resolve({data:null,error:{message,code:'P0001'}})}});
  await assert.rejects(c.AlJahfaliCloud.createOrder({}),expected);
 }
});

test('lost-order recovery looks up the request key only for the authenticated customer',async()=>{
 const filters=[];const q={select(){return this;},eq(key,value){filters.push([key,value]);return this;},maybeSingle(){return Promise.resolve({data:{id:'saved-order',user_id:'customer-a'},error:null});}};
 const c=setup({key:'sb_publishable_abc',client:{auth:{getUser:async()=>({data:{user:{id:'customer-a'}},error:null})},from:table=>{assert.equal(table,'orders');return q;}}});
 assert.equal((await c.AlJahfaliCloud.getOrderByRequestKey('request-1')).id,'saved-order');
 assert.deepEqual(filters,[['user_id','customer-a'],['idempotency_key','request-1']]);
 const guest=setup();await assert.rejects(guest.AlJahfaliCloud.getOrderByRequestKey('request-1'),/سجّل الدخول/);
});
