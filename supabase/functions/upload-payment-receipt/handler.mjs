import { inspectReceiptImage, MAX_RECEIPT_BYTES } from './image-validation.mjs';

const MAX_BODY_BYTES = MAX_RECEIPT_BYTES + 64 * 1024;
const authOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
function configuredKey(env, dictionary, fallback) {
  const legacy = env(fallback);
  if (legacy) return legacy;
  try { return JSON.parse(env(dictionary) || '{}').default || ''; } catch { return ''; }
}
async function boundedFormData(request) {
  if (!request.body || !request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new Error('INVALID_FORM');
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
  const reader = request.body.getReader(); const chunks = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const data = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { data.set(chunk,offset); offset += chunk.byteLength; }
  return new Response(data,{ headers: { 'content-type':request.headers.get('content-type') } }).formData();
}

/** Dependencies are injected so ownership/error paths can be tested without network or secrets. */
export function createUploadHandler({ createClient, env }) {
  return async request => {
    const origin = request.headers.get('origin');
    const allowed = (env('RECEIPT_ALLOWED_ORIGINS') || 'https://aljahfalidigital.com,https://www.aljahfalidigital.com').split(',').map(x=>x.trim()).filter(Boolean);
    const headers = {
      'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type,x-supabase-api-version',
      'Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'
    };
    if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const respond = (status,data) => new Response(JSON.stringify(data),{status,headers});
    if (origin && !allowed.includes(origin)) return respond(403,{error:'ORIGIN_NOT_ALLOWED'});
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (request.method !== 'POST') return respond(405,{error:'METHOD_NOT_ALLOWED'});
    const authorization = request.headers.get('authorization') || '';
    if (!/^Bearer\s+\S+$/i.test(authorization)) return respond(401,{error:'AUTH_REQUIRED'});
    const url = env('SUPABASE_URL');
    const publicKey = configuredKey(env,'SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
    const serviceKey = configuredKey(env,'SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !publicKey || !serviceKey) return respond(503,{error:'UPLOAD_NOT_CONFIGURED'});
    try {
      const userClient = createClient(url,publicKey,{auth:authOptions,global:{headers:{Authorization:authorization}}});
      const { data:authData,error:authError } = await userClient.auth.getUser(authorization.replace(/^Bearer\s+/i,''));
      if (authError || !authData?.user?.id) return respond(401,{error:'AUTH_REQUIRED'});
      const form = await boundedFormData(request);
      const orderId = form.get('order_id'); const file = form.get('file');
      if (typeof orderId !== 'string' || !/^ORD-[A-Z0-9-]{1,80}$/.test(orderId) ||
          !file || typeof file === 'string' || typeof file.arrayBuffer !== 'function' || file.size > MAX_RECEIPT_BYTES) {
        return respond(400,{error:'INVALID_UPLOAD'});
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const image = inspectReceiptImage(bytes,file.type);
      // This RPC authenticates again, checks order ownership/payability and enforces 10 reservations/hour.
      const { data:reservation,error:reservationError } = await userClient.rpc('reserve_receipt_upload',{
        p_order_id:orderId,p_mime_type:image.type,p_size_bytes:image.bytes
      });
      if (reservationError) return respond(reservationError.message?.includes('UPLOAD_RATE_LIMIT')?429:403,{error:reservationError.message?.includes('UPLOAD_RATE_LIMIT')?'UPLOAD_RATE_LIMIT':'ORDER_NOT_PAYABLE'});
      if (!reservation?.id || reservation.user_id !== authData.user.id || reservation.order_id !== orderId ||
          !reservation.path?.startsWith(`${authData.user.id}/${orderId}/`)) return respond(500,{error:'UPLOAD_FAILED'});
      const service = createClient(url,serviceKey,{auth:authOptions});
      const bucket = service.storage.from('payment-receipts');
      const { error:uploadError } = await bucket.upload(reservation.path,bytes,{contentType:image.type,cacheControl:'0',upsert:false});
      if (uploadError) {
        await service.from('receipt_uploads').update({status:'failed'}).eq('id',reservation.id).eq('user_id',authData.user.id);
        return respond(502,{error:'UPLOAD_FAILED'});
      }
      const { data:saved,error:saveError } = await service.from('receipt_uploads').update({status:'uploaded',uploaded_at:new Date().toISOString()})
        .eq('id',reservation.id).eq('user_id',authData.user.id).eq('status','reserved').select('id').single();
      if (saveError || !saved) {
        await bucket.remove([reservation.path]);
        return respond(502,{error:'UPLOAD_FAILED'});
      }
      return respond(200,{path:reservation.path});
    } catch (error) {
      if (error?.message === 'BODY_TOO_LARGE') return respond(413,{error:'FILE_TOO_LARGE'});
      if (error?.message === 'INVALID_RECEIPT_IMAGE' || error?.message === 'INVALID_FORM' || error instanceof TypeError) return respond(400,{error:'INVALID_RECEIPT_IMAGE'});
      // Do not disclose JWTs, storage paths, internal exceptions or service credentials.
      return respond(500,{error:'UPLOAD_FAILED'});
    }
  };
}
