const CAT_CACHE = 'cat_v1'
const COMMON_CACHE = 'common_v1'
const urlCaches = [
  '/service-worker-tech-session',
  // '/index.html',
  '/service-worker-tech-session/index.css',
  '/service-worker-tech-session/sw_demo_bundle.js',
  '/service-worker-tech-session/sw_cache_first.png',
  '/service-worker-tech-session/sw_lifecycle.svg',
  '/service-worker-tech-session/sw_network_first.png'
]
const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const VAPID_WEB_PUSH_PUBLIC_KEY = 'BD6swrkl62_5QxOotuAnyJAvhNPYjmz57FNUvyX_Z79UM8govtGJFCtD-HonDgeMBjOTQg1dZoHACXvQgKj92Vs'

function showLocalNotification(title, body) {
  //  const options = {
  //   "//": "Visual Options",
  //   "body": "<String>",
  //   "icon": "<URL String>",
  //   "image": "<URL String>",
  //   "badge": "<URL String>",
  //   "vibrate": "<Array of Integers>",
  //   "sound": "<URL String>",
  //   "dir": "<String of 'auto' | 'ltr' | 'rtl'>",
  //   "//": "Behavioural Options",
  //   "tag": "<String>",
  //   "data": "<Anything>",
  //   "requireInteraction": "<boolean>",
  //   "renotify": "<Boolean>",
  //   "silent": "<Boolean>",
  //   "//": "Both Visual & Behavioural Options",
  //   "actions": "<Array of Strings>",
  //   "//": "Information Option. No visual affect.",
  //   "timestamp": "<Long>"
  // }

  const options = {
    icon: '/service-worker-tech-session/push_notification.png',
    image: '/service-worker-tech-session/push_notification.png',
    sound: '/service-worker-tech-session/notification_sound.wav',
    body,

  }
  self.registration.showNotification(title, options)
}


async function saveSubscriptionToBackend(subscription) {
  const END_POINT = 'http://localhost:4500/save-subscription'
  const response = await fetch(END_POINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })
  return response.json();
}


self.addEventListener('install', (event) => {
  console.log('Installing service worker')
  // Add to cache 
  event.waitUntil(
    caches.open(COMMON_CACHE).then(cache => {
      cache.addAll(urlCaches)
    })

  )
})


async function subscribeToPushEvents() {
  try {

    const applicationServerKey = urlB64ToUint8Array(VAPID_WEB_PUSH_PUBLIC_KEY)
    const options = {
      // On Chrome we need few options to mention otherwise it will throw some error:  "missing Application Sever Key (VAPID public key) and gcm_sender_id"
      // VAPID - Key which identifies the Push backend server 
      userVisibleOnly: true,
      applicationServerKey

    }
    const subscription = await self.registration.pushManager.subscribe(options)
    console.log("PUSH EVENTS Subscription: ", subscription)
    const savedStatus = await saveSubscriptionToBackend(subscription)
    console.log('Save registration status: ', savedStatus)
  } catch (err) {
    console.log('subscribeToPushEvents__Error: ', err)
  }
}

self.addEventListener('activate', async event => {
  console.log('Activate: ')
  // subsribe to push events 
  subscribeToPushEvents()
  // Deleting old version of cache
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cache => {
        if (cache !== COMMON_CACHE) {
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

  if (event.request.destination === 'image') {
    return;
  }
  /// Static Assets - JS/HTML/CSS -> Offline Experience
  // Network first -> First check it on the network and then on the cache 

  if (event.request.destination === 'document' || event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      fetch(event.request).then(netRes => {
        const resCloned = netRes.clone();
        caches.open(COMMON_CACHE).then(cache => {
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

  // const catUrlToCache = 'https://api.thecatapi.com/v1/images'
  // if (event.request.method === 'GET' && event.request.url.includes(catUrlToCache)) {
  //   console.log('Matched the Cat URL inside Service Worker')
  //   event.respondWith(
  //     caches.match(event.request).then(cachedResponse => {
  //       if (cachedResponse) return cachedResponse
  //
  //
  //       return fetch(event.request).then(networkResponse => {
  //         const clonedRes = networkResponse.clone();
  //
  //         caches.open(CAT_CACHE).then(cache => {
  //           cache.put(event.request, clonedRes)
  //           console.log('Successfully added cats data to cache')
  //         })
  //         return networkResponse
  //
  //       }).catch((err) => {
  //         console.error('Service Worker Fetch error: ', cachedResponse)
  //         return cachedResponse
  //       })
  //
  //
  //     })
  //   )
  //   return;
  // }
  // Other cases 

  const oURL = new URL(event.request.url)
  console.log('Other Case URL: ', oURL)
  event.respondWith(fetch(event.request).then(res => res).catch(err => console.log('Error Other Cases last section: ', err)))
})


self.addEventListener('push', (event) => {
  console.log('Push Event ! Received')
  if (event.data) {
    const pushedData = event.data.json();
    console.log('Push Event data : ', pushedData)
    showLocalNotification(pushedData.title, pushedData.message)
  }
}
)

self.skipWaiting();
