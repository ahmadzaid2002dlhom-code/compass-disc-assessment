import {randomBytes} from 'node:crypto';
import {readState,writeState} from './db.js';
import {sha256,fail,normalizeUsername,validatePassword,hashPassword,verifyPassword} from './security.js';
export {sha256,fail,normalizeUsername,validatePassword,hashPassword,verifyPassword} from './security.js';
const COOKIE='disc_session',MAX_AGE=7*86400*1000;
function cookieOptions(req){return {httpOnly:true,secure:req.secure||req.get('x-forwarded-proto')==='https',sameSite:'lax',path:'/',maxAge:MAX_AGE};}
function extract(req){const found=(req.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));return found?.slice(COOKIE.length+1)||null;}
export async function session(req){const token=extract(req);if(!token||!/^[-_a-zA-Z0-9]{30,100}$/.test(token))return null;return readState(db=>{const s=db.sessions[sha256(token)];if(!s||Date.parse(s.expiresAt)<=Date.now())return null;if(s.principal==='staff'){const staff=db.staff_users[s.staffUsername];return staff?{principal:'staff',staff_username:s.staffUsername,role:staff.role}:null;}const participant=db.participants.find(p=>p.id===s.participantId);return participant?.source==='invited'?{principal:'participant',participant_id:s.participantId}:null;});}
export async function authorize(req,type,role){const s=await session(req);if(!s)fail('Please sign in.',401);if(s.principal!==type||(role&&s.role!==role))fail('Access denied.',403);return s;}
export async function issueSession(req,res,kind,userId){const old=extract(req),token=randomBytes(32).toString('base64url');await writeState(db=>{if(old)delete db.sessions[sha256(old)];db.sessions[sha256(token)]={principal:kind,participantId:kind==='participant'?userId:null,staffUsername:kind==='staff'?userId:null,expiresAt:new Date(Date.now()+MAX_AGE).toISOString()};});res.cookie(COOKIE,token,cookieOptions(req));}
export async function endSession(req,res){const old=extract(req);if(old)await writeState(db=>{delete db.sessions[sha256(old)];});res.clearCookie(COOKIE,{...cookieOptions(req),maxAge:undefined});}
const failures=new Map();export function limitLogin(req,username){const key=`${req.ip}:${username}`,now=Date.now();const r=failures.get(key)||{since:now,count:0};if(now-r.since>15*60*1000){r.since=now;r.count=0;}if(++r.count>15)fail('Too many attempts. Try again later.',429);failures.set(key,r);}
export function originGuard(req){const origin=req.get('origin');if(!origin)return;let host;try{host=new URL(origin).host;}catch{fail('Invalid origin.',403)}if(host!==req.get('host'))fail('Cross-site request rejected.',403);}
