import {randomBytes} from 'node:crypto';
const base=process.env.DISC_SITE||'https://compass-disc-assessment.onrender.com';
const username='smoketest_'+randomBytes(4).toString('hex');
const password='TestAccount-'+randomBytes(12).toString('hex');
let cookie='';
const timings=[];
async function check(name,path,{method='GET',body=null,expect=200}={}){
 const start=performance.now();
 const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),90000);
 try{
  const response=await fetch(base+path,{method,redirect:'follow',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
  const duration=+(performance.now()-start).toFixed(1);
  const raw=await response.text();
  const result=raw.startsWith('{')?JSON.parse(raw):raw;
  if(response.status!==expect)throw Error(name+' HTTP '+response.status+' expected '+expect+' body='+JSON.stringify(result).slice(0,250));
  const setCookie=response.headers.get('set-cookie');if(setCookie)cookie=setCookie.split(';')[0];
  console.log('TIMING '+name+' '+duration+'ms HTTP '+response.status);
  timings.push({name,ms:duration});
  return result;
 }finally{clearTimeout(timeout);}
}
try{
 const homepage=await check('homepage','/');
 if(!homepage.includes('<html'))throw Error('Homepage did not return HTML');
 const health=await check('health','/api/?action=health');
 if(!health.ok)throw Error('Health endpoint not ok');
 await check('register','/api/?action=register',{method:'POST',expect:201,body:{username,password}});
 if(!cookie)throw Error('Registration did not create a session');
 const me=await check('participant session','/api/?action=me');
 if(!me.authenticated)throw Error('Participant session not authenticated');
 const a=await check('load assessment','/api/?action=assessment');
 if(a.assessment?.groups?.length!==14)throw Error('Missing 14 assessment groups: '+JSON.stringify(a).slice(0,450));
 const groups=a.assessment.groups;
 const ordered=g=>g.words.map(w=>w.id);
 await check('save answer 1','/api/?action=save-answer',{method:'POST',body:{groupId:groups[0].id,rankedWordIds:ordered(groups[0])}});
 await check('logout','/api/?action=logout',{method:'POST'});
 cookie='';
 await check('login','/api/?action=login',{method:'POST',body:{username,password}});
 const resumed=await check('resume assessment','/api/?action=assessment');
 if(!resumed.answers?.[groups[0].id])throw Error('Saved answer missing after logout/login');
 for(let i=1;i<groups.length;i++)await check('save answer '+(i+1),'/api/?action=save-answer',{method:'POST',body:{groupId:groups[i].id,rankedWordIds:ordered(groups[i])}});
 const submitted=await check('submit 14 answers','/api/?action=submit',{method:'POST'});
 if(!submitted.result?.scores)throw Error('No DISC result returned');
 const result=await check('read DISC report','/api/?action=my-result');
 if(!result?.result?.scores)throw Error('Report missing scores');
 console.log('RESULT VALID scores='+Object.values(result.result.scores).join(',')+' total='+result.result.totalPoints);
 await check('logout final','/api/?action=logout',{method:'POST'});
 cookie='';
 await check('login completed','/api/?action=login',{method:'POST',body:{username,password}});
 await check('read report after login','/api/?action=my-result');
 const sorted=timings.map(x=>x.ms).sort((a,b)=>a-b);
 const sum=timings.reduce((a,b)=>a+b.ms,0);
 console.log('SUMMARY '+JSON.stringify({requests:timings.length,totalMs:+sum.toFixed(0),medianMs:sorted[Math.floor(sorted.length/2)],p95Ms:sorted[Math.floor(sorted.length*.95)],slowest:timings.reduce((a,b)=>a.ms>b.ms?a:b)}));
 console.log('LIVE SMOKE TEST PASSED');
}catch(e){console.error('LIVE SMOKE TEST FAILED',e.stack||String(e));process.exitCode=1;}
