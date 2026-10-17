import seed from '../data/seed-v1_2.json' with {type:'json'};
import {scoreAssessment} from './scoring.js';

// A read-only demo driven by the same scoring engine as real assessments.
// Seven groups use each order, so all four dimensions receive 35 points.
// It never creates accounts, invitations, answers, or dashboard records.
export function makeFullTieDemo(){
  const orders=[['D','I','S','C'],['C','S','I','D']];
  const answers=seed.groups.map((group,index)=>{
    const rankedWordIds=orders[index%2].map(dimension=>{
      const word=group.words.find(word=>word.dimension===dimension);
      if(!word)throw Error('Assessment seed has an incomplete DISC group');
      return word.id;
    });
    return {groupId:group.id,rankedWordIds};
  });
  return scoreAssessment(answers);
}
