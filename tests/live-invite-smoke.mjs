const base='https://compass-disc-assessment.onrender.com';
const results=[];
async function check(label,pathname,{method='GET',body,expected=200,fragment}={}){
 const start=performance.now();
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),75000);
 try{
  const r=await fetch(base+pathname,{method,signal:controller.signal,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const raw=await r.text();const ms=Math.round(performance.now()-start);
  console.log(label+': HTTP '+r.status+' '+ms+'ms');
  if(r.status!==expected)throw Error(label+' expected HTTP '+expected+' got '+r.status+' response '+raw.slice(0,400));
  results.push({label,status:r.status,ms});
  if(fragment&&raw.includes(fragment)===false)throw Error(label+' missing expected content');
  return raw.startsWith('{')?JSON.parse(raw):raw;
 }finally{clearTimeout(timeout)}
}
try{
 await check('landing page','/',{fragment:'Compass · DISC Assessment'});
 const health=await check('health','/api/?action=health');if(!health.ok)throw Error('Health not okay');
 await check('unauthenticated me','/api/?action=me');
 await check('self registration disabled','/api/?action=register',{method:'POST',body:{username:'randomtrial',password:'DemoPass2026!'},expected:404});
 await check('participant username login disabled','/api/?action=login',{method:'POST',body:{username:'randomtrial',password:'DemoPass2026!'},expected:403});
 await check('unknown invitation rejected','/api/?action=redeem-invite',{method:'POST',body:{token:'a'.repeat(48)},expected:404});
 await check('malformed invitation rejected','/api/?action=redeem-invite',{method:'POST',body:{token:'invalid'},expected:400});
 await check('assessment requires invite','/api/?action=assessment',{expected:401});
 await check('staff dashboard protected','/api/?action=participants',{expected:401});
 await check('manager summary protected','/api/?action=summary',{expected:401});
 await check('invite creation protected','/api/?action=invite',{method:'POST',body:{name:'Unauthorized Visitor'},expected:401});
 console.log('PUBLIC INVITATION-ONLY SMOKE PASSED: '+results.length+'/'+results.length);
 console.log('TIMING '+JSON.stringify(results));
}catch(e){console.error('PUBLIC SMOKE FAILED:',e.stack||String(e));process.exitCode=1;}
