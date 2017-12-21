var cacheName = self.location.search;
var filesToCache = [
    '/',
    '/index.html',
    '/base.css',
    '/app.css',
    '/app.js',
    '/manifest.json'
];

var mapFilesToCache = filesToCache.map(function (u) {
    return new URL(u, self.location).toString() + cacheName;
});

self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(mapFilesToCache);
        }).then(function () {
            return self.skipWaiting()
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        // 清理旧版本
        caches.keys().then(function (cacheList) {
            return Promise.all(
                cacheList.map(function (_cacheName) {
                    if (_cacheName !== cacheName) {
                        console.log('[ServiceWorker] Removing old cache', _cacheName);
                        return caches.delete(_cacheName);
                    }
                })
            );
        }).then(function () {
            self.clients.matchAll().then(function (events) {
                events.forEach(function (event) {
                    event.postMessage("sw.update")
                })
            })
        })
    );
    return self.clients.claim()// 更新客户端
});

self.addEventListener('fetch', function (event) {
    var absoluteUrl = new URL(event.request.url, self.location).toString() + cacheName;
    if (!!~mapFilesToCache.indexOf(absoluteUrl)) {
        console.log('[Service Worker] Fetch', event.request.url);
        event.respondWith(
            caches.match(absoluteUrl).then(function (response) {
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
                        cache.put(event.request, responseClone).catch(function (error) {
                            console.error(error)
                        });
                    });

                    return httpRes;
                });
            })
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    var clickedNotification = event.notification;
    clickedNotification.close();
    console.info(clickedNotification);
    console.info(clickedNotification.data);
    console.info(event.action);

    var urlToOpen = new URL(clickedNotification.data.href, self.location.origin).href;

    // 执行某些异步操作，等待它完成
    var promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(function (windowClients) {
        var matchingClient = null;
        for (var i = 0, max = windowClients.length; i < max; i++) {
            var windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }
        return matchingClient ? matchingClient.focus() : clients.openWindow(urlToOpen);
    });
    event.waitUntil(promiseChain);
});

function isClientFocused() {
    return clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(function (windowClients) {
        var clientIsFocused = false;
        for (var i = 0, max = windowClients.length; i < max; i++) {
            if (windowClients[i].focused) {
                clientIsFocused = true;
                break;
            }
        }
        return clientIsFocused;
    });
}
