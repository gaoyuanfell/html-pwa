var version = '1.0.0.0.5';
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js?v=' + version)
        .then(function (reg) {
            if (localStorage.getItem('sw_version') !== version) {
                reg.update().then(function () {
                    localStorage.setItem('sw_version', version)
                });
            }
            console.log('Service Worker Registered');
        });
    navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data === 'sw.update') {
            console.info('sw.update')
            window.location.reload();
        }
    });
}
