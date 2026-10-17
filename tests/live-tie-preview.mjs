const base='https://compass-disc-assessment.onrender.com';
try {
  const start=performance.now();
  const response=await fetch(base+'/api/?action=tie-demo',{signal:AbortSignal.timeout(30000)});
  const payload=await response.json();
  const elapsed=Math.round(performance.now()-start);
  if(response.status!==200)throw Error('HTTP '+response.status+': '+JSON.stringify(payload).slice(0,300));
  if(!payload.demo)throw Error('Missing demo marker');
  const r=payload.result;
  const expected={D:35,I:35,S:35,C:35};
  if(JSON.stringify(r.scores)!==JSON.stringify(expected))throw Error('Scores mismatch: '+JSON.stringify(r.scores));
  if(r.totalPoints!==140||r.profileStatus!=='TIED'||r.profileCode!==null)throw Error('Incorrect tie status or total');
  if(r.candidateProfiles?.length!==12)throw Error('Expected 12 profiles, got '+r.candidateProfiles?.length);
  if(new Set(r.candidateProfileCodes).size!==12)throw Error('Duplicate profile codes');
  for(const p of r.candidateProfiles){
    if(!p?.code||!p.descriptionAr?.trim()||p.nameAr!==p.descriptionAr)throw Error('Bad Excel profile '+JSON.stringify(p));
  }
  const page=await fetch(base+'/?demo=tie',{signal:AbortSignal.timeout(30000)});
  const html=await page.text();
  if(page.status!==200||!html.includes('Compass · DISC Assessment'))throw Error('Demo page not served');
  console.log('LIVE FULL TIE DEMO PASSED, '+elapsed+'ms');
  console.log('scores='+JSON.stringify(r.scores)+' total='+r.totalPoints+' candidate profiles='+r.candidateProfileCodes.length);
  console.log('candidate names: '+r.candidateProfiles.map(p=>p.code+': '+p.descriptionAr).join(' | '));
}catch(error){console.error('LIVE FULL TIE DEMO FAILED',error.stack||error);process.exitCode=1;}
