/* Portal behavior tests run in isolated VM contexts. No production network, users or writes. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const coreSource = fs.readFileSync('assets/js/store-core.js', 'utf8');
const sources = Object.fromEntries(['admin','account','auth'].map(key => [key,fs.readFileSync('assets/js/'+key+'.js','utf8')]));
Object.entries(sources).forEach(([name,source]) => new vm.Script(source,{filename:name+'.js'}));

function harness(name, overrides = {}) {
  const nodes = new Map(), events = new Map(), controls = new Map(), writes = [], redirects = [];
  function element(id) {
    if (!nodes.has(id)) nodes.set(id, { id,value:'',hidden:false,disabled:false,checked:false,innerHTML:'',textContent:'',dataset:{},attributes:{},
      elements:{namedItem:key=>controls.get(key)},
      addEventListener:(type,fn)=>events.set(id+':'+type,fn),
      setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},
      querySelector:()=>element(id+':button'),querySelectorAll:()=>[],showModal(){this.open=true;},close(){this.open=false;},reset(){},focus(){},
      classList:{add(){},remove(){},toggle(){}} });
    return nodes.get(id);
  }
  const api = {config:{isConfigured:()=>true},requireAdmin:async()=>({id:'admin-test',email:'admin@test.invalid'}),getCurrentUser:async()=>null,
    list:async()=>[],getAllOrders:async()=>[],getOrderHistory:async()=>[],financialReport:async()=>[],onAuthStateChange(){},
    save:async(...args)=>{writes.push(args);return {};}, ...overrides};
  const context={console,URL,URLSearchParams,Intl,Map,Set,Number,String,Array,Object,Date,Promise,Error,JSON,Boolean,Math,Blob,
    crypto:{randomUUID},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
    document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(type,fn)=>events.set('document:'+type,fn),createElement:()=>({click(){}})},
    location:{href:'https://test.invalid/'+name+'.html',search:'',hash:'',origin:'https://test.invalid',assign:url=>redirects.push(url),replace:url=>redirects.push(url)},
    history:{replaceState(){}},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    AlJahfaliCloud:api,ALJAHFALI_CONFIG:{auth:{googleEnabled:false}},__SKIP_PORTAL_INIT:true};
  context.window=context;vm.createContext(context);vm.runInContext(coreSource,context);
  let source=sources[name];
  if(name==='admin') source=source.replace(/  guard\(\);\s*\}\)\(\);\s*$/,`  window.__portalTest={schemas,readEditor,guard,showOrder,ratesSection,renderTableRows,setEditing(key,record){editing={key,schema:schemas[key],record};},setCache(value){cache=value;}};\n})();`);
  if(name==='account') source=source.replace('  (async () => { try {','  if (!window.__SKIP_PORTAL_INIT) (async () => { try {').replace(/\}\)\(\);\s*$/,`window.__portalTest={renderOrders,renderSubscriptions,renderNotifications,amount,selectTab,setOrders(value){orders=value;},setSubscriptions(value){subscriptions=value;},setNotifications(value){notifications=value;}};\n})();`);
  vm.runInContext(source,context);
  return {context,api,app:context.__portalTest,element,events,controls,writes,redirects};
}
function formFor(h,key,record) {
  h.app.setEditing(key,record||null);
  h.app.schemas[key].fields.forEach(def=>{
    let value=def.key.split('.').reduce((obj,k)=>obj?.[k],record)||def.default||'';
    if(def.type==='json')value=JSON.stringify(value||def.default||{});
    if(def.type==='lines')value=Array.isArray(value)?value.join('\n'):String(value);
    h.controls.set(def.key,{value:String(value),checked:Boolean(value)});
  });
}
let passed=0;
async function test(name,run){await run();console.log('PASS',name);passed++;}
(async()=>{
  await test('Admin refuses unconfigured service without reading or writing store records',async()=>{
    let reads=0;const h=harness('admin',{config:{isConfigured:()=>false},list:async()=>{reads++;return [];}});
    await h.app.guard();assert.equal(reads,0);assert.equal(h.element('adminApp').hidden,true);assert.match(h.element('guardMessage').textContent,/Supabase/);
  });
  await test('Ordinary authenticated account cannot open admin',async()=>{
    let reads=0;const h=harness('admin',{requireAdmin:async()=>{throw Error('هذه الصفحة متاحة لمدير المتجر فقط.');},list:async()=>{reads++;return [];}});
    await h.app.guard();assert.equal(reads,0);assert.equal(h.element('adminApp').hidden,true);assert.equal(h.writes.length,0);
  });
  await test('Product editor preserves unedited legacy metadata and manual prices',()=>{
    const h=harness('admin'),product=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'))[0];
    product.modal_data.existing_extension={preserve:true};formFor(h,'products',product);h.controls.get('title').value='Updated title';
    const result=h.app.readEditor();assert.equal(result.title,'Updated title');assert.equal(result.prices.usd,product.prices.usd);assert.equal(result.prices.sar,product.prices.sar);assert.equal(result.modal_data.existing_extension.preserve,true);assert.equal(result.id,product.id);assert.equal('sold' in result,false);
  });
  await test('Product editor rejects invalid inventory and malformed FAQ structures',()=>{
    const h=harness('admin'),product=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'))[0];formFor(h,'products',product);
    h.controls.get('stock').value='-1';assert.throws(()=>h.app.readEditor(),/قيمة غير صالحة/);h.controls.get('stock').value='1';h.controls.get('modal_data.faq').value='{}';assert.throws(()=>h.app.readEditor(),/الأسئلة الشائعة/);
  });
  await test('Product editor rejects executable activation image URLs',()=>{
    const h=harness('admin'),product=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'))[0];formFor(h,'products',product);
    h.controls.get('modal_data.step_by_step_activation').value=JSON.stringify([{text:'step',image:'javascript:alert(1)'}]);assert.throws(()=>h.app.readEditor(),/رابط صورة/);
  });
  await test('Support update sends only permitted fields and retains primary key',()=>{
    const h=harness('admin');formFor(h,'tickets',{id:'ticket-1',user_id:'customer-1',subject:'Subject',message:'Customer text',status:'open',admin_reply:''});
    h.controls.get('status').value='resolved';h.controls.get('admin_reply').value='Reply';const payload=JSON.parse(JSON.stringify(h.app.readEditor()));assert.deepEqual(payload,{id:'ticket-1',status:'resolved',admin_reply:'Reply'});
  });
  await test('Coupons do not submit mutable usage counters or immutable creation fields',()=>{
    const h=harness('admin');formFor(h,'coupons',{id:'coupon-1',code:'SAVE',discount_type:'percent',discount_value:10,currency:null,min_total:0,max_discount:null,max_uses:null,starts_at:null,ends_at:null,is_active:true,uses_count:19,created_at:'2020-01-01'});
    const payload=h.app.readEditor();assert.equal(payload.id,'coupon-1');assert.equal(payload.uses_count,undefined);assert.equal(payload.created_at,undefined);assert.equal(payload.currency,null);
  });
  await test('Admin order details escape customer data and never allow direct payment approval',async()=>{
    const h=harness('admin',{getOrder:async()=>({id:'o1',order_status:'payment_review',payment_status:'review',customer_name:'<img src=x onerror=alert(1)>',customer_phone:'123',items:[],total:10,currency:'usd'})});
    await h.app.showOrder('o1');const html=h.element('detailContent').innerHTML;assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('value="paid"'));assert.ok(!html.includes('id="activationForm"'));
  });
  await test('Customer orders escape titles, identifiers and payment labels',()=>{
    const h=harness('account');h.app.setOrders([{id:'<script>bad</script>',order_status:'<b>bad</b>',items:[{title:'<img src=x onerror=bad()>',quantity:1,unit_price:4}],currency:'usd',total:4}]);h.app.renderOrders();const html=h.element('ordersList').innerHTML;assert.ok(!html.includes('<script>bad'));assert.ok(!html.includes('<img src=x'));assert.match(html,/&lt;script&gt;/);
  });
  await test('Expiry dates determine expired state without fabricating active subscriptions',()=>{
    const h=harness('account');h.element('subscriptionFilter').value='expired';h.app.setSubscriptions([{id:'s1',product_title:'Old subscription',status:'active',expires_at:'2020-01-01T00:00:00Z'}]);h.app.renderSubscriptions();assert.match(h.element('subscriptionsList').innerHTML,/Old subscription/);assert.match(h.element('subscriptionsList').innerHTML,/منته/);
  });
  await test('Unconfigured login exposes service unavailable and creates no local session',async()=>{
    const h=harness('auth',{config:{isConfigured:()=>false}});await Promise.resolve();assert.equal(h.redirects.length,0);assert.match(h.element('authMessage').textContent,/غير متاحة/);assert.equal(h.element('authMessage').hidden,false);
  });
  await test('Sign-up without a session asks for email confirmation and does not redirect',async()=>{
    const h=harness('auth',{signUp:async()=>({user:{id:'new-test'},session:null})});
    h.element('signupPhone').value='+967700000000';h.element('signupEmail').value='test@test.invalid';h.element('signupPassword').value='isolated-test-password';h.element('signupName').value='Test user';
    h.events.get('signupForm:submit')({preventDefault(){},currentTarget:h.element('signupForm')});await new Promise(resolve=>setImmediate(resolve));
    assert.equal(h.redirects.length,0);assert.match(h.element('authMessage').textContent,/تأكيد الحساب/);assert.equal(h.element('authMessage').hidden,false);
  });
  console.log(`Portal behavior: ${passed} passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
