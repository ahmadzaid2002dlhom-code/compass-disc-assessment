import {get,put} from '@vercel/blob';

const FILE=process.env.APP_DATA_PATH || 'disc-assessment-v2/state.json';
const TOKEN=process.env.BLOB_READ_WRITE_TOKEN;
let previous=Promise.resolve();
function fresh(){return {participants:[],answers:{},results:{},staff_users:{},sessions:{}};}
async function load(){
  if(!TOKEN)throw Error('BLOB_READ_WRITE_TOKEN is required');
  const r=await get(FILE,{access:'private',token:TOKEN,useCache:false});
  if(!r)return {state:fresh(),etag:null};
  if(!r.stream)throw Error('Storage response did not include content stream');
  const state=JSON.parse(await new Response(r.stream).text());
  return {state,etag:r.etag||r.blob?.etag||null};
}
export async function readState(callback){const {state}=await load();return callback(state);}
export async function writeState(callback){
 const job=previous.catch(()=>{}).then(async()=>{
   // One Render instance serializes writes. Conditional writes reject stale concurrent versions.
   const {state,etag}=await load();
   const copy=structuredClone(state);
   const result=await callback(copy);
   await put(FILE,JSON.stringify(copy),{access:'private',token:TOKEN,contentType:'application/json',allowOverwrite:!!etag,addRandomSuffix:false,...(etag?{ifMatch:etag}:{})});
   return result;
 });
 previous=job;
 return job;
}
export async function initDb(hashPassword){
 await writeState(async state=>{
  for(const role of ['facilitator','manager']){
   const pass=process.env[`STAFF_${role.toUpperCase()}_PASSWORD`];
   if(pass?.length>=8&&!state.staff_users[role]) state.staff_users[role]={password_hash:await hashPassword(pass),role};
  }
 });
}
