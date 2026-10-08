/* Release schedule page (#/schedule) */
function fakeWeek(){
  const now=Math.floor(Date.now()/1000);
  return Object.values(DB).filter(x=>x.type=="TV").slice(0,28).map((a,i)=>({a,at:now+(i%7)*86400+(((i*5)%20)+1)*3600,ep:1+(a.id%12)}));
}
function untilText(at){
  const m=Math.round((at*1000-Date.now())/6e4);
  if(m<=0)return"Aired";
  if(m<60)return"in "+m+"m";
  if(m<1440)return"in "+Math.floor(m/60)+"h "+(m%60)+"m";
  return"in "+Math.floor(m/1440)+"d "+Math.floor((m%1440)/60)+"h";
}
async function schedule(){
  const v=$("view");
  v.innerHTML=`<div class="sc"><a class="back" href="#home">‹ Back to home</a><h1>Release schedule</h1><p class="syn" id="scn">Loading this week's episodes…</p><div class="days" id="days"></div><div class="sc-list" id="scl"></div></div>`;
  let items;
  try{items=await weekSchedule();$("scn").textContent="Next episode of each airing show, in your local time. Source: AniList."}
  catch(e){items=fakeWeek();$("scn").textContent="Couldn't reach AniList, so this is sample data. Host the site online to see the real schedule."}
  if(location.hash!="#/schedule")return;
  items.forEach(x=>reg(x.a));
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+i);return d});
  const key=d=>d.toDateString();
  const by={};items.forEach(x=>(by[key(new Date(x.at*1000))]=by[key(new Date(x.at*1000))]||[]).push(x));
  const show=i=>{
    [...$("days").children].forEach((b,j)=>b.classList.toggle("on",j==i));
    const L=by[key(days[i])]||[];
    $("scl").innerHTML=L.length?L.map(x=>`<a class="si" href="#/anime/${x.a.id}"><div class="poster">${pic(x.a)}</div><time>${new Date(x.at*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</time><div><h3>${x.a.t}</h3><p>Episode ${x.ep} · ${x.a.sub}</p></div><span class="cd">${untilText(x.at)}</span></a>`).join(""):`<p class="syn">Nothing scheduled for this day.</p>`;
  };
  $("days").innerHTML=days.map((d,i)=>`<button class="day"><b>${i==0?"Today":i==1?"Tomorrow":d.toLocaleDateString([],{weekday:"short"})}</b><span>${d.getDate()}</span></button>`).join("");
  [...$("days").children].forEach((b,i)=>b.onclick=()=>show(i));
  show(0);
}

/* Ongoing anime page (#/ongoing): auto-refreshes every 5 minutes, countdowns tick every 30 seconds */
async function ongoingPage(){
  const v=$("view");
  v.innerHTML=`<div class="sc"><a class="back" href="#home">‹ Back to home</a><h1>Ongoing anime</h1><p class="syn" id="scn">Loading airing anime…</p><div class="sc-list" id="scl"></div></div>`;
  const draw=async()=>{
    let items;
    try{items=await ongoingList();$("scn").textContent="Currently airing, soonest next episode first. Updates automatically. Source: AniList."}
    catch(e){items=fakeWeek().sort((p,r)=>p.at-r.at);$("scn").textContent="Couldn't reach AniList, so this is sample data."}
    if(location.hash!="#/ongoing"||!$("scl"))return;
    items.forEach(x=>reg(x.a));
    $("scl").innerHTML=items.map(x=>`<a class="si" href="#/anime/${x.a.id}"><div class="poster">${pic(x.a)}</div><time>${new Date(x.at*1000).toLocaleDateString([],{weekday:"short"})} ${new Date(x.at*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</time><div><h3>${x.a.t}</h3><p>Episode ${x.ep} next · ${x.a.sub}</p></div><span class="cd" data-at="${x.at}">${untilText(x.at)}</span></a>`).join("");
  };
  await draw();
  clearInterval(window.OGIV);let k=0;
  window.OGIV=setInterval(()=>{
    if(location.hash!="#/ongoing"){clearInterval(window.OGIV);return}
    document.querySelectorAll(".cd[data-at]").forEach(e=>e.textContent=untilText(+e.dataset.at));
    if(++k%10==0)draw();
  },30000);
}
