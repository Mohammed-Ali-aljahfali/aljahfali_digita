import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const values=new Map();
const context={URL,Intl,console,setTimeout,clearTimeout,localStorage:{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)},location:{href:'https://aljahfalidigital.com/subscriptions.html'}};
vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/store-core.js','utf8'),context);
const core=context.StoreCore;
test('malformed or inaccessible storage never prevents catalog initialization',()=>{values.set('cart','{broken');assert.deepEqual(core.readStorage('cart',[]),[]);const local=context.localStorage;context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('quota');}};assert.equal(core.readStorage('cart',null),null);assert.equal(core.writeStorage('cart',[]),false);context.localStorage=local;});
test('legacy conversion recognizes YER per SAR and leaves manual prices untouched',()=>{const rates=core.normalizeRates({sanaa:536,sar:140,aden:2000});assert.equal(rates.rates_per_usd.sar,536/140);assert.equal(core.priceFor({prices:{usd:12,sar:45.9}},'sar',rates),45.9);assert.equal(core.priceFor({prices:{usd:12},pricing_mode:'auto'},'sar',rates),45.94);assert.equal(core.priceFor({prices:{usd:12},pricing_mode:'auto'},'yer_sanaa',rates),6432);});
test('invalid prices and missing conversion rates are unavailable instead of free',()=>{assert.equal(core.priceFor({prices:{}},'usd'),null);assert.equal(core.priceFor({prices:{usd:12},pricing_mode:'auto'},'sar'),null);assert.equal(core.priceFor({prices:{usd:-1}},'usd'),null);assert.equal(core.priceFor({prices:{usd:'NaN'}},'usd'),null);assert.equal(core.priceFor({prices:{usd:0}},'usd'),0);});
test('SQL rounding digits normalize exactly once to UI steps',()=>{const a=core.normalizeRates({value:{rates:{usd:1,sar:3.75,yer_sanaa:536,yer_aden:2000},rounding:{usd:2,sar:2,yer_sanaa:0,yer_aden:0}},updated_at:'2026-11-25'});const b=core.normalizeRates(a);assert.equal(b.rounding.usd,.01);assert.equal(b.rounding.yer_sanaa,1);assert.equal(b.updated_at,'2026-11-25');assert.equal(core.priceFor({prices:{usd:1.006},pricing_mode:'auto'},'usd',b),1.01);});
test('HTML and URL controls prevent executable content',()=>{assert.equal(core.escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');for(const url of ['javascript:alert(1)','data:text/html,bad','https://u:p@example.com','http://remote.example/x','java\nscript:alert(1)'])assert.equal(core.safeURL(url,'fallback'),'fallback');assert.equal(core.safeURL('assets/logo.png'),'assets/logo.png');assert.equal(core.safeURL('https://example.com/icon.svg'),'https://example.com/icon.svg');});
test('blank, boolean, object and unsupported numeric prices cannot become free products',()=>{
 for(const value of ['', ' ', false, true, null, {}, [], '1e2', Infinity, 1000000001]){
  assert.equal(core.priceFor({prices:{usd:value},pricing_mode:'auto'},'usd'),null);
  assert.equal(core.priceFor({prices:{usd:value},pricing_mode:'manual'},'usd'),null);
 }
 assert.equal(core.priceFor({prices:{usd:0}},'usd'),0);
});
test('decimal half-up rounding matches SQL for manual and automatically converted prices',()=>{
 for(const mode of ['manual','auto']){
  assert.equal(core.priceFor({prices:{usd:10.075},pricing_mode:mode},'usd'),10.08);
  assert.equal(core.priceFor({prices:{usd:1.005},pricing_mode:mode},'usd'),1.01);
  assert.equal(core.priceFor({prices:{usd:0.0049},pricing_mode:mode},'usd'),0);
 }
 const rates={rates:{usd:1,sar:3.75,yer_sanaa:536},rounding:{usd:4,sar:2,yer_sanaa:0}};
 assert.equal(core.priceFor({prices:{usd:2.686666666666667},pricing_mode:'auto'},'sar',rates),10.08);
 assert.equal(core.priceFor({prices:{usd:1.12345}},'usd',rates),1.1235);
 assert.equal(core.priceFor({prices:{yer_sanaa:5000.5}},'yer_sanaa',rates),5001);
 assert.equal(core.priceFor({prices:{usd:1e-7},pricing_mode:'auto'},'usd',rates),0);
 assert.match(core.formatMoney(1.1235,'usd'),/1\.1235|١[٫.]١٢٣٥/);
});
test('partial legacy exchange rates preserve independent Yemeni markets and reject invalid rates',()=>{
 const partial=core.normalizeRates({sanaa:536,aden:2000});
 assert.equal(partial.rates_per_usd.yer_sanaa,536);assert.equal(partial.rates_per_usd.yer_aden,2000);assert.equal(partial.rates_per_usd.sar,null);
 const adenOnly=core.normalizeRates({aden:2000});assert.equal(adenOnly.rates_per_usd.yer_aden,2000);
 const invalid=core.normalizeRates({rates:{sar:true,yer_sanaa:1000001,yer_aden:null},rounding:{usd:null}});
 assert.equal(invalid.rates_per_usd.sar,null);assert.equal(invalid.rates_per_usd.yer_sanaa,null);assert.equal(invalid.rounding.usd,.01);
});
