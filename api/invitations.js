import {randomBytes,randomUUID} from 'node:crypto';
import {sha256,fail} from './security.js';

export const INVITE_VALID_DAYS=30;
const TOKEN_PATTERN=/^[0-9a-f]{48}$/;

export function createInvitation(name,assessmentVersion,now=new Date()){
  const cleanName=String(name||'').trim();
  if(cleanName.length<2||cleanName.length>80)fail('Name must be 2–80 characters.');
  const token=randomBytes(24).toString('hex');
  return {
    token,
    participant:{
      id:randomUUID(),
      name:cleanName,
      username:null,
      password_hash:null,
      source:'invited',
      status:'INVITED',
      assessmentVersion,
      createdAt:now.toISOString(),
      startedAt:null,
      completedAt:null,
      invite_token_hash:sha256(token),
      invite_expires_at:new Date(now.getTime()+INVITE_VALID_DAYS*86400000).toISOString()
    }
  };
}

export function findInvitation(db,token,now=Date.now()){
  if(typeof token!=='string'||!TOKEN_PATTERN.test(token))fail('Invitation link is invalid.',400);
  const participant=db.participants.find(p=>p.source==='invited'&&p.invite_token_hash===sha256(token));
  if(!participant||!participant.invite_expires_at||Date.parse(participant.invite_expires_at)<=now)
    fail('Invitation link is expired or invalid. Please contact your facilitator for a new invitation.',404);
  return participant;
}

export function redeemInvitation(db,token,now=Date.now()){
  const participant=findInvitation(db,token,now);
  if(participant.status==='INVITED'){
    participant.status='IN_PROGRESS';
    participant.startedAt=new Date(now).toISOString();
  }
  return participant.id;
}
