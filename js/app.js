const rnd=(s)=>{let x=Math.sin(s*9301+49297)*233280;return x-Math.floor(x)};
function art(seed){
 const h=Math.floor(rnd(seed)*360),h2=(h+60+Math.floor(rnd(seed+3)*80))%360;
 const cx=30+rnd(seed+1)*40,cy=25+rnd(seed+2)*25,r=14+rnd(seed+4)*18;
 const shape=seed%3;
 let s=shape==0?`<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${h2} 90% 65%)" opacity=".9"/>`
  :shape==1?`<polygon points="${cx},${cy-r} ${cx+r},${cy+r} ${cx-r},${cy+r}" fill="hsl(${h2} 90% 65%)" opacity=".9"/>`
  :`<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" rx="4" transform="rotate(${20+seed*7} ${cx} ${cy})" fill="hsl(${h2} 90% 65%)" opacity=".9"/>`;
 let l='';for(let i=0;i<6;i++)l+=`<line x1="${rnd(seed+i+9)*100}" y1="0" x2="${rnd(seed+i+20)*100}" y2="150" stroke="#fff" stroke-opacity=".08" stroke-width="${1+rnd(seed+i)*3}"/>`;
 return `<svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${seed}" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="hsl(${h} 70% 38%)"/><stop offset="1" stop-color="hsl(${(h+280)%360} 60% 10%)"/></linearGradient></defs><rect width="100" height="150" fill="url(#g${seed})"/>${l}${s}</svg>`;
}
const W1=["Neon","Crimson","Silent","Hollow","Starlit","Iron","Velvet","Last","Paper","Ember","Azure","Midnight","Glass","Rogue","Lunar"];
const W2=["Blade","Academy","Garden","Requiem","Signal","Court","Orbit","Covenant","Harbor","Frontier","Echo","Dynasty","Circuit","Lantern","Pact"];
const TAGS=["TV","Movie","OVA"];
let n=0;const DB={};
function mk(count,off,type){const a=[];for(let i=0;i<count;i++){const k=off+i;a.push(DB[n+1]={id:++n,t:`${W1[(k*7)%15]} ${W2[(k*4+off)%15]}`,ep:type=="Movie"?"Movie":`EP ${String(1+(k*5)%24).padStart(2,"0")}`,sub:k%3==0?"SUB":k%3==1?"SUB · DUB":"SUB",type})}return a}
const poster=(a,badge)=>`<div class="poster">${pic(a)}${badge?`<span class="badge ${badge=="NEW"?"y":""}">${badge}</span>`:""}<div class="play"><b>▶</b></div></div>`;
const card=(a,badge)=>`<a class="card" href="#/anime/${a.id}" aria-label="${a.t}">${poster(a,badge)}<h3>${a.t}</h3><p>${a.ep} · ${a.sub}</p></a>`;
const fill=(id,list,badge)=>document.getElementById(id).innerHTML=list.map(a=>card(a,badge)).join("");
fill("same",mk(12,1,"TV"),"NEW");fill("pop",mk(12,20,"TV"));fill("act",mk(12,40,"TV"));fill("rom",mk(12,60,"TV"));fill("mov",mk(10,80,"Movie"),"MOVIE");
document.getElementById("fan").innerHTML=[3,1,2].map((x,i)=>{const a={id:100+x,t:["Neon Requiem","Crimson Academy","Silent Orbit"][i]};return `<div class="poster">${pic(a)}<div class="t">${a.t}</div></div>`}).join("");
const CATS=["All","Chinese Anime","Korean Anime","Comedy","Sci-fi","Fantasy","Slice of Life","Sports","Mystery"];
const pool=mk(18,120,"TV");
const chips=document.getElementById("chips"),grid=document.getElementById("grid");
chips.innerHTML=CATS.map((c,i)=>`<button class="chip${i?"":" on"}">${c}</button>`).join("");
async function showCat(i){
 if(!window.LIVE){const list=i==0?pool:pool.filter((_,j)=>(j+i)%3!=0);grid.innerHTML=list.map(a=>card(a)).join("");return}
 grid.innerHTML=SKEL;
 try{const L=await ani(CATQ[CATS[i]]);L.forEach(reg);grid.innerHTML=L.map(a=>card(a)).join("")}
 catch(e){grid.innerHTML='<p class="syn" style="grid-column:1/-1">Could not load this category. Check your connection and try again.</p>'}
}
showCat(0);
chips.addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;[...chips.children].forEach(c=>c.classList.remove("on"));b.classList.add("on");showCat([...chips.children].indexOf(b))});
document.querySelectorAll(".arrows button").forEach(b=>b.onclick=()=>{const r=document.getElementById(b.dataset.s);r.scrollBy({left:b.dataset.d*r.clientWidth*.8,behavior:"smooth"})});
const burger=document.getElementById("burger"),menu=document.getElementById("menu");
burger.onclick=()=>{const o=menu.classList.toggle("open");burger.setAttribute("aria-expanded",o)};
menu.addEventListener("click",e=>{if(e.target.tagName=="A"){[...menu.children].forEach(a=>a.classList.remove("on"));e.target.classList.add("on");menu.classList.remove("open")}});
document.getElementById("sf").onsubmit=async e=>{
 e.preventDefault();if(location.hash.startsWith("#/"))location.hash="#cats";
 const raw=document.getElementById("q").value.trim();if(!raw)return;
 document.querySelectorAll("#chips .chip").forEach(c=>c.classList.remove("on"));
 let all;
 if(window.LIVE){grid.innerHTML=SKEL;try{all=await ani({search:raw,sort:["SEARCH_MATCH"]})}catch(err){all=[]}}
 else all=[...pool,...(window.SP=window.SP||mk(40,0,"TV"))].filter(a=>a.t.toLowerCase().includes(raw.toLowerCase()));
 all.forEach(reg);
 grid.innerHTML=all.length?all.map(a=>card(a)).join(""):`<p class="syn" style="grid-column:1/-1">No titles match “${esc(raw)}”. Try a different word.</p>`;
 setTimeout(()=>document.getElementById("cats").scrollIntoView(),0)};

