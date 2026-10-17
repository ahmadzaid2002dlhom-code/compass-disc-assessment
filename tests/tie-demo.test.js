import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFullTieDemo} from '../api/tie-demo.js';
import {PROFILE_CODES,profileCount} from '../api/scoring.js';

test('complete tie demo uses genuine scoring and returns 35 for D, I, S, C',()=>{
  const result=makeFullTieDemo();
  assert.equal(result.totalPoints,140);
  assert.deepEqual(result.scores,{D:35,I:35,S:35,C:35});
  assert.equal(result.profileStatus,'TIED');
  assert.equal(result.profileCode,null);
  assert.equal(result.profile,null);
  assert.equal(result.hasScoreTie,true);
  assert.equal(result.scoreRanking.length,1);
  assert.deepEqual(result.scoreRanking[0],{rank:1,score:35,dimensions:['D','I','S','C']});
  assert.deepEqual(result.candidateProfileCodes,PROFILE_CODES);
  assert.equal(result.candidateProfiles.length,12);
  for(const item of result.candidateProfiles){
    assert.equal(typeof item.nameAr,'string');
    assert.ok(item.nameAr.trim().length>0);
    assert.equal(item.descriptionAr,item.nameAr);
  }
});

test('demo result is not included in participant cohort counts',()=>{
  const result=makeFullTieDemo();
  const empty=profileCount([]);
  assert.equal(empty.total,0);
  assert.equal(empty.completed,0);
  const withOne=profileCount([{status:'COMPLETED',result}]);
  assert.equal(withOne.completed,1);
  assert.equal(withOne.distribution.TIED,1);
  assert.equal(Object.values(withOne.distribution).reduce((a,b)=>a+b,0),1);
});
