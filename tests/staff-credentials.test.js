import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../api/security.js';
import {syncStaffCredentials} from '../api/staff-credentials.js';

test('staff credentials are created from the Render environment', async()=>{
  const state={staff_users:{}};
  const env={STAFF_MANAGER_PASSWORD:'manager-Secret-123',STAFF_FACILITATOR_PASSWORD:'facilitator-Secret-321'};
  const status=await syncStaffCredentials(state,env,hashPassword,verifyPassword);
  assert.deepEqual(status.configured,['facilitator','manager']);
  assert.deepEqual(status.missing,[]);
  assert.equal(await verifyPassword(env.STAFF_MANAGER_PASSWORD,state.staff_users.manager.password_hash),true);
  assert.equal(await verifyPassword(env.STAFF_FACILITATOR_PASSWORD,state.staff_users.facilitator.password_hash),true);
  assert.equal(state.staff_users.manager.role,'manager');
});

test('changing a Render password replaces old hash and preserves other account',async()=>{
  const state={staff_users:{}};
  const env={STAFF_MANAGER_PASSWORD:'manager-Secret-123',STAFF_FACILITATOR_PASSWORD:'facilitator-Secret-321'};
  await syncStaffCredentials(state,env,hashPassword,verifyPassword);
  const facilitatorHash=state.staff_users.facilitator.password_hash;
  env.STAFF_MANAGER_PASSWORD='new-manager-Password-234';
  const updated=await syncStaffCredentials(state,env,hashPassword,verifyPassword);
  assert.deepEqual(updated.updated,['manager']);
  assert.equal(await verifyPassword('manager-Secret-123',state.staff_users.manager.password_hash),false);
  assert.equal(await verifyPassword(env.STAFF_MANAGER_PASSWORD,state.staff_users.manager.password_hash),true);
  assert.equal(state.staff_users.facilitator.password_hash,facilitatorHash);
});

test('missing or invalid env does not replace stored credentials',async()=>{
  const old=await hashPassword('original-manager-1');
  const state={staff_users:{manager:{role:'manager',password_hash:old}}};
  const status=await syncStaffCredentials(state,{STAFF_MANAGER_PASSWORD:'short'},hashPassword,verifyPassword);
  assert.deepEqual(status.configured,[]);
  assert.equal(status.missing.length,2);
  assert.equal(state.staff_users.manager.password_hash,old);
  assert.equal(state.staff_users.facilitator,undefined);
});
