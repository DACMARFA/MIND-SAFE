/* MIND SAFE 2.3.2 · Service Worker — corrección onboarding móvil */
const CACHE_PREFIX='mindsafe-shell-';
const CACHE_NAME=CACHE_PREFIX+'2.3.2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo-mark.png','./LOGO%202.jpg'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.all(CORE.map(async url=>{
      try{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response);}catch(error){/* optional shell resource */}
    }));
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return; // Never cache third-party services or fonts.
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(request);
        if(fresh&&fresh.ok){const cache=await caches.open(CACHE_NAME);await cache.put('./index.html',fresh.clone());}
        return fresh;
      }catch(error){return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request);if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok&&response.type==='basic'){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone());}
      return response;
    }catch(error){return new Response('',{status:503,statusText:'Offline'});}
  })());
});
