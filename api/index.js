import express from 'express';
import {randomBytes,randomUUID} from 'node:crypto';
import {readState,writeState} from './db.js';
import {sha256,fail,normalizeUsername,validatePassword,hashPassword,verifyPassword,session,authorize,issueSession,endSession,limitLogin,originGuard} from './auth.js';
import {getPublicAssessment,scoreAssessment,validateOne,profileCount,assessmentVersion} from './scoring.js';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});try{if(!['GET','HEAD'].includes(req.method))originGuard(req);next();}catch(e){next(e);}});
function asPublic(p,db){if(!p)return null;const {password_hash,invite_token_hash,invite_expires_at,...basic}=p;return {...basic,result:db.results[p.id]||null};}
const participant=id=>readState(db=>asPublic(db.participants.find(p=>p.id===id),db));
const participants=()=>readState(db=>db.participants.toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(p=>asPublic(p,db)));
app.get('/',async(req,res,next)=>{try{const action=String(req.query.action||'');
 if(action==='health')return res.json({ok:true,assessmentVersion});
 if(action==='me'){const user=await session(req);if(!user)return res.json({authenticated:false});if(user.principal==='participant'){const p=await participant(user.participant_id);return res.json(p?{authenticated:true,type:'participant',participant:p}:{authenticated:false});}return res.json({authenticated:true,type:'staff',role:user.role,username:user.staff_username});}
 if(action==='assessment'){const s=await authorize(req,'participant');const {p,answers}=await readState(db=>({p:asPublic(db.participants.find(p=>p.id===s.participant_id),db),answers:db.answers[s.participant_id]||{}}));if(!p)fail('Participant not found.',404);if(p.assessmentVersion!==assessmentVersion)fail('The assessment version is no longer available.',409);return res.json({assessment:getPublicAssessment(),status:p.status,answers});}
 if(action==='my-result'){const s=await authorize(req,'participant');const p=await participant(s.participant_id);if(!p)fail('Participant not found.',404);if(!p.result)fail('Assessment not completed.',409);return res.json({name:p.name,result:p.result,completedAt:p.completedAt});}
 if(action==='participants'||action==='summary'){const s=await authorize(req,'staff');if(action==='summary'&&s.role!=='manager')fail('Manager access required.',403);const rows=await participants();return res.json(action==='summary'?{...profileCount(rows),participants:rows}:{participants:rows});}
 if(action==='report'){await authorize(req,'staff');const p=await participant(String(req.query.id||''));if(!p)fail('Participant not found.',404);if(!p.result)fail('Participant has not finished.',409);return res.json({participant:p});}
 fail('Unknown endpoint.',404);
}catch(e){next(e);}});
app.post('/',async(req,res,next)=>{try{const action=String(req.query.action||'');
 if(action==='register'){
   const username=normalizeUsername(req.body?.username),password=validatePassword(req.body?.password),token=String(req.body?.inviteToken||'');limitLogin(req,username);const hash=await hashPassword(password);
   const id=await writeState(db=>{
     if(db.participants.some(p=>p.username===username))fail('Username is already taken.',409);
     if(token){if(!/^[0-9a-f]{48}$/.test(token))fail('Invitation link is invalid.',400);const p=db.participants.find(p=>p.invite_token_hash===sha256(token));if(!p||p.username||p.status==='COMPLETED'||!p.invite_expires_at||new Date(p.invite_expires_at)<new Date())fail('Invitation expired or already used.',404);Object.assign(p,{username,password_hash:hash,status:'IN_PROGRESS',startedAt:new Date().toISOString(),invite_token_hash:null,invite_expires_at:null});return p.id;}
     const id=randomUUID();db.participants.push({id,username,password_hash:hash,name:username,source:'self',status:'IN_PROGRESS',assessmentVersion,createdAt:new Date().toISOString(),startedAt:new Date().toISOString(),completedAt:null});return id;
   });await issueSession(req,res,'participant',id);return res.status(201).json({participant:await participant(id)});
 }
 if(action==='login'){
   const raw=String(req.body?.username||'').trim().toLowerCase(),password=String(req.body?.password||'');if(!/^[a-z0-9_]{3,30}$/.test(raw))fail('Incorrect username or password.',401);limitLogin(req,raw);
   if(raw==='manager'||raw==='facilitator'){const s=await readState(db=>db.staff_users[raw]);if(!s||!await verifyPassword(password,s.password_hash))fail('Incorrect username or password.',401);await issueSession(req,res,'staff',raw);return res.json({type:'staff',role:raw});}
   const s=await readState(db=>db.participants.find(p=>p.username===raw));if(!s||!await verifyPassword(password,s.password_hash))fail('Incorrect username or password.',401);await issueSession(req,res,'participant',s.id);return res.json({type:'participant',participant:await participant(s.id)});
 }
 if(action==='logout'){await endSession(req,res);return res.json({ok:true});}
 if(action==='invite'){await authorize(req,'staff');const name=String(req.body?.name||'').trim();if(name.length<2||name.length>80)fail('Name must be 2–80 characters.');const token=randomBytes(24).toString('hex'),id=randomUUID();await writeState(db=>db.participants.push({id,username:null,password_hash:null,name,source:'invited',status:'INVITED',assessmentVersion,createdAt:new Date().toISOString(),startedAt:null,completedAt:null,invite_token_hash:sha256(token),invite_expires_at:new Date(Date.now()+7*86400000).toISOString()}));return res.status(201).json({participant:await participant(id),inviteToken:token});}
 if(action==='save-answer'){const s=await authorize(req,'participant'),groupId=String(req.body?.groupId||''),rankedWordIds=req.body?.rankedWordIds;validateOne(groupId,rankedWordIds);const n=await writeState(db=>{const p=db.participants.find(p=>p.id===s.participant_id);if(!p)fail('Participant not found.',404);if(p.status==='COMPLETED')fail('Assessment already completed.',409);if(p.assessmentVersion!==assessmentVersion)fail('Wrong assessment version.',409);db.answers[p.id]??={};db.answers[p.id][groupId]=rankedWordIds;p.status='IN_PROGRESS';p.startedAt??=new Date().toISOString();return Object.keys(db.answers[p.id]).length;});return res.json({saved:true,confirmedCount:n});}
 if(action==='submit'){const s=await authorize(req,'participant');const result=await writeState(db=>{const p=db.participants.find(p=>p.id===s.participant_id);if(!p)fail('Participant not found.',404);if(p.status==='COMPLETED'&&db.results[p.id])return db.results[p.id];if(p.assessmentVersion!==assessmentVersion)fail('Wrong assessment version.',409);const a=Object.entries(db.answers[p.id]||{}).map(([groupId,rankedWordIds])=>({groupId,rankedWordIds}));const result=scoreAssessment(a);db.results[p.id]=result;p.status='COMPLETED';p.completedAt=new Date().toISOString();return result;});return res.json({result});}
 fail('Unknown endpoint.',404);
}catch(e){next(e);}});
app.use((e,req,res,_next)=>{const status=e.status||500;if(status>=500)console.error('DISC server error',e.code||e.name,e.message);res.status(status).json({error:status>=500?'Server error. Try again.':e.message});});
export default app;
