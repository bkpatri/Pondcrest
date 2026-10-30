import {parseCSV} from './csv';
import plan from './plan.json';
type Config={supabaseUrl:string;supabasePublishableKey:string};
let config:Config|null=null;
async function settings(){
 if(!config){const r=await fetch('./config.json',{cache:'no-store'});if(!r.ok)throw Error('Unable to load the website configuration.');config=await r.json() as Config;}
 if(!config.supabaseUrl||!config.supabasePublishableKey)throw Error('Shared completion is not connected yet. The Supabase project needs to be configured.');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl))throw Error('The Supabase project URL is invalid.');
 if(!config.supabasePublishableKey.startsWith('sb_publishable_'))throw Error('Use a Supabase publishable key for this website.');
 return config;
}
async function api(path:string,options:RequestInit={}){
 const c=await settings();let r:Response;
 try{r=await fetch(c.supabaseUrl.replace(/\/$/,'')+'/rest/v1/punch_completion'+path,{...options,cache:'no-store',headers:{apikey:c.supabasePublishableKey,'Content-Type':'application/json',...options.headers}});}
 catch{throw Error('Unable to reach shared completion storage. Check your connection and retry.');}
 if(!r.ok){if(r.status===409)throw Error('Another person updated this item. The latest status has been loaded; please review it.');throw Error('Shared completion could not be read or saved. Please retry.');}
 return r;
}
export async function readItems(){
 const csv=await fetch('./punch-list.csv',{cache:'no-store'});if(!csv.ok)throw Error('The punch list CSV could not be loaded.');
 const rows=parseCSV(await csv.text());const saved=new Map<string,any>();
 for(let offset=0;;offset+=1000){const r=await api('?select=item_id,complete,revision,updated_at&order=item_id&limit=1000&offset='+offset);const chunk:any[]=await r.json();chunk.forEach(v=>saved.set(v.item_id,v));if(chunk.length<1000)break;}
 const ids=new Set();
 const items=rows.map(row=>{
  const id=row.Name?.trim(),x=Number(row.Easting),y=Number(row.Northing),photo=row['Point photos']?.trim();
  if(!id||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id)||ids.has(id))throw Error('Each CSV row must have a unique Name using letters, numbers, underscores, or hyphens.');ids.add(id);
  if(!row.Easting?.trim()||!row.Northing?.trim()||!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid Easting or Northing for '+id+'.');
  if(!photo||/[\\/]/.test(photo))throw Error('Point photos must contain a single photo filename for '+id+'.');
  const status=saved.get(id);
  return{id,code:row.Code||'',description:row.Description||'',x:(x-plan.originX)/plan.feetPerPixel,y:(plan.originY-y)/plan.feetPerPixel,photo:'./photos/'+encodeURIComponent(photo),status:status?.complete?'verified':'open',revision:status?.revision??-1};
 });
 return{items,history:[],user:{name:'Shared project',email:'Shared completion',reviewer:false}};
}
export async function saveItem(item:{id:string;revision:number},complete:boolean){
 if(item.revision===-1){await api('',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({item_id:item.id,complete})});return;}
 const response=await api('?item_id=eq.'+encodeURIComponent(item.id)+'&revision=eq.'+item.revision,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({complete})});
 const changed:any[]=await response.json();if(changed.length!==1)throw Error('Another person updated this item. The latest status has been loaded; please review it.');
}
