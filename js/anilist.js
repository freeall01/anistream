/* AniList GraphQL client: https://docs.anilist.co (free, no key needed for public data) */
const AL_URL="https://graphql.anilist.co";
const SKEL='<p class="syn" style="grid-column:1/-1">Loading…</p>';
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reg=a=>{DB[a.id]=a};
const pic=a=>a.img?`<img src="${esc(a.img)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:art(a.id);
const CATQ={"All":{sort:["TRENDING_DESC"]},"Chinese Anime":{country:"CN",sort:["POPULARITY_DESC"]},"Korean Anime":{country:"KR",sort:["POPULARITY_DESC"]},"Comedy":{genre:"Comedy",sort:["POPULARITY_DESC"]},"Sci-fi":{genre:"Sci-Fi",sort:["POPULARITY_DESC"]},"Fantasy":{genre:"Fantasy",sort:["POPULARITY_DESC"]},"Slice of Life":{genre:"Slice of Life",sort:["POPULARITY_DESC"]},"Sports":{genre:"Sports",sort:["POPULARITY_DESC"]},"Mystery":{genre:"Mystery",sort:["POPULARITY_DESC"]}};
const MF="id title{romaji english} coverImage{large color} format episodes duration genres description(asHtml:false) averageScore seasonYear isAdult nextAiringEpisode{episode airingAt} externalLinks{site url type}";

const hash=t=>{let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return h};
async function gql(query,variables,ttl=18e5){
  const key="fa:"+hash(query+JSON.stringify(variables||{}));
  try{const c=JSON.parse(localStorage.getItem(key)||"null");if(c&&Date.now()-c.t<ttl)return c.d}catch(e){}
  const r=await fetch(AL_URL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query,variables})});
  if(!r.ok)throw new Error("AniList "+r.status);
  const j=await r.json();if(j.errors)throw new Error(j.errors[0].message);
  try{localStorage.setItem(key,JSON.stringify({t:Date.now(),d:j.data}))}catch(e){}
  return j.data;
}
function norm(m){
  const movie=m.format=="MOVIE",nx=m.nextAiringEpisode;
  return{id:m.id,live:true,
    t:esc(m.title.english||m.title.romaji),
    type:movie?"Movie":"TV",
    ep:movie?"Movie":nx?"EP "+String(Math.max(1,nx.episode-1)).padStart(2,"0"):(m.episodes?m.episodes+" eps":"TV"),
    sub:"SUB",img:m.coverImage&&m.coverImage.large,
    eps:movie?1:(m.episodes||(nx?Math.max(1,nx.episode-1):12)),
    dur:m.duration,year:m.seasonYear,score:m.averageScore,
    genres:(m.genres||[]).map(esc),
    links:(m.externalLinks||[]).filter(l=>l.type=="STREAMING"&&/^https?:\/\//.test(l.url)).map(l=>({s:esc(l.site),u:esc(l.url)})),
    desc:esc((m.description||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim())};
}
async function ani(o){
  const q=`query($sort:[MediaSort],$genre:String,$country:CountryCode,$format:MediaFormat,$status:MediaStatus,$search:String){Page(page:1,perPage:18){media(type:ANIME,sort:$sort,genre:$genre,countryOfOrigin:$country,format:$format,status:$status,search:$search,isAdult:false){${MF}}}}`;
  const d=await gql(q,o);
  return d.Page.media.filter(m=>!m.isAdult).map(norm);
}
async function fetchOne(id){
  const d=await gql(`query($id:Int){Media(id:$id,type:ANIME){${MF}}}`,{id});
  if(!d.Media||d.Media.isAdult)throw new Error("not found");
  return norm(d.Media);
}
async function weekSchedule(){
  const q=`query($p:Int){Page(page:$p,perPage:50){media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC,isAdult:false){${MF}}}}`;
  const [a,b]=await Promise.all([gql(q,{p:1}),gql(q,{p:2})]);
  const end=Date.now()/1000+7*86400;
  return[...a.Page.media,...b.Page.media]
    .filter(m=>!m.isAdult&&m.nextAiringEpisode&&m.nextAiringEpisode.airingAt<end)
    .map(m=>({a:norm(m),at:m.nextAiringEpisode.airingAt,ep:m.nextAiringEpisode.episode}))
    .sort((x,y)=>x.at-y.at);
}
async function loadLive(){
  try{
    const lists=await Promise.all([
      ani({sort:["TRENDING_DESC"],status:"RELEASING"}),ani({sort:["POPULARITY_DESC"]}),
      ani({genre:"Action",sort:["POPULARITY_DESC"]}),ani({genre:"Romance",sort:["POPULARITY_DESC"]}),
      ani({format:"MOVIE",sort:["POPULARITY_DESC"]}),ani({sort:["TRENDING_DESC"]})]);
    const [same,pop,act,rom,mov,all]=lists;
    window.LIVE=true;lists.forEach(l=>l.forEach(reg));
    fill("same",same,"NEW");fill("pop",pop);fill("act",act);fill("rom",rom);fill("mov",mov,"MOVIE");
    pool.length=0;pool.push(...all);
    const on=document.querySelector("#chips .chip.on");if(on&&on.textContent=="All")showCat(0);
    $("fan").innerHTML=[same[1],same[0],same[2]].map(a=>`<div class="poster">${pic(a)}<div class="t">${a.t}</div></div>`).join("");
    if(location.hash.startsWith("#/"))route();
  }catch(e){console.warn("AniList unavailable, showing sample data.",e)}
}

/* Official streaming links (from AniList) shown on the details page */
const wlHtml=a=>a.links&&a.links.length?`<div class="wl"><span>Watch officially on</span>${a.links.map(l=>`<a class="btn g" href="${l.u}" target="_blank" rel="noopener noreferrer">${l.s}</a>`).join("")}</div>`:"";
/* Every anime that is airing right now, with its next episode time. Short cache so it refreshes. */
async function ongoingList(){
  const q=`query($p:Int){Page(page:$p,perPage:50){media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC,isAdult:false){${MF}}}}`;
  const [x,y]=await Promise.all([gql(q,{p:1},3e5),gql(q,{p:2},3e5)]);
  return[...x.Page.media,...y.Page.media].filter(m=>!m.isAdult&&m.nextAiringEpisode)
    .map(m=>({a:norm(m),at:m.nextAiringEpisode.airingAt,ep:m.nextAiringEpisode.episode})).sort((p,r)=>p.at-r.at);
  }
