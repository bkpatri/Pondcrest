import {readItems,saveItem} from './shared';
import {useState,useEffect,useRef,useCallback} from 'react';
import plan from './plan.json';
type Status='open'|'ready'|'verified';
type Item={id:string;code:string;description:string;x:number;y:number;photo:string;status:Status;revision:number};
type Event={id:string;item_id:string;status:Status;actor_name:string;updated_at:string;note:string};
const labels={open:'Open',ready:'Complete',verified:'Complete'};
const colors={open:'#ce6a23',ready:'#3379a3',verified:'#397b5a'};
const initialView={x:3540,y:1400,w:1080,h:1020};
function fitItems(list:Item[]){
 if(!list.length)return initialView;
 const xs=list.map(i=>i.x),ys=list.map(i=>i.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const padding=Math.max(100,Math.max(maxX-minX,maxY-minY)*.12);
 return{x:minX-padding,y:minY-padding,w:maxX-minX+padding*2,h:maxY-minY+padding*2};
}
export default function PunchApp(){
 const [items,setItems]=useState<Item[]>([]),[history,setHistory]=useState<Event[]>([]),[user,setUser]=useState<{name:string;email:string;reviewer:boolean}|null>(null);
 const [selected,setSelected]=useState<string|null>(null),[hover,setHover]=useState<string|null>(null),[query,setQuery]=useState(''),[filter,setFilter]=useState('all');
 const [view,setView]=useState(initialView),[error,setError]=useState(''),[auth,setAuth]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[note,setNote]=useState(''),[notice,setNotice]=useState(''),[photoOpen,setPhotoOpen]=useState(false);
 const [mobile,setMobile]=useState<'map'|'list'>('map');
 const initialFit=useRef(false);
 const svg=useRef<SVGSVGElement|null>(null),drag=useRef<{x:number;y:number;view:typeof view;moved:boolean}|null>(null),request=useRef(0),savingRef=useRef(false);
 const load=useCallback(async()=>{
  const seq=++request.current;
  try{const d:any=await readItems();const r={ok:true,status:200};if(seq!==request.current)return;if(!r.ok){if(r.status===401)setAuth(true);throw Error(d.error||'Unable to load items.');}
   setItems(d.items);if(!initialFit.current){setView(fitItems(d.items));initialFit.current=true;}setHistory(d.history);setUser(d.user);setError('');setAuth(false);
  }catch(e:any){if(seq===request.current)setError(e.message||'Connection unavailable.');}finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();const timer=setInterval(()=>{if(!document.hidden&&!savingRef.current)load();},20000);const focus=()=>{if(!savingRef.current)load();};window.addEventListener('focus',focus);return()=>{clearInterval(timer);window.removeEventListener('focus',focus);};},[load]);
 useEffect(()=>{const hash=decodeURIComponent(location.hash.slice(1));if(hash)setSelected(hash);},[]);
 useEffect(()=>{setNote('');setPhotoOpen(false);setNotice('');},[selected]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(photoOpen)setPhotoOpen(false);else setSelected(null);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[photoOpen]);
 const filtered=items.filter(i=>(filter==='all'||i.status===filter)&&`${i.id} ${i.code} ${i.description}`.toLowerCase().includes(query.toLowerCase()));
 const current=items.find(i=>i.id===selected),tip=items.find(i=>i.id===hover),counts={open:items.filter(i=>i.status==='open').length,ready:items.filter(i=>i.status==='ready').length,verified:items.filter(i=>i.status==='verified').length};
 function choose(i:Item,center=false){setSelected(i.id);setHover(null);window.history.replaceState(null,'','#'+encodeURIComponent(i.id));if(center)setView(v=>({...v,x:i.x-v.w/2,y:i.y-v.h/2}));}
 function zoom(factor:number){setView(v=>{const w=Math.min(plan.width*1.3,Math.max(120,v.w*factor)),h=w*v.h/v.w;return{x:v.x+(v.w-w)/2,y:v.y+(v.h-h)/2,w,h};});}
 function at(e:{clientX:number;clientY:number}){const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.current!.getScreenCTM()!.inverse());}
 async function update(action:string){if(!current||savingRef.current)return;savingRef.current=true;setSaving(true);setNotice('');
  try{await saveItem(current,action!=='reopen');setNote('');setNotice('Saved — visible to the whole team.');}
  catch(e:any){setNotice(e.message);}finally{await load();savingRef.current=false;setSaving(false);}
 }
 return <div className="app-shell">
  <header className="topbar"><a className="brand" href="./" aria-label="Habersham punch list home"><span className="brand-mark">H</span><span>HABERSHAM<small>SITE PUNCH LIST</small></span></a><div className="project-heading"><span className="eyebrow">FIELD COORDINATION</span><h1>Pondcrest punch list</h1></div><div className="identity"><span className="live-dot"/>Shared project{user&&<small>Shared completion status</small>}</div></header>
  <div className="summary"><div className="summary-intro"><strong>{items.length||'—'} items</strong><span>One plan. Every detail accounted for.</span></div><div className="stat-buttons">{(['open','verified'] as Status[]).map(s=><button key={s} onClick={()=>setFilter(filter===s?'all':s)} className={filter===s?'stat active':'stat'}><i style={{background:colors[s]}}/><b>{loading?'—':counts[s]}</b><span>{s==='verified'?'Complete':'Open'}</span></button>)}</div><div className="progress"><span><b>{counts.verified}</b> of {items.length} complete</span><div><i style={{width:`${items.length?counts.verified/items.length*100:0}%`}}/></div></div></div>
  {error&&<div className="error-banner" role="alert">{error} {auth?<button onClick={load}>Retry</button>:<button onClick={load}>Retry</button>}</div>}
  <div className="mobile-switch"><button className={mobile==='map'?'active':''} onClick={()=>setMobile('map')}>Site map</button><button className={mobile==='list'?'active':''} onClick={()=>setMobile('list')}>Item list</button></div>
  <main className={'workspace mobile-'+mobile}>
   <aside className="item-list"><div className="list-tools"><label className="search"><span>⌕</span><input aria-label="Search punch list" placeholder="Search item or description…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="list-caption"><span>{filtered.length} ITEMS</span><select aria-label="Filter by status" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="verified">Complete</option></select></div></div><div className="list-scroll">{loading?<p className="empty">Loading shared punch list…</p>:filtered.length===0?<p className="empty">{error?'Sign in or retry to load the items.':'No items match your search.'}</p>:filtered.map(i=><button key={i.id} className={'item-row '+(selected===i.id?'selected':'')} onClick={()=>{choose(i,true);setMobile('map');}}><span className="item-id"><i style={{background:colors[i.status]}}/>{i.id}</span><span className="row-copy"><strong>{i.description}</strong><small>{i.code} <span>·</span> {labels[i.status]}</small></span><span className="row-arrow">↗</span></button>)}</div><div className="list-footer"><span>↻</span> Statuses refresh every 20 seconds</div></aside>
   <section className="map-panel" aria-label="Interactive site plan"><div className="map-title"><span className="eyebrow">SITE PLAN</span><span>Hover to preview · Click to review</span></div>
    <svg ref={svg} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="site-map" role="img" aria-label="Georeferenced site plan with punch list markers" onPointerDown={e=>{if(e.target!==e.currentTarget && !(e.target as Element).classList.contains('plan-image'))return;const p=at(e);drag.current={x:p.x,y:p.y,view:{...view},moved:false};e.currentTarget.setPointerCapture(e.pointerId);setHover(null);}} onPointerMove={e=>{if(!drag.current)return;const p=at(e),dx=p.x-drag.current.x,dy=p.y-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.current.moved=true;setView(v=>({...v,x:v.x-dx,y:v.y-dy}));}} onPointerUp={e=>{drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{drag.current=null;}} onWheel={e=>{zoom(e.deltaY>0?1.13:0.885);}}>
     <image className="plan-image" href="./site-plan.webp" x="0" y="0" width={plan.width} height={plan.height}/>
     {[...filtered].sort((a,b)=>Number(a.id===selected)-Number(b.id===selected)).map(i=><g key={i.id} className="map-point" tabIndex={0} role="button" aria-label={`${i.id}: ${i.description}, ${labels[i.status]}`} onClick={()=>choose(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}}} onPointerEnter={e=>{if(e.pointerType==='mouse'&&!drag.current)setHover(i.id);}} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover(i.id)} onBlur={()=>setHover(null)}>
      {i.id===selected&&<circle cx={i.x} cy={i.y} r={view.w*0.019} fill="none" stroke="#203e37" strokeWidth={view.w*.003}/>}
      <circle cx={i.x} cy={i.y} r={view.w*.010} fill={colors[i.status]} stroke="white" strokeWidth={view.w*.0025}/>
      {i.status==='verified'&&<text x={i.x} y={i.y} fill="white" fontSize={view.w*.012} fontWeight="bold" textAnchor="middle" dominantBaseline="central">✓</text>}
      <title>{i.id}: {i.description}</title>
     </g>)}
    </svg>
    <div className="map-controls"><button aria-label="Zoom in" onClick={()=>zoom(.7)}>+</button><button aria-label="Zoom out" onClick={()=>zoom(1.4)}>−</button><span/><button aria-label="Fit all punch list points" title="Fit points" onClick={()=>setView(fitItems(items))}>⌖</button><button aria-label="Show whole site plan" title="Whole plan" onClick={()=>setView({x:0,y:0,w:plan.width,h:plan.height})}>▣</button></div>
    {tip&&tip.id!==selected&&<div className="hover-card"><img src={tip.photo} alt={`Photo for ${tip.id}`}/><div><span className={'badge '+tip.status}>{labels[tip.status]}</span><h3>{tip.id} <small>{tip.code}</small></h3><p>{tip.description}</p><button onClick={()=>choose(tip)}>Open item →</button></div></div>}
    <div className="map-legend">{(['open','verified'] as Status[]).map(s=><span key={s}><i style={{background:colors[s]}}/>{s==='verified'?'Complete':'Open'}</span>)}</div><div className="map-credit">Georeferenced project plan · EPSG:6570</div>
   </section>
   {current&&<aside className="detail-panel"><div className="detail-top"><span className="eyebrow">PUNCH ITEM / {current.id}</span><button aria-label="Close item" onClick={()=>{setSelected(null);window.history.replaceState(null,'',location.pathname);}}>×</button></div><div className="detail-scroll"><span className={'badge '+current.status}>{labels[current.status]}</span><h2>{current.id}<small>{current.code}</small></h2><p className="description">{current.description}</p><button className="photo-button" onClick={()=>setPhotoOpen(true)}><img src={current.photo} alt={`Field photo: ${current.description}`}/><span>↗ Enlarge photo</span></button><div className="action-section"><h3>{current.status==='open'?'Mark this item complete':'Item complete'}</h3><p>{current.status==='open'?'When the work is finished, mark it complete. The dot turns green for everyone.':'This item has been marked complete. Reopen it if more work is needed.'}</p><button className="primary" disabled={saving||!!error} onClick={()=>update(current.status==='open'?'ready':'reopen')}>{saving?'Saving…':current.status==='open'?'✓ Mark complete':'Reopen item'}</button>{notice&&<p className="notice" role="status">{notice}</p>}</div></div></aside>}
  </main><footer className="site-footer"><span>HABERSHAM <b>/</b> Field coordination</span><span>Anyone with this link can update completion</span></footer>
  {photoOpen&&current&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={`Enlarged photo for ${current.id}`} onClick={()=>setPhotoOpen(false)}><button autoFocus aria-label="Close enlarged photo" onClick={()=>setPhotoOpen(false)}>×</button><img src={current.photo} alt={current.description} onClick={e=>e.stopPropagation()}/><p>{current.id} — {current.description}</p></div>}
 </div>;
}
