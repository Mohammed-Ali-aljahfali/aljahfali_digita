import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectReceiptImage, MAX_RECEIPT_BYTES } from '../functions/upload-payment-receipt/image-validation.mjs';
import { createUploadHandler } from '../functions/upload-payment-receipt/handler.mjs';

export async function testReceiptUpload() {
  const png = new Uint8Array(await readFile(new URL('../../icon-192.png',import.meta.url)));
  const jpeg = new Uint8Array(await readFile(new URL('../../assets/service_cards/chatgpt.jpg',import.meta.url)));
  const webp = new Uint8Array(await readFile(new URL('../../assets/categories/banner_hero.webp',import.meta.url)));
  assert.equal(inspectReceiptImage(png,'image/png').width,192);
  assert.equal(inspectReceiptImage(jpeg,'image/jpeg').type,'image/jpeg');
  assert.equal(inspectReceiptImage(webp,'image/webp').type,'image/webp');
  assert.throws(()=>inspectReceiptImage(png,'image/jpeg'),/INVALID_RECEIPT_IMAGE/);
  assert.throws(()=>inspectReceiptImage(new TextEncoder().encode('<svg onload="alert(1)"></svg>'),'image/png'),/INVALID_RECEIPT_IMAGE/);
  assert.throws(()=>inspectReceiptImage(png.slice(0,-4),'image/png'),/INVALID_RECEIPT_IMAGE/);
  assert.throws(()=>inspectReceiptImage(jpeg.slice(0,-2),'image/jpeg'),/INVALID_RECEIPT_IMAGE/);
  assert.throws(()=>inspectReceiptImage(new Uint8Array(MAX_RECEIPT_BYTES+1),'image/png'),/INVALID_RECEIPT_IMAGE/);
  const badDimensions=png.slice(); new DataView(badDimensions.buffer).setUint32(16,100000);
  assert.throws(()=>inspectReceiptImage(badDimensions,'image/png'),/INVALID_RECEIPT_IMAGE/);

  const user='00000000-0000-4000-a000-000000000002';
  const order='ORD-TESTUPLOAD'; const reservationId='00000000-0000-4000-a000-000000000012';
  const path=`${user}/${order}/${reservationId}.png`;
  let authError=false, reserveError=null, uploadError=false, saveError=false;
  let uploads=0, deletes=0, calls=[];
  const variables={SUPABASE_URL:'https://isolated.invalid',SUPABASE_ANON_KEY:'public-test',SUPABASE_SERVICE_ROLE_KEY:'service-test'};
  const userClient={
    auth:{getUser:async token=>{assert.equal(token,'test-user-token');return {data:{user:authError?null:{id:user}},error:authError?new Error('bad token'):null};}},
    rpc:async (name,params)=>{
      assert.equal(name,'reserve_receipt_upload'); calls.push(params);
      return {data:reserveError?null:{id:reservationId,user_id:user,order_id:order,path},error:reserveError};
    }
  };
  const serviceClient={
    storage:{from:bucket=>{
      assert.equal(bucket,'payment-receipts');
      return {
        upload:async (target,bytes,options)=>{
          assert.equal(target,path); assert.deepEqual(bytes,png); assert.equal(options.contentType,'image/png'); assert.equal(options.upsert,false);
          uploads++; return {error:uploadError?new Error('internal upload failure'):null};
        },
        remove:async paths=>{assert.deepEqual(paths,[path]);deletes++;return {error:null};}
      };
    }},
    from:table=>{
      assert.equal(table,'receipt_uploads');
      const builder={
        update(data){calls.push(data);return this;},eq(){return this;},select(){return this;},
        async single(){return {data:saveError?null:{id:reservationId},error:saveError?new Error('internal update failure'):null};},
        then(resolve,reject){return Promise.resolve({data:null,error:null}).then(resolve,reject);}
      };
      return builder;
    }
  };
  const handler=createUploadHandler({env:name=>variables[name],createClient:(url,key,options)=>{
    assert.equal(url,variables.SUPABASE_URL);
    if(key===variables.SUPABASE_ANON_KEY){assert.equal(options.global.headers.Authorization,'Bearer test-user-token');return userClient;}
    assert.equal(key,variables.SUPABASE_SERVICE_ROLE_KEY); assert.equal(options.auth.persistSession,false);return serviceClient;
  }});
  const request=({origin='https://aljahfalidigital.com',token=true,data=png,type='image/png',orderId=order,headers={}}={})=>{
    const form=new FormData();form.set('order_id',orderId);form.set('file',new Blob([data],{type}),'proof.png');
    return new Request('https://isolated.invalid/functions/v1/upload-payment-receipt',{method:'POST',body:form,
      headers:{Origin:origin,...token?{Authorization:'Bearer test-user-token'}:{},...headers}});
  };
  assert.equal((await handler(request({origin:'https://untrusted.invalid'}))).status,403);
  assert.equal((await handler(request({token:false}))).status,401);
  assert.equal((await handler(new Request('https://isolated.invalid',{method:'OPTIONS',headers:{Origin:'https://aljahfalidigital.com'}}))).status,204);
  authError=true;assert.equal((await handler(request())).status,401);authError=false;
  assert.equal((await handler(request({data:new TextEncoder().encode('<html>not a receipt</html>')}))).status,400);
  assert.equal((await handler(request({type:'image/jpeg'}))).status,400);
  assert.equal((await handler(request({headers:{'Content-Length':String(MAX_RECEIPT_BYTES+100000)}}))).status,413);
  assert.equal(uploads,0);
  reserveError={message:'ORDER_NOT_PAYABLE'};assert.equal((await handler(request())).status,403);
  reserveError={message:'UPLOAD_RATE_LIMIT'};assert.equal((await handler(request())).status,429);reserveError=null;
  assert.equal(uploads,0);
  const good=await handler(request());assert.equal(good.status,200);assert.deepEqual(await good.json(),{path});
  assert.equal(good.headers.get('Access-Control-Allow-Origin'),'https://aljahfalidigital.com');
  assert.equal(uploads,1);
  assert.ok(calls.some(x=>x.p_order_id===order && x.p_size_bytes===png.byteLength && x.p_mime_type==='image/png'));
  assert.ok(calls.some(x=>x.status==='uploaded'));
  uploadError=true;const failed=await handler(request());assert.equal(failed.status,502);assert.deepEqual(await failed.json(),{error:'UPLOAD_FAILED'});uploadError=false;
  assert.ok(calls.some(x=>x.status==='failed'));
  saveError=true;assert.equal((await handler(request())).status,502);assert.equal(deletes,1);
  return 'receipt image byte validation and edge upload authentication, ownership, limits, success/failure paths';
}
