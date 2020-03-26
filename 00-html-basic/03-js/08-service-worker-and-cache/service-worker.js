// 安装ServiceWorker, 缓存资源文件
self.addEventListener('install', (e) => {
    e.waitUntil(
        // 创建缓存对象
        caches.open('video-store').then((cache) => {
            return cache.addAll([
                '/exercise/base/js/08-service-work-and-cache/',
                '/exercise/base/js/08-service-work-and-cache/index.html',
                '/exercise/base/js/08-service-work-and-cache/index.js',
                '/exercise/base/js/08-service-work-and-cache/style.css'
            ]);
        })
    );
});

// 监听Fetch请求，有缓存返回缓存，否则从网络获取
self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        // 缓存匹配资源
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

