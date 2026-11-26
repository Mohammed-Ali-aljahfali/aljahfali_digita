/* Supabase commerce adapter: no simulated auth, orders or payments. */
(function(window) {
'use strict';
const core=window.StoreCore, runtime=window.ALJAHFALI_CONFIG||{};
let clientInstance=null, productRequest=null, explicitCredentials=null;
const timeoutMs=Math.max(1000,Number(runtime.requestTimeoutMs)||12000);
const publicTables=new Set(['products','product_plans','categories','payment_methods','store_policies','store_settings','assistant_articles']);
const readTables=new Set([...publicTables,'profiles','orders','order_items','order_history','payments','subscriptions','renewals','notifications','support_tickets','audit_logs','coupons','product_costs','order_cost_snapshots','notification_outbox']);
const writeTables=new Set(['products','product_plans','categories','payment_methods','store_policies','store_settings','coupons','product_costs','notifications','support_tickets','subscriptions','renewals','assistant_articles']);
function stored(key){try{return window.localStorage.getItem(key)||'';}catch{return '';}}
function publicKey(key){if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return true;if(!/^eyJ[A-Za-z0-9_.-]+$/.test(key))return false;try{return JSON.parse(window.atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{return false;}}
function validURL(value){try{const u=new URL(value);return !u.username&&!u.password&&!u.search&&!u.hash&&(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)));}catch{return false;}}
function credentials(){
  if(explicitCredentials)return explicitCredentials;
  const deployed={url:String(runtime.supabaseUrl||'').trim(),key:String(runtime.supabasePublishableKey||'').trim()};
  // A deployed configuration is an indivisible pair. Old browser settings cannot replace its key.
  if(deployed.key)return deployed;
  let saved=null;try{saved=JSON.parse(stored('aljahfali_supabase_connection')||'null');}catch{}
  if(saved&&validURL(saved.url)&&publicKey(saved.key))return saved;
  const legacy={url:stored('aljahfali_supabase_url').trim(),key:stored('aljahfali_supabase_key').trim()};
  if(validURL(legacy.url)&&publicKey(legacy.key))return legacy;
  return deployed;
}
const config={getUrl:()=>credentials().url,getKey:()=>credentials().key,isConfigured(){const pair=credentials();return validURL(pair.url)&&publicKey(pair.key);},setCredentials(url,key){const pair={url:String(url||'').trim(),key:String(key||'').trim()};if(!validURL(pair.url)||!publicKey(pair.key))throw new Error('استخدم رابط Supabase ومفتاح publishable أو anon العام فقط. المفاتيح السرية غير مسموحة في المتصفح.');try{window.localStorage.setItem('aljahfali_supabase_connection',JSON.stringify(pair));}catch{throw new Error('تعذر حفظ إعدادات الاتصال.');}explicitCredentials=pair;clientInstance=null;productRequest=null;}};
async function timedFetch(input,init={}){const abort=new AbortController(),relay=()=>abort.abort();if(init.signal?.aborted)abort.abort();init.signal?.addEventListener('abort',relay,{once:true});const timer=setTimeout(()=>abort.abort(),timeoutMs);try{return await window.fetch(input,{...init,signal:abort.signal});}finally{clearTimeout(timer);init.signal?.removeEventListener('abort',relay);}}
function getClient(){if(clientInstance)return clientInstance;if(!config.isConfigured()||typeof window.supabase?.createClient!=='function')return null;clientInstance=window.supabase.createClient(config.getUrl(),config.getKey(),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},global:{fetch:timedFetch}});return clientInstance;}
function requiredClient(){const c=getClient();if(!c)throw new Error('خدمة الحسابات والطلبات غير متاحة حاليًا. يمكنك تصفح المنتجات والتواصل مع الدعم.');return c;}
function friendly(error){const msg=String(error?.message||'');if(/[\u0600-\u06ff]/.test(msg)&&msg.length<400)return error instanceof Error?error:new Error(msg);const known={invalid_renewal_order:'اختر طلب شراء جديدًا لنفس العميل والمنتج والباقة، مختلفًا عن الطلب الأصلي.',renewal_payment_required:'يجب ربط التجديد بطلب جديد مؤكد الدفع قبل اعتماده مكتملًا.',auth_required:'سجّل الدخول أولًا للمتابعة.',coupon_unavailable:'رمز الخصم غير متاح لهذه السلة أو انتهت صلاحيته.',product_unavailable:'أحد المنتجات لم يعد متاحًا. راجع السلة.',plan_unavailable:'الباقة المختارة لم تعد متاحة. اختر باقة أخرى.',quantity_not_allowed:'الكمية المطلوبة تتجاوز الحد المسموح لهذه الباقة.',too_many_pending_orders:'لديك طلبات معلقة. أكمل دفعها أو ألغِ الطلب غير المطلوب من حسابك قبل إنشاء طلب جديد.',payment_not_allowed:'لا يمكن إرسال إثبات دفع لهذه الحالة. حدّث الطلب وتحقق من حالة المراجعة.',payment_not_verified:'يجب التحقق من الدفع قبل تنفيذ هذه العملية.',price_unavailable:'السعر غير متاح بالعملة المختارة. حدّث السلة أو اختر عملة أخرى.',invalid_exchange_rates:'أسعار الصرف تحتاج إلى مراجعة من إدارة المتجر. تواصل مع الدعم.',invalid_rounding:'إعدادات تقريب الأسعار تحتاج إلى مراجعة من إدارة المتجر.',price_changed:'تغير السعر. راجع الإجمالي المحدّث ثم أكد الطلب مرة أخرى.',out_of_stock:'أحد المنتجات أو الباقات غير متوفر حاليًا. حدّث السلة.',invalid_coupon:'رمز الخصم غير صالح أو انتهت صلاحيته.',coupon_limit:'وصل رمز الخصم إلى الحد المسموح.',invalid_transition:'لا يمكن نقل الطلب إلى هذه الحالة حاليًا.',forbidden:'ليست لديك صلاحية لتنفيذ هذه العملية.',unauthorized:'سجّل الدخول أولًا للمتابعة.',authentication_required:'سجّل الدخول أولًا للمتابعة.',invalid_credentials:'البريد الإلكتروني أو كلمة المرور غير صحيحة.',email_not_confirmed:'تحقق من بريدك الإلكتروني لتفعيل الحساب.',rate_limit:'طلبات كثيرة خلال فترة قصيرة. انتظر قليلًا ثم أعد المحاولة.',idempotency_conflict:'بيانات الطلب تغيرت. حدّث السلة ثم حاول من جديد.',plan_required:'اختر باقة متاحة لهذا المنتج.',invalid_payment_method:'وسيلة الدفع غير متاحة لهذه العملة.',payment_required:'يجب تأكيد الدفع قبل تجهيز الطلب أو تفعيله.'};const lower=`${error?.code||''} ${msg}`.toLowerCase();for(const [code,text]of Object.entries(known))if(lower.includes(code)||lower.includes(code.replace(/_/g,' ')))return Object.assign(new Error(text),{code});if(lower.includes('invalid login'))return new Error(known.invalid_credentials);if(error?.name==='AbortError'||/timeout|fetch|network|aborted/.test(lower))return Object.assign(new Error('تعذر الاتصال أو انتهت المهلة. تحقق من الإنترنت وأعد المحاولة؛ راجع طلباتك قبل إنشاء طلب جديد.'),{code:'network_error'});if(['42501','PGRST301'].includes(error?.code))return new Error(known.forbidden);if(['PGRST202','PGRST205','42P01','42883'].includes(error?.code))return new Error('خدمة المتجر تحتاج إلى استكمال إعداد قاعدة البيانات. تواصل مع الدعم.');return new Error('تعذر إتمام العملية. أعد المحاولة أو تواصل مع الدعم.');}
async function result(query){let timer;try{const response=await Promise.race([query,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('timeout'),{name:'AbortError'})),timeoutMs+1000);})]);if(response.error)throw response.error;return response.data;}catch(e){throw friendly(e);}finally{clearTimeout(timer);}}
async function rpc(name,params={}){return result(requiredClient().rpc(name,params));}
async function currentUser(){const c=getClient();if(!c)return null;const response=await c.auth.getUser();if(response.error){if(response.error.name==='AuthSessionMissingError'||response.error.status===401)return null;throw friendly(response.error);}return response.data?.user||null;}
async function requireUser(){const u=await currentUser();if(!u)throw new Error('سجّل الدخول أولًا للمتابعة.');return u;}
function catalog(){const local=core.readStorage('aljahfali_custom_products',null)||core.readStorage('aljahfali_catalog_custom',null);if(Array.isArray(local))return local.filter(p=>p&&typeof p.id==='string'&&p.is_active!==false);return Array.isArray(window.PRODUCTS_CATALOG)?window.PRODUCTS_CATALOG.filter(p=>p&&p.is_active!==false):[];}
function pageURL(name){return new URL(name,window.location.href).href;}
async function publicList(table,order='sort_order',filters={}){if(!getClient())return [];let q=getClient().from(table).select('*');for(const[k,v]of Object.entries(filters))q=q.eq(k,v);return await result(q.order(order,{ascending:true}).limit(1000))||[];}
const Cloud={config,getClient,catalogSource:'local',catalogWarning:'',
async askAssistant(payload,{signal}={}){
  const client=requiredClient();
  const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  const timeout=setTimeout(abort,Math.min(45000,Math.max(5000,Number(runtime.assistant?.timeoutMs)||25000)));
  const endpoint=new URL('functions/v1/store-assistant',config.getUrl().replace(/\/$/,'')+'/');
  try{
    const {data,error}=await client.auth.getSession();
    if(error)throw friendly(error);
    if(controller.signal.aborted)throw Object.assign(new Error('Request aborted'),{name:'AbortError'});
    const headers={'Content-Type':'application/json',apikey:config.getKey()};
    if(data?.session?.access_token)headers.Authorization='Bearer '+data.session.access_token;
    const body={message:String(payload?.message||''),action:payload?.action==='my_orders'?'my_orders':'ask',
      history:Array.isArray(payload?.history)?payload.history.slice(-8).map(item=>({role:item.role,content:String(item.content||'').slice(0,1500)})):[],
      context:{page:String(payload?.context?.page||'index.html'),currency:payload?.context?.currency||'usd',...(payload?.context?.productId?{productId:String(payload.context.productId)}:{})}};
    const response=await window.fetch(endpoint.href,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal});
    let answer;try{answer=await response.json();}catch{throw new Error('تعذر قراءة رد المساعد. أعد المحاولة.');}
    if(!response.ok){const code=response.status===429?'rate_limit':response.status===401?'auth_required':'assistant_unavailable';throw Object.assign(new Error(code==='rate_limit'?'انتظر قليلًا قبل إرسال سؤال آخر.':code==='auth_required'?'سجّل الدخول لمتابعة طلباتك.':'خدمة المساعد غير متاحة حاليًا.'),{code});}
    if(!answer||typeof answer.answer!=='string'||!['ai','guide','account'].includes(answer.mode))throw new Error('تعذر قراءة رد المساعد. أعد المحاولة.');
    return answer;
  }finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
},
async fetchAssistantArticles(id){if(!getClient())return id?null:[];let query=getClient().from('assistant_articles').select('id,title,body,published,updated_at').eq('published',true);return result(id?query.eq('id',id).maybeSingle():query.order('updated_at',{ascending:false}).limit(100));},
async testConnection(){await result(requiredClient().from('products').select('id').limit(1));return true;},
async fetchProducts(options={}){if(productRequest&&!options.force)return productRequest;productRequest=(async()=>{if(!getClient()){this.catalogSource='local';this.catalogWarning='تُعرض نسخة الكتالوج المتاحة للتصفح. تأكيد السعر والتوفر يتم عند اتصال المتجر.';return catalog();}try{const data=await result(getClient().from('products').select('*').eq('is_active',true).order('id',{ascending:true}).limit(1000));this.catalogSource='cloud';this.catalogWarning='';return data||[];}catch(e){this.catalogSource='local';this.catalogWarning='تعذر تحديث الكتالوج. المعروض نسخة محفوظة؛ أعد المحاولة للتحقق من السعر والتوفر.';const local=catalog();if(!local.length){this.catalogSource='unavailable';throw e;}return local;}})();try{return await productRequest;}finally{productRequest=null;}},
getLocalProducts:catalog,
fetchPlans(id){return publicList('product_plans','sort_order',{is_active:true,...(id?{product_id:id}:{})});},
fetchCategories(){return publicList('categories','sort_order',{is_active:true});},
fetchPaymentMethods(){return publicList('payment_methods','sort_order',{is_active:true});},
async fetchCatalogSales(){if(!getClient())return [];return await rpc('catalog_sales')||[];},
async fetchRates(){if(!getClient())return core.normalizeRates({});const data=await result(getClient().from('store_settings').select('value,updated_at').eq('key','exchange_rates').maybeSingle());return core.normalizeRates(data||{});},
async fetchPolicy(id){if(!getClient())return null;return result(getClient().from('store_policies').select('id,title,body,updated_at,published').eq('id',id).eq('published',true).maybeSingle());},
async requireAdmin(){const user=await requireUser();if(await rpc('is_admin')!==true)throw new Error('هذه الصفحة متاحة لمدير المتجر فقط.');return user;},
async list(table,options={}){if(!readTables.has(table))throw new Error('القسم غير مدعوم.');if(!publicTables.has(table))await requireUser();let q=requiredClient().from(table).select('*');for(const[k,v]of Object.entries(options.filters||{}))q=v===null?q.is(k,null):q.eq(k,v);const o=options.order||'created_at';q=q.order(typeof o==='string'?o:o.column,{ascending:options.ascending??(typeof o==='object'?o.ascending:false)??false});return await result(q.limit(Math.min(options.limit||500,1000)))||[];},
async save(table,record){if(!writeTables.has(table))throw new Error('استخدم العملية المخصصة لهذا القسم.');await this.requireAdmin();const safe={...record};delete safe.created_at;const narrow={support_tickets:['status','admin_reply'],subscriptions:['status','expires_at','warranty','delivery_notes'],renewals:['status','order_id','note']};if(narrow[table]){const update=Object.fromEntries(narrow[table].filter(k=>k in safe).map(k=>[k,safe[k]]));return result(requiredClient().from(table).update(update).eq('id',safe.id).select().single());}if(table==='assistant_articles'){const fields={title:String(safe.title||'').trim(),body:String(safe.body||'').trim(),published:safe.published===true};const existing=safe.id?await result(requiredClient().from(table).select('id').eq('id',safe.id).maybeSingle()):null;return result(existing?requiredClient().from(table).update(fields).eq('id',safe.id).select().single():requiredClient().from(table).insert(fields).select().single());}if(table==='notifications')return this.sendNotification(safe);if(table==='coupons'){const fields=['code','discount_type','discount_value','currency','min_total','max_discount','starts_at','ends_at','max_uses','is_active'];const payload=Object.fromEntries(fields.filter(k=>k in safe).map(k=>[k,safe[k]]));const existing=safe.id?await result(requiredClient().from('coupons').select('id').eq('id',safe.id).maybeSingle()):null;if(existing)return result(requiredClient().from('coupons').update(payload).eq('id',safe.id).select().single());return result(requiredClient().from('coupons').insert({...payload,...(safe.id?{id:safe.id}:{})}).select().single());}return result(requiredClient().from(table).upsert(safe).select().single());},
async remove(table,id){await this.requireAdmin();if(!['products','product_plans','categories','payment_methods','coupons'].includes(table))throw new Error('لا يُسمح بحذف السجلات التاريخية. عدّل حالتها بدلًا من حذفها.');return result(requiredClient().from(table).update({is_active:false}).eq('id',id).select().single());},
addProduct(data){return this.save('products',{...data,id:data.id||`prod_${window.crypto.randomUUID()}`,is_active:true});},
async updateProduct(id,updates){await this.requireAdmin();return result(requiredClient().from('products').update({...updates,updated_at:new Date().toISOString()}).eq('id',id).select().single());},
deleteProduct(id){return this.remove('products',id);},
updateRates(value){return this.save('store_settings',{key:'exchange_rates',value,updated_at:new Date().toISOString()});},
signUp(email,password,fullName,phone){return result(requiredClient().auth.signUp({email:email.trim(),password,options:{emailRedirectTo:pageURL('account.html'),data:{full_name:fullName.trim(),phone:(phone||'').trim()}}}));},
signIn(email,password){return result(requiredClient().auth.signInWithPassword({email:email.trim(),password}));},
signInWithGoogle(){if(!runtime.auth?.googleEnabled)throw new Error('تسجيل الدخول عبر Google غير متاح حاليًا. استخدم البريد الإلكتروني.');return result(requiredClient().auth.signInWithOAuth({provider:'google',options:{redirectTo:pageURL('account.html')}}));},
resetPassword(email){return result(requiredClient().auth.resetPasswordForEmail(email.trim(),{redirectTo:pageURL('login.html?recovery=1')}));},
updatePassword(password){return result(requiredClient().auth.updateUser({password}));},
async signOut(scope='local'){if(getClient())await result(getClient().auth.signOut({scope}));try{window.localStorage.removeItem('aljahfali_current_user');window.sessionStorage.removeItem('aljahfali_admin_auth');}catch{}return true;},
getCurrentUser:currentUser,
async getCurrentProfile(userId){const user=await requireUser();if(userId&&userId!==user.id)throw new Error('لا يمكنك الوصول إلى هذا الملف.');return result(requiredClient().from('profiles').select('*').eq('id',user.id).maybeSingle());},
async updateProfile(fields){const user=await requireUser();return result(requiredClient().from('profiles').update({full_name:String(fields.full_name||'').trim().slice(0,150),phone:String(fields.phone||'').trim().slice(0,30)}).eq('id',user.id).select().single());},
onAuthStateChange(callback){return getClient()?.auth.onAuthStateChange(callback)||null;},
async getAllProfiles(){await this.requireAdmin();return this.list('profiles');},
quoteCart(req){return rpc('quote_order',{p_items:req.items,p_currency:req.currency,p_coupon:req.coupon_code||null});},
createOrder(req){return rpc('create_order',{p_request:req});},
saveOrder(req){return this.createOrder(req);},
async getOrder(id){await requireUser();return result(requiredClient().from('orders').select('*').eq('id',id).single());},
async getOrderByRequestKey(key){const user=await requireUser();return result(requiredClient().from('orders').select('*').eq('user_id',user.id).eq('idempotency_key',key).maybeSingle());},
async getUserOrders(userId){const user=await requireUser();if(userId&&user.id!==userId)throw new Error('لا يمكنك الوصول إلى هذه الطلبات.');return this.list('orders',{filters:{user_id:user.id},limit:200});},
async getAllOrders(){await this.requireAdmin();return this.list('orders');},
async getOrderHistory(id){await requireUser();return this.list('order_history',{filters:{order_id:id},ascending:true});},
updateOrderStatus(id,status,note=''){return rpc('admin_transition_order',{p_order_id:id,p_status:status,p_note:note});},
reviewPayment(id,approved,note=''){return rpc('admin_review_payment',{p_payment_id:id,p_approved:approved,p_note:note});},
async submitPaymentEvidence(orderId,file,reference){const user=await requireUser();let receiptPath=null;if(file){const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};if(!types[file.type]||file.size<=0||file.size>5*1024*1024)throw new Error('ارفع صورة JPG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.');const b=new Uint8Array(await file.slice(0,12).arrayBuffer());const genuine=file.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:file.type==='image/png'?[137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n):String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(!genuine)throw new Error('محتوى الملف لا يطابق نوع الصورة المحدد.');const order=await this.getOrder(orderId);if(order.user_id!==user.id)throw new Error('لا يمكنك رفع سند لهذا الطلب.');const form=new FormData();form.append('order_id',orderId);form.append('file',file);const uploaded=await result(requiredClient().functions.invoke('upload-payment-receipt',{body:form}));if(!uploaded?.path||!uploaded.path.startsWith(`${user.id}/${orderId}/`))throw new Error('تعذر التحقق من حفظ السند. أعد المحاولة.');receiptPath=uploaded.path;}if(!receiptPath&&!String(reference||'').trim())throw new Error('أدخل رقم العملية أو أرفق سند التحويل.');return rpc('submit_payment',{p_order_id:orderId,p_reference:String(reference||'').trim(),p_receipt_path:receiptPath});},
async getReceiptUrl(path){await requireUser();const d=await result(requiredClient().storage.from('payment-receipts').createSignedUrl(path,60));return d.signedUrl;},
async getUserSubscriptions(){const u=await requireUser();return this.list('subscriptions',{filters:{user_id:u.id}});},
async getUserPayments(){const u=await requireUser();return this.list('payments',{filters:{user_id:u.id}});},
async getUserRenewals(){const u=await requireUser();return this.list('renewals',{filters:{user_id:u.id}});},
requestRenewal(id){return rpc('request_renewal',{p_subscription_id:id});},
activateSubscription(data){return rpc('admin_activate_subscription',{p_data:data});},
setUserRole(id,role){return rpc('admin_set_user_role',{p_user_id:id,p_role:role});},
async getNotifications(){const u=await requireUser();return this.list('notifications',{filters:{user_id:u.id}});},
async markNotificationRead(id){const u=await requireUser();return result(requiredClient().from('notifications').update({is_read:true}).eq('id',id).eq('user_id',u.id).select().single());},
sendNotification(data){return rpc('admin_send_notification',{p_data:data});},
async getSupportTickets(){const u=await requireUser();return this.list('support_tickets',{filters:{user_id:u.id}});},
async createSupportTicket(data){const u=await requireUser();return result(requiredClient().from('support_tickets').insert({user_id:u.id,subject:String(data.subject||'').trim(),message:String(data.message||'').trim(),order_id:data.order_id||null}).select().single());},
cancelOrder(id){return rpc('cancel_order',{p_order_id:id});},
runMaintenance(){return rpc('admin_run_maintenance');},
financialReport(from=null,to=null){return rpc('admin_financial_report',{p_from:from,p_to:to});},
async migrateAllProducts(onProgress){await this.requireAdmin();const products=Array.isArray(window.PRODUCTS_CATALOG)?window.PRODUCTS_CATALOG:[];for(let i=0;i<products.length;i+=25){await result(requiredClient().from('products').upsert(products.slice(i,i+25),{onConflict:'id',ignoreDuplicates:true}));onProgress?.(Math.min(i+25,products.length),products.length);}return products.length;}
};window.AlJahfaliCloud=Cloud;
})(window);
