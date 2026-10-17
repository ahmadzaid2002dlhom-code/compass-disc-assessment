import test from 'node:test';
import assert from 'node:assert/strict';
import {createInvitation,findInvitation,redeemInvitation,INVITE_VALID_DAYS} from '../api/invitations.js';

test('each invitation has a distinct opaque token, tied to its participant',()=>{
 const a=createInvitation('Alice','version-1'),b=createInvitation('Bob','version-1');
 assert.notEqual(a.token,b.token);
 assert.notEqual(a.participant.id,b.participant.id);
 assert.equal(a.participant.source,'invited');
 assert.equal(a.participant.name,'Alice');
 assert.equal(a.participant.username,null);
 assert.equal(a.participant.password_hash,null);
 assert.equal(a.participant.invite_token_hash.length,64);
 assert.equal(INVITE_VALID_DAYS,30);
 assert.equal(Object.prototype.hasOwnProperty.call(a.participant,'token'),false);
});
test('link starts assessment without credentials and supports return visits',()=>{
 const invite=createInvitation('Alice','v1');
 const state={participants:[invite.participant]};
 const first=redeemInvitation(state,invite.token);
 assert.equal(first,invite.participant.id);
 assert.equal(invite.participant.status,'IN_PROGRESS');
 const start=invite.participant.startedAt;
 assert.equal(redeemInvitation(state,invite.token),first);
 assert.equal(invite.participant.startedAt,start);
 invite.participant.status='COMPLETED';
 assert.equal(redeemInvitation(state,invite.token),first);
 assert.equal(invite.participant.status,'COMPLETED');
});
test('invalid, expired, or self-registered participant cannot use invitation link',()=>{
 const i=createInvitation('Person','v1',new Date('2026-01-01T00:00:00Z'));
 const state={participants:[i.participant]};
 assert.throws(()=>findInvitation(state,'garbage'),/invalid/);
 assert.throws(()=>findInvitation(state,i.token,Date.parse('2026-02-02T00:00:00Z')),/expired/);
 assert.equal(findInvitation(state,i.token,Date.parse('2026-01-03T00:00:00Z')).id,i.participant.id);
 i.participant.source='self';
 assert.throws(()=>findInvitation(state,i.token,Date.parse('2026-01-03T00:00:00Z')),/expired or invalid/);
});
