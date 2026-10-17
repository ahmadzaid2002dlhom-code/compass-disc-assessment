import {get,put} from '@vercel/blob';
import {syncStaffCredentials} from './staff-credentials.js';

const FILE=process.env.APP_DATA_PATH || 'disc-assessment-v2/state.json';
const TOKEN=process.env.BLOB_READ_WRITE_TOKEN;
let previous=Promise.resolve();
let cachedStatePromise=null;

function fresh(){return {participants:[],answers:{},results:{},staff_users:{},sessions:{}};}

async function loadRemote(){
  if(!TOKEN)throw Error('BLOB_READ_WRITE_TOKEN is required');
  const r=await get(FILE,{access:'private',token:TOKEN,useCache:false});
  if(!r)return fresh();
  if(!r.stream)throw Error('Storage response did not include content stream');
  return JSON.parse(await new Response(r.stream).text());
}
function currentState(){
  if(!cachedStatePromise) cachedStatePromise=loadRemote().catch(error=>{cachedStatePromise=null;throw error;});
  return cachedStatePromise;
}
export async function readState(callback){
  const state=await currentState();
  return callback(state);
}
export async function writeState(callback){
  const job=previous.catch(()=>{}).then(async()=>{
    const state=await currentState();
    const copy=structuredClone(state);
    const result=await callback(copy);
    // A single Render instance serializes changes in-process. Overwrite the
    // private blob without ifMatch: get() response ETags are not write version
    // tokens, and passing one caused every registration to fail with 412.
    await put(FILE,JSON.stringify(copy),{
      access:'private',
      token:TOKEN,
      contentType:'application/json',
      allowOverwrite:true,
      addRandomSuffix:false
    });
    cachedStatePromise=Promise.resolve(copy);
    return result;
  });
  previous=job;
  return job;
}
export async function initDb(hashPassword,verifyPassword){
  const status=await writeState(state=>syncStaffCredentials(state,process.env,hashPassword,verifyPassword));
  console.log('Staff credential configuration:',status.configured.join(', ')||'none',
    '| updated:',status.updated.join(', ')||'none');
  if(status.missing.length){
    console.warn('Staff password variables missing or invalid:',status.missing.join(', '));
  }
}
