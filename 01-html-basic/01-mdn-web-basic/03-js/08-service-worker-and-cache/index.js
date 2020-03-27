
window.onload = () => {
    // 初始化常量
    const videos = [
        {'name' : 'crystal'},
        {'name' : 'elf'},
        {'name' : 'frog'},
        {'name' : 'monster'},
        {'name' : 'pig'},
        {'name' : 'rabbit'}
    ];
    
    // 创建变量以保存数据库引用
    let db;
    
    // 初始化，从缓存中展示或获取视频资源
    function init() {
        videos.map((video) => {
            let objectStore = db.transaction("videos").objectStore('videos');
            let request = objectStore.get(video.name);
            request.onsuccess = () => {
                if (request.result) {
                    console.log("taking videos from IndexedDB");
                    displayVideo(request.result.mp4, request.result.webm,request.result.name);
                } else {
                    fecthVideoFromNetwork(video);
                }
            }
        });
    }
    
    // 从网络获取视频
    function fecthVideoFromNetwork(video) {
        let mp4Blob = fetch('videos/' + video.name + '.mp4').then(response => response.blob());
        let webmBlob = fetch('videos/' + video.name + '.webm').then(response => response.blob());
    
        // 确保只有两个视频都获取到时处理
        Promise.all([mp4Blob, webmBlob]).then((values) => {
            // 展示视频
            displayVideo(values[0], values[1], video.name);
            // 缓存视频
            storeVideo(values[0], values[1], video.name);
        });
    }
    
    // 保存视频二进制数据
    function storeVideo(mp4Blob, webmBlob, name) {
        // 开启事物，获取对象存储对象
        let objectStore = db.transaction(["videos"], "readwrite").objectStore("videos");
        // 创建要存储的对象
        let record = {
            mp4: mp4Blob,
            webm: webmBlob,
            name: name
        };
        // 保存对象
        let request = objectStore.add(record);
        request.onsuccess = () => {
            console.log("Record addition attempt finished");
        }
        request.onerror = () => {
            console.log(request.error);
        }
    }
    
    function displayVideo(mp4Blob, webmBlob, title) {
        // 用二进制数据创建内部访问地址
        let mp4URL = URL.createObjectURL(mp4Blob);
        let webmURL = URL.createObjectURL(webmBlob);
    
        // 获取内容节点
        const section = document.querySelector("section");
        // 创建节点
        let article = document.createElement("article");
        let h2 = document.createElement("h2");
        h2.textContent = title;
        let video = document.createElement("video");
        video.controls = true;
        let source1 = document.createElement("source");
        source1.src = mp4URL;
        source1.type = "video/mp4";
        let source2 = document.createElement("source");
        source2.src = webmURL;
        source2.type = "video/webm";
        // 添加节点
        video.appendChild(source1);
        video.appendChild(source2);
        article.appendChild(h2);
        article.appendChild(video);
        section.appendChild(article);
    }

    // 请求打开指定的数据库
    let request = window.indexedDB.open("videos", 1);
    request.onerror = () => {
        console.log("Database failed to open");
    }

    request.onsuccess = () => {
        console.log("Database opened successfully");

        db = request.result;
        init();
    }

    request.onupgradeneeded = (e) => {
        let db = e.target.result;

        let objectStore = db.createObjectStore("videos", {keyPath: 'name'});
        objectStore.createIndex("mp4", "mp4", {unique: false});
        objectStore.createIndex("webm", "webm", {unique: false});

        console.log("Database setup complete");
    }

    // 判断浏览器是否支持serviceWorker特性
    if ('serviceWorker' in navigator) {
        // 注册安装
        navigator.serviceWorker
            .register('/exercise/base/js/08-service-work-and-cache/service-worker.js')
            .then(() => console.log('Service Worker Registered'));
    } else {
        console.log('Service Worker is not supported.')
    }
}
