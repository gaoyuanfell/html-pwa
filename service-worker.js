var cacheName = self.location.search;
var filesToCache = [
    '/',
    '/index.html',
    '/app.css',
    '/app.js',
    '/manifest.json'
];

var mapFilesToCache = filesToCache.map(function (u) {
    return new URL(u, self.location).toString();
});

self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        }).then(function () {
            return self.skipWaiting()
        })
    );
    // event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        // caches.keys().then(function (keyList) {
        //     return Promise.all(keyList.map(function (key) {
        //         if (key !== cacheName) {
        //             console.log('[ServiceWorker] Removing old cache', key);
        //             return caches.delete(key);
        //         }
        //     }));
        // })
        caches.open(cacheName).then(function (cache) {
            return cache.keys().then(function (requests) {
                console.info(requests);
                requests.map(function (request) {
                    var absoluteUrl = new URL(request.url, self.location).toString();
                    if(!~mapFilesToCache.indexOf(absoluteUrl)){
                        cache.delete(request).catch(function (error) { console.error(error) })
                    }
                })
            })
        }).then(function () {
            return self.clients.claim()
        }).then(function () {
            self.clients.matchAll().then(function (events) {
                events.forEach(function (event) {
                    event.postMessage("sw.update")
                })
            })
        })
    )
    // event.waitUntil(
    //     Promise.all([
    //         // 更新客户端
    //         self.clients.claim(),
    //         // 清理旧版本
    //         caches.keys().then(function (cacheList) {
    //             return Promise.all(
    //                 cacheList.map(function (_cacheName) {
    //                     if (_cacheName !== cacheName) {
    //                         return caches.delete(_cacheName);
    //                     }
    //                 })
    //             );
    //         })
    //     ])
    // );
});

self.addEventListener('fetch', function (event) {
    var absoluteUrl = new URL(event.request.url, self.location).toString();
    if(!!~mapFilesToCache.indexOf(absoluteUrl)){
        console.log('[Service Worker] Fetch', event.request.url);
        event.respondWith(
            caches.match(event.request).then(function (response) {
                // 来来来，代理可以搞一些代理的事情

                // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
                if (response) {
                    return response;
                }

                // 如果 service worker 没有返回，那就得直接请求真实远程服务
                var request = event.request.clone(); // 把原始请求拷过来

                return fetch(request).then(function (httpRes) {

                    // http请求的返回已被抓到，可以处置了。

                    // 请求失败了，直接返回失败的结果就好了。。
                    if (!httpRes || httpRes.status !== 200) {
                        return httpRes;
                    }

                    // 请求成功的话，将请求缓存起来。
                    var responseClone = httpRes.clone();
                    caches.open(cacheName).then(function (cache) {
                        console.info(event.request)
                        cache.put(event.request, responseClone).catch(function (error) { console.error(error) });
                    });

                    return httpRes;
                });
            })
        );
    }
});
