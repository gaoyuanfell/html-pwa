var version = '1.0.0.3.1';

if('PushManager' in window){
    new Promise(function (resolve, reject) {
        var permissionPromise = Notification.requestPermission(function (result) {
            resolve(result);
        });
        if (permissionPromise) {
            permissionPromise.then(resolve);
        }
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js?v=' + version)
        .then(function (reg) {
            if (localStorage.getItem('sw_version') !== version) {
                reg.update().then(function () {
                    localStorage.setItem('sw_version', version)
                });
            }

            reg.showNotification('Hello World!',{
                body:'Simple piece of body text.\nSecond line of body text :)',
                icon:'images/icons/icon-192x192.png',
                badge:'images/icons/icon-32x32.png',
                image:'images/icons/icon-512x512.png',
                vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
                tag:'pwa',
                requireInteraction: false,
                data:{
                    time: (new Date()).toString(),
                    message: 'Hello World!',
                    href:'https://www.baidu.com',
                },
                actions: [
                    {
                        action: 'coffee-action',
                        title: 'Coffee',
                        icon: 'images/icons/icon-32x32.png'
                    },
                    {
                        action: 'doughnut-action',
                        title: 'Doughnut',
                        icon: 'images/icons/icon-32x32.png'
                    },
                    {
                        action: 'gramophone-action',
                        title: 'gramophone',
                        icon: 'images/icons/icon-32x32.png'
                    }
                ]
            });

            // reg.showNotification('Hello World!',{
            //     renotify: true,
            //     tag:'pwa',
            // });

            console.log('Service Worker Registered');
        });
    navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data === 'sw.update') {
            console.info('sw.update');
            up();
        }
    });
}

function up() {
    var html = "<style>\n" +
        "    .msg {\n" +
        "        position: absolute;\n" +
        "        bottom: 0.1rem;\n" +
        "        left: -1.5rem;\n" +
        "        width: 1.2rem;\n" +
        "        background: #fff;\n" +
        "        padding: 0.05rem 0.1rem;\n" +
        "        height: 0.4rem;\n" +
        "        box-shadow: 2px 2px 8px 1px #ccc;\n" +
        "        transition: left 0.2s cubic-bezier(0.4, 0, 1, 1);\n" +
        "    }\n" +
        "\n" +
        "    .msg.active{\n" +
        "        left: 0;\n" +
        "    }\n" +
        "\n" +
        "    .msg a{\n" +
        "        display: block;\n" +
        "        text-decoration: none;\n" +
        "        color: #666;\n" +
        "        line-height: 0.3rem;\n" +
        "    }\n" +
        "</style>\n" +
        "<div class=\"msg\" id=\"msg\">\n" +
        "    <a href=\"javascript:window.location.reload()\">立即更新版本</a>\n" +
        "</div>";
    var box = document.createElement('div');
    box.innerHTML = html;
    document.body.appendChild(box);
    setTimeout(function () {
        document.querySelector("#msg").classList.add('active');
    }, 50)
}
