import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export function fail(message,status=400){const error=new Error(message);error.status=status;throw error;}
export function normalizeUsername(raw){const name=String(raw||'').trim().toLowerCase();if(!/^[a-z0-9_]{3,30}$/.test(name))fail('Username must be 3–30 characters: letters, numbers or underscores.');if(['manager','facilitator'].includes(name))fail('This username is reserved.');return name;}
export function validatePassword(value){if(typeof value!=='string'||value.length<8||value.length>128)fail('Password must be 8–128 characters.');return value;}
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);}
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');return `${salt}:${(await scrypt(password,salt,64)).toString('hex')}`;}
export async function verifyPassword(password,hash){if(typeof hash!=='string'||!hash.includes(':'))return false;const [salt,expected]=hash.split(':');try{return equal((await scrypt(password,salt,64)).toString('hex'),expected);}catch{return false;}}
