import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeUsername,validatePassword,hashPassword,verifyPassword} from '../api/security.js';
test('participant username normalization and staff-name reservation',()=>{assert.equal(normalizeUsername(' Alice_3 '),'alice_3');assert.throws(()=>normalizeUsername('MANAGER'),/reserved/);assert.throws(()=>normalizeUsername('A!'),/3/);});
test('password minimum length and password hash verification',async()=>{assert.throws(()=>validatePassword('short'),/8/);const hash=await hashPassword('myStr0ngPass!');assert.notEqual(hash,'myStr0ngPass!');assert.equal(await verifyPassword('myStr0ngPass!',hash),true);assert.equal(await verifyPassword('incorrect',hash),false);});
