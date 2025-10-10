
const CAT_CACHE = 'cat_v1'
const JS_CACHE = 'js_v1'
const urlCaches = [
  '/',
  '/index.html',
  '/index.css',
  '/sw_demo_bundle.js'
]

self.addEventListener('install', (event) => {
  console.log('Installing service worker')

  // Add to cache 
  event.waitUntil(
    caches.open(JS_CACHE).then(cache => {
      cache.addAll(urlCaches)
    })

  )
})


self.addEventListener('activate', event => {
  console.log('Activate: ')

  // Deleting old version of cache
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cache => {
        if (cache !== JS_CACHE) {
          console.log('Deleted older cache: ', cache)
          return caches.delete(cache)
        }
      }))

    })
  )

  // Start controlling open pages immediately
  return self.clients.claim()
})

self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  /// Static Assets - JS/HTML/CSS -> Offline Experience
  // Network first -> First check it on the network and then on the cache 

  if (event.request.destination === 'document' || event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      fetch(event.request).then(netRes => {
        const resCloned = netRes.clone();
        caches.open(JS_CACHE).then(cache => {
          cache.put(event.request, resCloned)
        })
        return netRes
      }).catch((err) => {
        console.error('NETWORK FIRST error Catch:', err)
        return caches.match(event.request)
      })
    )
    return;
  }




  // NON EXISTENT API
  const nonExistentAPI = 'https://example.com/api/v2/unknown'
  if (event.request.url === nonExistentAPI && event.request.method === 'GET') {
    console.log('Inside SW non Existent block')
    event.respondWith(
      new Response(JSON.stringify({
        message: 'This is dummy API response you get as you are calling a non exist API '
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    )
    return;
  }



  const catUrlToCache = 'https://api.thecatapi.com/v1/images'
  if (event.request.method === 'GET' && event.request.url.includes(catUrlToCache)) {
    console.log('Matched the Cat URL inside Service Worker')
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse


        return fetch(event.request).then(networkResponse => {
          const clonedRes = networkResponse.clone();

          caches.open(CAT_CACHE).then(cache => {
            cache.put(event.request, clonedRes)
            console.log('Successfully added cats data to cache')
          })
          return networkResponse

        }).catch((err) => {
          console.log('Service Worker Fetch error: ', cachedResponse)
          return cachedResponse
        })


      })
    )
    return;
  }
  // Other cases 
  const oURL = new URL(event.request.url)
  console.log('Other Case URL: ', oURL)
  event.respondWith(fetch(event.request).then(res => res).catch(err => console.log('Error Other Cases last section: ', err)))


})

self.skipWaiting();


