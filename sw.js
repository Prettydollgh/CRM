// Lets the CRM page open with no internet (after it has been opened once online).
// It only caches the page itself and its two script libraries — never the database or sign-in calls.
const CACHE='pdcrm-shell-v1';
const LIBS=['www.gstatic.com','cdnjs.cloudflare.com'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const page=u.origin===location.origin&&(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html'));
  const lib=LIBS.includes(u.hostname)&&u.pathname.endsWith('.js');
  if(!page&&!lib)return;
  e.respondWith(
    fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(page?'./':r,cp)).catch(()=>{})}return res})
      .catch(()=>caches.match(page?'./':r).then(m=>m||Response.error()))
  );
});