const $=id=>document.getElementById(id);
const GEN=["Action","Fantasy","Romance","Comedy","Sci-fi","Mystery","Drama","Adventure"];
const EPW=["First Light","The Hollow Gate","Borrowed Names","Static","Paper Moon","Crossing Over","What Remains","Ember Road","The Long Way","Quiet Hours","Turning Point","Open Skies"];
/* To play real video, add a file you have the rights to: SRC[titleId]={1:"https://your-host/ep1.mp4"} */
const SRC={};
const LIST=new Set();
const epCount=a=>a.type=="Movie"?1:Math.min(a.eps||12+(a.id%3)*6,100);
const epTitle=(a,i)=>a.type=="Movie"?a.t:EPW[(a.id+i)%EPW.length];
const fmt=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const epList=(a,cur)=>Array.from({length:epCount(a)},(_,k)=>k+1).map(i=>`<a class="ep${i==cur?" on":""}" href="#/watch/${a.id}/${i}"><b>${i}</b><span>${epTitle(a,i)}</span><em>▶</em></a>`).join("");
let P=null;
function stopPlayer(){if(P){clearInterval(P.iv);document.removeEventListener("keydown",P.key);if(P.V)P.V.pause();P=null}document.body.classList.remove("dim")}

function route(){
 stopPlayer();clearInterval(window.OGIV);
 const m=location.hash.match(/^#\/(anime|watch)\/(\d+)(?:\/(\d+))?/),view=$("view");
 const SC=/^#\/(schedule|ongoing)$/.test(location.hash);
 [document.querySelector(".hero"),$("main")].forEach(e=>e.hidden=!!m||SC);
 view.hidden=!(m||SC);
 if(SC){const og=location.hash=="#/ongoing";document.title=(og?"Ongoing":"Schedule")+" · Free-Anime";og?ongoingPage():schedule();window.scrollTo(0,0)}
 else if(m){
  const a=DB[m[2]];if(!a){view.innerHTML='<p class="syn" style="padding:40px 16px">Loading…</p>';fetchOne(+m[2]).then(x=>{reg(x);route()}).catch(()=>{location.hash="#home"});return}
  document.title=a.t+" · Free-Anime";
  if(m[1]=="anime")details(a);else player(a,Math.min(+m[3]||1,epCount(a)));
  window.scrollTo(0,0);
 }else{
  document.title="Free-Anime";
  try{const el=location.hash.length>1&&document.querySelector(location.hash);if(el)el.scrollIntoView()}catch(e){}
 }
}

function details(a){
 const eps=epCount(a),mv=a.type=="Movie",g=a.genres&&a.genres.length?a.genres.slice(0,4):[0,3,5].map(k=>GEN[(a.id+k)%8]);
 const rel=Object.values(DB).filter(x=>x.id!=a.id&&x.type==a.type&&!!x.live==!!a.live).slice(a.id%10,a.id%10+10);
 $("view").innerHTML=`<div class="dt"><div class="bd">${pic(a)}</div><div class="dt-in">
  <a class="back" href="#home">‹ Back to home</a>
  <div class="dt-top"><div class="poster">${pic(a)}</div><div>
   <h1>${a.t}</h1>
   <div class="meta"><span>${a.type}</span><span>${a.dur?a.dur+" min"+(mv?"":" per ep"):(mv?"1h 48m":"24 min per ep")}</span><span class="hd">HD</span><span>${a.year||2024+a.id%3}</span><span>${eps} ${mv?"part":"episodes"}</span></div>
   <div class="gen">${g.map(x=>`<span class="chip">${x}</span>`).join("")}</div>
   <p class="syn">${a.desc||"No synopsis available yet."}</p>
   <div class="cta"><a class="btn p" href="#/watch/${a.id}/1">▶ Watch ${mv?"movie":"Episode 1"}</a><button class="btn g" id="ml">${LIST.has(a.id)?"✓ In My List":"+ My List"}</button></div>${wlHtml(a)}
  </div></div>
  <h2 class="h2">${mv?"Watch":"Episodes"}</h2><div class="eps">${epList(a,0)}</div>
  <h2 class="h2">You may also like</h2><div class="row">${rel.map(x=>card(x)).join("")}</div>
 </div></div>`;
 $("ml").onclick=e=>{LIST.has(a.id)?LIST.delete(a.id):LIST.add(a.id);e.target.textContent=LIST.has(a.id)?"✓ In My List":"+ My List"};
}

function player(a,ep){
 const eps=epCount(a),mv=a.type=="Movie",src=SRC[a.id]&&SRC[a.id][ep],dur=1420;
 $("view").innerHTML=`<div class="pl">
 <div class="crumb"><a href="#home">Home</a> › <a href="#/anime/${a.id}">${a.t}</a> › <b>${mv?"Movie":"Episode "+ep}</b></div>
 <div class="stage" id="stage">${src?`<video id="vid" src="${src}" playsinline></video>`:pic(a)}
  <div class="cap show" id="cap">${a.t} · ${epTitle(a,ep)}</div>
  <button class="big" id="big" aria-label="Play">▶</button>
  <button class="skip" id="skip" hidden>Skip intro ⏭</button>
  <div class="ctl"><input type="range" id="seek" min="0" max="1000" value="0" aria-label="Seek">
   <div class="cr"><button id="pp" aria-label="Play or pause">▶</button><button id="b10" aria-label="Back 10 seconds">⟲10</button><button id="f10" aria-label="Forward 10 seconds">10⟳</button><button id="mu" aria-label="Mute">🔊</button><input type="range" id="vol" min="0" max="100" value="80" aria-label="Volume"><span id="tm">00:00 / 23:40</span><button id="fs" style="margin-left:auto" aria-label="Fullscreen">⛶</button></div></div>
 </div>
 <div class="tools"><button class="tg" data-k="play">Auto Play</button><button class="tg on" data-k="next">Auto Next</button><button class="tg" data-k="skip">Auto Skip</button><button class="tg" id="light">Light off</button>
  <a class="tb${ep>1?"":" off"}" href="#/watch/${a.id}/${ep-1}">‹ Prev</a><a class="tb${ep<eps?"":" off"}" href="#/watch/${a.id}/${ep+1}">Next ›</a></div>
 <div class="srv"><p>You're watching <b>${mv?"the movie":"Episode "+ep}</b>. If the current server doesn't work, try another.</p>
  <div><span>SUB</span><button class="sv on">HD-1</button><button class="sv">HD-2</button></div>
  <div><span>DUB</span><button class="sv">HD-1</button><button class="sv">HD-2</button></div></div>
 <p class="next">${ep<eps?`Next up: Episode ${ep+1}, ${epTitle(a,ep+1)}`:"You've reached the last episode."}</p>
 ${mv?"":`<h2 class="h2">Episodes</h2><div class="eps">${epList(a,ep)}</div>`}
 ${src?"":`<p class="demo">Demo player: playback is simulated. Add your own licensed video file in SRC to play real video.</p>`}
 </div>`;
 const V=$("vid"),stage=$("stage"),cap=$("cap"),S={t:0,play:false,vol:.8,muted:false,sk:0,au:{play:false,next:true,skip:false}};
 P={V,iv:0,key:null};
 if(V)V.volume=S.vol;
 const cur=()=>V?V.currentTime:S.t,len=()=>V&&V.duration||dur,isP=()=>V?!V.paused:S.play;
 const flash=t=>{cap.textContent=t;cap.classList.add("show");clearTimeout(S.ct);S.ct=setTimeout(()=>cap.classList.remove("show"),2200)};
 function ui(){const p=isP();$("pp").textContent=p?"⏸":"▶";$("big").hidden=p;stage.classList.toggle("playing",p);$("seek").value=cur()/len()*1000;$("tm").textContent=fmt(cur())+" / "+fmt(len());$("skip").hidden=!(cur()>5&&cur()<90);$("mu").textContent=S.muted||!S.vol?"🔇":"🔊"}
 function setP(p){if(V){p?V.play().catch(()=>{}):V.pause()}S.play=p;ui()}
 function seek(t){t=Math.min(Math.max(0,t),len());if(V)V.currentTime=t;else S.t=t;ui()}
 function end(){setP(false);if(S.au.next&&ep<eps){window.AP=1;location.hash=`#/watch/${a.id}/${ep+1}`}}
 if(V){V.onended=end;V.onplay=V.onpause=ui}
 P.iv=setInterval(()=>{
  if(!V&&S.play){S.t+=.25;if(S.t>=len()){S.t=len();end();return}}
  if(S.au.skip&&!S.sk&&cur()>=5&&cur()<90){S.sk=1;seek(90)}
  ui()},250);
 $("pp").onclick=$("big").onclick=()=>setP(!isP());
 stage.onclick=e=>{if(e.target==stage||e.target.closest("svg")||e.target.tagName=="VIDEO")setP(!isP())};
 $("b10").onclick=()=>seek(cur()-10);$("f10").onclick=()=>seek(cur()+10);
 $("seek").oninput=e=>seek(e.target.value/1000*len());
 $("vol").oninput=e=>{S.vol=e.target.value/100;S.muted=false;if(V){V.volume=S.vol;V.muted=false}ui()};
 $("mu").onclick=()=>{S.muted=!S.muted;if(V)V.muted=S.muted;ui()};
 $("fs").onclick=()=>document.fullscreenElement?document.exitFullscreen():(stage.requestFullscreen&&stage.requestFullscreen());
 $("skip").onclick=()=>seek(90);
 document.querySelectorAll(".tg[data-k]").forEach(b=>b.onclick=()=>{S.au[b.dataset.k]=!S.au[b.dataset.k];b.classList.toggle("on",S.au[b.dataset.k])});
 $("light").onclick=()=>{const d=document.body.classList.toggle("dim");$("light").textContent=d?"Light on":"Light off"};
 document.querySelectorAll(".sv").forEach(b=>b.onclick=()=>{document.querySelectorAll(".sv").forEach(x=>x.classList.remove("on"));b.classList.add("on");flash("Switched to "+b.parentElement.firstChild.textContent+" "+b.textContent)});
 P.key=e=>{
  if(e.target.tagName=="INPUT"&&e.target.type!="range")return;
  if(e.code=="Space"&&e.target.tagName!="BUTTON"){e.preventDefault();setP(!isP())}
  else if(e.key=="ArrowRight"&&e.target.type!="range")seek(cur()+10);
  else if(e.key=="ArrowLeft"&&e.target.type!="range")seek(cur()-10);
  else if(e.key=="f")$("fs").click()};
 document.addEventListener("keydown",P.key);
 setTimeout(()=>cap.classList.remove("show"),2600);
 ui();
 if(window.AP){window.AP=0;setP(true)}
}
document.querySelector(".btn.p").onclick=()=>{location.hash="#/watch/1/1"};
document.querySelector(".btn.g").onclick=()=>{location.hash="#/schedule"};
window.addEventListener("hashchange",route);route();loadLive();setInterval(()=>{if(window.LIVE&&!document.hidden&&!location.hash.startsWith("#/"))loadLive()},6e5);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
