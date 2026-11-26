/** PostgreSQL integration tests in memory; never connects to Supabase or production. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { testReceiptUpload } from '../supabase/tests/receipt-upload-tests.mjs';

const db = new PGlite();
const migration = await readFile(new URL('../supabase/migrations/202611250001_secure_store.sql', import.meta.url), 'utf8');
const assistantMigration = await readFile(new URL('../supabase/migrations/202611260001_store_assistant.sql', import.meta.url), 'utf8');
const legacyFixture = await readFile(new URL('../supabase/tests/legacy-schema.fixture.sql', import.meta.url), 'utf8');
const admin = '00000000-0000-4000-a000-000000000001';
const alice = '00000000-0000-4000-a000-000000000002';
const bob = '00000000-0000-4000-a000-000000000003';
let checks = 0;
const pass = message => { checks++; console.log(`PASS ${message}`); };
const query = (sql, params=[]) => db.query(sql,params);
const value = async (sql,params=[]) => Object.values((await query(sql,params)).rows[0] || {})[0];
async function role(user = null, name = user ? 'authenticated' : 'anon') {
  await db.exec('RESET ROLE');
  await query("SELECT set_config('request.jwt.claim.sub',$1,false)",[user || '']);
  await db.exec(`SET ROLE ${name}`);
}
async function root() { await role(null,'postgres'); }
async function rejects(sql,params,pattern) {
  await assert.rejects(()=>query(sql,params),pattern);
}
async function rpc(name,args=[],types=[]) {
  return value(`SELECT public.${name}(${args.map((_,i)=>`$${i+1}${types[i]?'::'+types[i]:''}`).join(',')})`,args);
}

const bootstrap = `
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,owner_id text,metadata jsonb,UNIQUE(bucket_id,name));
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO anon,authenticated;
  `;

try {
  // Test the real old table/policy definitions independently of fresh installation.
  const legacyDb = new PGlite();
  try {
    await legacyDb.exec(bootstrap);
    await legacyDb.exec(legacyFixture);
    await legacyDb.exec(`INSERT INTO public.products(id,title,prices,stock) VALUES('old-product','Existing product','{"usd":15,"sar":57.5}',12);
      INSERT INTO public.orders(id,customer_name,customer_phone,items,payment_method,total_usd,status)
        VALUES('OLD-ORDER','Existing customer','777777777','[{"title":"Existing product","qty":1}]','Existing method',15,'completed');
      GRANT UPDATE(role) ON public.profiles TO authenticated;
    `);
    const oldProduct=(await legacyDb.query("SELECT * FROM public.products WHERE id='old-product'")).rows[0];
    const oldOrder=(await legacyDb.query("SELECT * FROM public.orders WHERE id='OLD-ORDER'")).rows[0];
    await legacyDb.exec(migration);
    const migratedProduct=(await legacyDb.query("SELECT * FROM public.products WHERE id='old-product'")).rows[0];
    const migratedOrder=(await legacyDb.query("SELECT * FROM public.orders WHERE id='OLD-ORDER'")).rows[0];
    for (const key of Object.keys(oldProduct)) assert.deepEqual(migratedProduct[key],oldProduct[key]);
    for (const key of Object.keys(oldOrder)) assert.deepEqual(migratedOrder[key],oldOrder[key]);
    assert.equal(migratedOrder.order_status,null);
    assert.equal(migratedOrder.payment_status,'unverified');
    assert.equal((await legacyDb.query("SELECT has_column_privilege('authenticated','public.profiles','role','UPDATE') AS allowed")).rows[0].allowed,false);
    pass('legacy schema upgrade preserves every existing field and never invents verified payments');
    await legacyDb.query('INSERT INTO auth.users(id,email) VALUES($1,$2)',[alice,'legacy-customer@example.test']);
    await legacyDb.query("UPDATE public.orders SET user_id=$1 WHERE id='OLD-ORDER'",[alice]);
    await legacyDb.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[alice]);
    await legacyDb.exec('SET ROLE authenticated');
    await assert.rejects(()=>legacyDb.query("SELECT public.cancel_order('OLD-ORDER')"),/CANCELLATION_NOT_ALLOWED/);
    await assert.rejects(()=>legacyDb.query("SELECT public.submit_payment('OLD-ORDER','legacy-reference',null)"),/PAYMENT_NOT_ALLOWED/);
    const unchangedLegacy=(await legacyDb.query("SELECT status,order_status,payment_status,inventory_released FROM public.orders WHERE id='OLD-ORDER'")).rows[0];
    assert.deepEqual(unchangedLegacy,{status:'completed',order_status:null,payment_status:'unverified',inventory_released:false});
    pass('legacy completed orders cannot be cancelled or submitted for payment through null state guards');
  } finally { await legacyDb.close(); }
  await db.exec(bootstrap);
  await db.exec(migration);
  pass('migration parses and installs inside PostgreSQL');
  await db.exec(migration);
  pass('migration is repeatable without data reset');
  await query('INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,$2,$3),($4,$5,$6),($7,$8,$9)',[
    admin,'admin@example.test',{full_name:'Test administrator'},alice,'alice@example.test',{full_name:'Alice'},bob,'bob@example.test',{full_name:'Bob'}]);
  await query("UPDATE public.profiles SET role='admin' WHERE id=$1",[admin]);
  await query(`INSERT INTO public.products(id,title,prices,stock,allow_quantity,max_quantity,duration_days,is_active)
    VALUES('legacy','Preserved product','{"usd":10,"sar":41,"yer_sanaa":5500,"yer_aden":21000}',10,true,5,30,true),
      ('managed','Plan product','{"usd":99}',10,false,1,30,true),
      ('hidden','Hidden product','{"usd":1}',1,false,1,30,false),
      ('finite','Last unit','{"usd":7}',1,false,1,7,true),
      ('auto','Auto product','{"usd":2}',10,true,5,30,true)`);
  await db.exec(`UPDATE public.products SET pricing_mode='auto' WHERE id='auto';
    INSERT INTO public.product_plans(id,product_id,name,prices,stock,duration_days) VALUES('month','managed','Monthly','{"usd":12,"sar":46}',2,30);
    INSERT INTO public.payment_methods(id,name,recipient_name,account_number,currencies) VALUES('test-bank','ISOLATED TEST BANK','Test','0000',ARRAY['usd','sar','yer_sanaa','yer_aden']);
    INSERT INTO public.store_settings(key,value) VALUES('exchange_rates','{"sanaa":536,"sar":140,"aden":2000}'),('private-test','{"private":true}');
    INSERT INTO public.coupons(id,code,discount_type,discount_value,max_uses) VALUES('one','SAVE10','percent',10,1);
    INSERT INTO public.product_costs(product_id,cost,currency) VALUES('legacy',3,'usd');
    INSERT INTO public.store_policies(id,title,body,published) VALUES('public','Published','Published policy',true),('draft','Draft','Private draft',false);
  `);
  const originalPrices = await value("SELECT prices FROM public.products WHERE id='legacy'");
  await db.exec('GRANT UPDATE(role) ON public.profiles TO authenticated');
  await db.exec(migration);
  assert.deepEqual(await value("SELECT prices FROM public.products WHERE id='legacy'"),originalPrices);
  assert.equal(Number(await value("SELECT stock FROM public.products WHERE id='legacy'")),10);
  pass('reapplying migration preserves existing prices and stock');
  await db.exec("CREATE POLICY unrelated_broad_storage_policy ON storage.objects FOR ALL TO public USING(true) WITH CHECK(true); INSERT INTO storage.objects(bucket_id,name) VALUES('other-bucket','public.jpg')");

  await role();
  assert.equal((await query('SELECT * FROM public.products')).rows.length,4);
  assert.equal((await query('SELECT * FROM public.store_policies')).rows.length,1);
  assert.equal((await query("SELECT * FROM public.store_settings WHERE key='private-test'")).rows.length,0);
  await rejects('SELECT * FROM public.profiles',[],/permission denied/);
  await rejects('SELECT * FROM public.orders',[],/permission denied/);
  await rejects("UPDATE public.products SET stock=100 WHERE id='legacy'",[],/permission denied/);
  await rejects("SELECT public.create_order('{}')",[],/permission denied/);
  await rejects("SELECT public.store_quote('[]','usd',null,false)",[],/permission denied/);
  assert.equal((await query("SELECT * FROM storage.objects WHERE bucket_id='other-bucket'")).rows.length,1);
  pass('anonymous users cannot access accounts/orders/private settings or internal RPCs');

  await role(alice);
  assert.equal((await query('SELECT * FROM public.profiles')).rows.length,1);
  await query("UPDATE public.profiles SET full_name='Alice Updated',phone='12345678' WHERE id=$1",[alice]);
  await rejects("UPDATE public.profiles SET role='admin' WHERE id=$1",[alice],/permission denied/);
  await rejects("SELECT public.admin_set_user_role($1,'admin')",[alice],/ADMIN_REQUIRED/);
  assert.equal((await query("UPDATE public.products SET stock=100 WHERE id='legacy' RETURNING id")).rows.length,0);
  assert.equal((await query('SELECT * FROM public.product_costs')).rows.length,0);
  assert.equal((await query('SELECT * FROM public.audit_logs')).rows.length,0);
  await rejects("INSERT INTO public.coupons(code,discount_type,discount_value) VALUES('EVIL','percent',100)",[],/row-level security/);
  pass('customer isolation, profile column protection, admin guards and private costs');

  const items=[{product_id:'legacy',plan_id:null,quantity:2}];
  const q=await rpc('quote_order',[items,'usd',null],['jsonb','text','text']);
  assert.equal(q.total,20); assert.equal(q.items[0].unit_price,10);
  assert.equal((await rpc('quote_order',[items,'sar',null],['jsonb','text','text'])).total,82);
  assert.equal((await rpc('quote_order',[[{product_id:'auto',quantity:1}],'sar',null],['jsonb','text','text'])).total,7.66);
  await rejects('SELECT public.quote_order($1,$2,null)',[[{product_id:'managed',quantity:1}],'usd'],/PLAN_REQUIRED/);
  await rejects('SELECT public.quote_order($1,$2,null)',[[{product_id:'legacy',plan_id:'month',quantity:1}],'usd'],/PLAN_UNAVAILABLE/);
  await rejects('SELECT public.quote_order($1,$2,null)',[[{product_id:'legacy',quantity:-1}],'usd'],/INVALID_CART_ITEM/);
  await rejects('SELECT public.quote_order($1,$2,null)',[[{product_id:'managed',plan_id:'month',quantity:2}],'usd'],/QUANTITY_NOT_ALLOWED/);
  await rejects('SELECT public.quote_order($1,$2,null)',[[{product_id:'legacy',quantity:1},{product_id:'legacy',quantity:1}],'usd'],/DUPLICATE_CART_ITEM/);
  await rejects('SELECT public.quote_order($1,$2,null)',[items,'unknown'],/INVALID_CURRENCY/);
  pass('authoritative manual/automatic prices, quantity rules and incompatible plans');

  const request={items,currency:'usd',customer_name:'Alice Customer',customer_phone:'+967700000000',payment_method_id:'test-bank',idempotency_key:randomUUID(),expected_total:20};
  await rejects('SELECT public.create_order($1)',[{...request,expected_total:0}],/PRICE_CHANGED/);
  const order=await rpc('create_order',[{...request,user_id:bob,total:0,status:'completed'}],['jsonb']);
  assert.equal(order.user_id,alice); assert.equal(order.total,20); assert.equal(order.order_status,'awaiting_payment');
  assert.equal(order.payment_status,'awaiting'); assert.equal(order.customer_email,'alice@example.test');
  const retry=await rpc('create_order',[{...request,user_id:bob,total:0,status:'completed'}],['jsonb']);
  assert.equal(retry.id,order.id);
  await rejects('SELECT public.create_order($1)',[{...request,customer_phone:'+967711111111'}],/IDEMPOTENCY_CONFLICT/);
  await rejects("UPDATE public.orders SET total=0 WHERE id=$1",[order.id],/permission denied/);
  await rejects("INSERT INTO public.orders(id,customer_name,customer_phone,items,payment_method) VALUES('FORGED','x','x','[]','x')",[],/permission denied/);
  await root();
  assert.equal(Number(await value("SELECT stock FROM public.products WHERE id='legacy'")),8);
  assert.equal(Number(await value('SELECT count(*) FROM public.orders')),1);
  pass('checkout ignores forged identity/status/totals; retry reserves stock only once');

  await role(bob);
  assert.equal((await query('SELECT * FROM public.orders')).rows.length,0);
  assert.equal((await query('SELECT * FROM public.order_items')).rows.length,0);
  await rejects('SELECT public.submit_payment($1,$2,null)',[order.id,'other-user-reference'],/ORDER_NOT_FOUND/);
  await rejects('SELECT public.cancel_order($1)',[order.id],/ORDER_NOT_FOUND/);
  pass('customers cannot read or mutate another customer order');

  await role(alice);
  await rejects('SELECT public.submit_payment($1,null,null)',[order.id],/PAYMENT_EVIDENCE_REQUIRED/);
  await rejects('SELECT public.submit_payment($1,null,$2)',[order.id,`${bob}/${order.id}/proof.png`],/INVALID_RECEIPT_PATH/);
  await rejects('SELECT public.submit_payment($1,null,$2)',[order.id,`${alice}/${order.id}/absent.png`],/INVALID_RECEIPT_FILE/);
  const reservation=await rpc('reserve_receipt_upload',[order.id,'image/png',400],['text','text','integer']);
  const receipt=reservation.path;
  await rejects('INSERT INTO storage.objects(bucket_id,name,owner_id,metadata) VALUES($1,$2,$3,$4)',['payment-receipts',receipt,alice,{mimetype:'image/png',size:400}],/row-level security/);
  await rejects("UPDATE public.receipt_uploads SET status='uploaded' WHERE id=$1",[reservation.id],/permission denied/);
  await root();
  await query('INSERT INTO storage.objects(bucket_id,name,owner_id,metadata) VALUES($1,$2,$3,$4)',['payment-receipts',receipt,null,{mimetype:'image/png',size:400}]);
  await role(alice);
  await rejects('SELECT public.submit_payment($1,$2,$3)',[order.id,'TEST-REF',receipt],/INVALID_RECEIPT_FILE/);
  await root(); await query("UPDATE public.receipt_uploads SET status='uploaded' WHERE id=$1",[reservation.id]);
  await role(alice);
  const payment=await rpc('submit_payment',[order.id,'TEST-REF',receipt],['text','text','text']);
  assert.equal(payment.status,'submitted');
  assert.equal(await value('SELECT payment_status FROM public.orders WHERE id=$1',[order.id]),'review');
  const duplicatePayment=await rpc('submit_payment',[order.id,'TEST-REF',receipt],['text','text','text']);
  assert.equal(duplicatePayment.id,payment.id);
  await rejects('SELECT public.admin_review_payment($1,true,\'\')',[payment.id],/ADMIN_REQUIRED/);
  await role(bob);
  assert.equal((await query("SELECT * FROM storage.objects WHERE bucket_id='payment-receipts'")).rows.length,0);
  await rejects('INSERT INTO storage.objects(bucket_id,name,owner_id,metadata) VALUES($1,$2,$3,$4)',['payment-receipts',receipt+'x',bob,{mimetype:'image/png',size:5}],/row-level security/);
  assert.equal((await query('UPDATE storage.objects SET metadata=$1 WHERE name=$2 RETURNING id',[{mimetype:'image/png',size:5},receipt])).rows.length,0);
  assert.equal((await query('DELETE FROM storage.objects WHERE name=$1 RETURNING id',[receipt])).rows.length,0);
  pass('private receipts tied to owned orders; proof submission never confirms payment');

  await role(admin);
  const notice=await rpc('admin_send_notification',[{user_id:alice,title:'Test notice',body:'A verified in-app notification',link:'account.html#orders'}],['jsonb']);
  assert.equal(notice.user_id,alice);
  await rejects('SELECT public.admin_send_notification($1)',[{user_id:alice,title:'Unsafe link',body:'Do not permit external script URL',link:'javascript:alert(1)'}],/INVALID_NOTIFICATION_LINK/);
  await rejects('SELECT public.admin_transition_order($1,$2,$3)',[order.id,'completed','skip review'],/INVALID_ORDER_TRANSITION/);
  await rejects('SELECT public.admin_review_payment($1,false,null)',[payment.id],/REVIEW_REASON_REQUIRED/);
  await rejects('SELECT public.admin_transition_order($1,$2,null)',[order.id,'cancelled'],/STATUS_REASON_REQUIRED/);
  await rpc('admin_review_payment',[payment.id,true,'Confirmed isolated transfer'],['uuid','boolean','text']);
  await rejects('SELECT public.admin_review_payment($1,true,\'\')',[payment.id],/PAYMENT_ALREADY_REVIEWED/);
  await rpc('admin_transition_order',[order.id,'preparing',''],['text','text','text']);
  const subscription=await rpc('admin_activate_subscription',[{order_id:order.id,product_id:'legacy',starts_at:'2026-11-25T00:00:00Z',delivery_notes:'Sent by WhatsApp after verification'}],['jsonb']);
  assert.equal(subscription.user_id,alice);
  assert.equal(new Date(subscription.expires_at)-new Date(subscription.starts_at),30*86400000);
  await rpc('admin_transition_order',[order.id,'completed','Delivery confirmed'],['text','text','text']);
  assert.equal(await value('SELECT delivery_status FROM public.orders WHERE id=$1',[order.id]),'delivered');
  await rejects('SELECT public.admin_transition_order($1,$2,$3)',[order.id,'awaiting_payment','bad reverse'],/INVALID_ORDER_TRANSITION/);
  assert.equal(Number(await value('SELECT count(*) FROM public.order_history WHERE order_id=$1',[order.id])),5);
  await rejects('UPDATE public.order_history SET to_status=\'paid\'',[],/permission denied/);
  const report=await rpc('admin_financial_report',[],[]);
  assert.equal(report[0].revenue,20); assert.equal(report[0].known_cost,6); assert.equal(report[0].profit_on_costed_orders,14);
  pass('admin payment review, legal lifecycle, subscription dates and private financial report');

  await role(alice);
  const renewal=await rpc('request_renewal',[subscription.id],['uuid']);
  assert.equal((await rpc('request_renewal',[subscription.id],['uuid'])).id,renewal.id);
  await query("UPDATE public.notifications SET is_read=true WHERE user_id=$1",[alice]);
  await rejects("UPDATE public.notifications SET user_id=$1",[bob],/permission denied/);
  await query('INSERT INTO public.support_tickets(user_id,subject,message,order_id) VALUES($1,$2,$3,$4)',[alice,'Test support','Please check this test order',order.id]);
  await rejects('INSERT INTO public.support_tickets(user_id,subject,message) VALUES($1,$2,$3)',[bob,'Bad ownership','Not permitted'],/row-level security/);
  await rejects('SELECT public.admin_financial_report()',[],/ADMIN_REQUIRED/);
  await role(bob);
  assert.equal((await query('SELECT * FROM public.subscriptions')).rows.length,0);
  assert.equal((await query('SELECT * FROM public.renewals')).rows.length,0);
  assert.equal((await query('SELECT * FROM public.support_tickets')).rows.length,0);
  await rejects('SELECT public.request_renewal($1)',[subscription.id],/SUBSCRIPTION_NOT_FOUND/);
  pass('renewal deduplication, notifications and tickets enforce ownership');

  const otherCustomerPurchase=await rpc('create_order',[{...request,items:[{product_id:'legacy',quantity:1}],expected_total:10,idempotency_key:randomUUID()}],['jsonb']);
  await role(admin);
  await rejects('UPDATE public.renewals SET order_id=$1 WHERE id=$2',[otherCustomerPurchase.id,renewal.id],/INVALID_RENEWAL_ORDER/);
  await rejects('UPDATE public.renewals SET order_id=$1 WHERE id=$2',[order.id,renewal.id],/INVALID_RENEWAL_ORDER/);
  await rejects("UPDATE public.renewals SET status='completed' WHERE id=$1",[renewal.id],/RENEWAL_PAYMENT_REQUIRED/);
  await role(bob); await rpc('cancel_order',[otherCustomerPurchase.id],['text']);
  await role(alice);
  const replacement=await rpc('create_order',[{...request,items:[{product_id:'legacy',quantity:1}],expected_total:10,idempotency_key:randomUUID()}],['jsonb']);
  await role(admin);
  await query('UPDATE public.renewals SET order_id=$1 WHERE id=$2',[replacement.id,renewal.id]);
  await rejects("UPDATE public.renewals SET status='completed' WHERE id=$1",[renewal.id],/RENEWAL_PAYMENT_REQUIRED/);
  await role(alice);
  const renewalPayment=await rpc('submit_payment',[replacement.id,'RENEWAL-TEST-REF',null],['text','text','text']);
  await role(admin);
  await rejects("UPDATE public.renewals SET status='completed' WHERE id=$1",[renewal.id],/RENEWAL_PAYMENT_REQUIRED/);
  await rpc('admin_review_payment',[renewalPayment.id,true,'Confirmed renewal test transfer'],['uuid','boolean','text']);
  await query("UPDATE public.renewals SET status='completed' WHERE id=$1",[renewal.id]);
  assert.equal(await value('SELECT status FROM public.renewals WHERE id=$1',[renewal.id]),'completed');
  assert.equal(new Date(await value('SELECT expires_at FROM public.subscriptions WHERE id=$1',[subscription.id])).getTime(),new Date(subscription.expires_at).getTime());
  await rpc('admin_transition_order',[replacement.id,'refunded','Close isolated renewal test'],['text','text','text']);
  pass('renewal completion requires another matching purchase by the same customer with verified payment');

  await role(alice);
  const couponRequest={...request,items:[{product_id:'legacy',quantity:1}],coupon_code:'save10',expected_total:9,idempotency_key:randomUUID()};
  const discounted=await rpc('create_order',[couponRequest],['jsonb']);
  assert.equal(discounted.discount,1); assert.equal(discounted.total,9);
  await role(bob);
  await rejects('SELECT public.create_order($1)',[{...couponRequest,idempotency_key:randomUUID()}],/COUPON_UNAVAILABLE/);
  await role(alice); await rpc('cancel_order',[discounted.id],['text']);
  await role(bob);
  const couponAgain=await rpc('create_order',[{...couponRequest,idempotency_key:randomUUID()}],['jsonb']);
  assert.equal(couponAgain.total,9);
  const lastRequest={...request,items:[{product_id:'finite',quantity:1}],expected_total:7,idempotency_key:randomUUID()};
  const last=await rpc('create_order',[lastRequest],['jsonb']);
  await role(alice);
  await rejects('SELECT public.create_order($1)',[{...lastRequest,idempotency_key:randomUUID()}],/OUT_OF_STOCK/);
  await role(bob); await rpc('cancel_order',[last.id],['text']);
  await rpc('cancel_order',[last.id],['text']);
  await root();
  assert.equal(Number(await value("SELECT stock FROM public.products WHERE id='finite'")),1);
  pass('coupon usage limits and finite stock; cancellation releases inventory exactly once');

  const snapshot=await value('SELECT items FROM public.orders WHERE id=$1',[order.id]);
  await db.exec(`UPDATE public.products SET prices='{"usd":99}' WHERE id='legacy'; UPDATE public.store_settings SET value='{"rates":{"usd":1,"sar":4,"yer_sanaa":1000,"yer_aden":3000}}' WHERE key='exchange_rates';`);
  assert.deepEqual(await value('SELECT items FROM public.orders WHERE id=$1',[order.id]),snapshot);
  assert.equal(Number(await value('SELECT total FROM public.orders WHERE id=$1',[order.id])),20);
  await role(admin);
  await rejects('SELECT public.admin_set_user_role($1,$2)',[admin,'customer'],/LAST_ADMIN_REQUIRED/);
  await rpc('admin_transition_order',[order.id,'refunded','Refund settled manually'],['text','text','text']);
  assert.equal(await value('SELECT status FROM public.subscriptions WHERE id=$1',[subscription.id]),'cancelled');
  assert.equal((await query('SELECT * FROM public.catalog_sales()')).rows.length,0);
  assert.equal((await rpc('admin_financial_report')).length,0);
  pass('immutable past prices, last-admin guard, refunds removed from confirmed sales');

  await root();
  await db.exec(assistantMigration);
  await db.exec(assistantMigration);
  await role(admin);
  const article = (await query("INSERT INTO public.assistant_articles(title,body,published) VALUES('Public help','Approved public answer',true) RETURNING id")).rows[0].id;
  await query("INSERT INTO public.assistant_articles(title,body,published) VALUES('Draft help','Private draft answer',false)");
  await role();
  assert.equal((await query('SELECT * FROM public.assistant_articles')).rows.length,1);
  await rejects("INSERT INTO public.assistant_articles(title,body) VALUES('Attempt','Unauthorized article')",[],/permission denied/);
  await role(alice);
  assert.equal((await query('SELECT * FROM public.assistant_articles')).rows.length,1);
  await rejects("INSERT INTO public.assistant_articles(title,body) VALUES('Attempt','Unauthorized article')",[],/row-level security/);
  assert.equal((await query("UPDATE public.assistant_articles SET body='Customer replacement' WHERE id=$1 RETURNING id",[article])).rows.length,0);
  await rejects('SELECT * FROM public.assistant_rate_limits',[],/permission denied/);
  await rejects("SELECT public.assistant_take_rate_limit('test-bucket',2,60)",[],/permission denied/);
  await role(admin);
  await query('UPDATE public.assistant_articles SET published=false WHERE id=$1',[article]);
  await role();
  assert.equal((await query('SELECT * FROM public.assistant_articles')).rows.length,0);
  await root();
  assert.equal(Number(await value("SELECT count(*) FROM public.audit_logs WHERE entity_type='assistant_articles'")),3);
  await role(null,'service_role');
  assert.equal(await rpc('assistant_take_rate_limit',['test-bucket',2,60],['text','integer','integer']),true);
  assert.equal(await rpc('assistant_take_rate_limit',['test-bucket',2,60],['text','integer','integer']),true);
  assert.equal(await rpc('assistant_take_rate_limit',['test-bucket',2,60],['text','integer','integer']),false);
  await rejects("SELECT public.assistant_take_rate_limit('test-bucket',NULL,60)",[],/INVALID_ASSISTANT_LIMIT/);
  await rejects('SELECT * FROM public.assistant_rate_limits',[],/permission denied/);
  pass('assistant articles enforce publication/admin rules and atomic service-only limits reject overuse');

  await root();
  await db.exec('CREATE POLICY unreviewed_test_policy ON public.products FOR SELECT USING(true)');
  await assert.rejects(()=>db.exec(migration),/UNREVIEWED_POLICY/);
  await db.exec('ROLLBACK; DROP POLICY unreviewed_test_policy ON public.products');
  pass('unknown preexisting public policies abort upgrade transaction');
  pass(await testReceiptUpload());
  console.log(`Database integration: ${checks} scenario groups passed in isolated PostgreSQL (PGlite).`);
} catch (error) {
  console.error('Database integration failed:',error.message);
  if (error.code) console.error('SQL code:',error.code,'Detail:',error.detail || '');
  process.exitCode=1;
} finally {
  await db.close();
}
