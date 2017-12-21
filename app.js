window.addEventListener('beforeinstallprompt', function (e) {
    console.info('beforeinstallprompt')
    e.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === 'dismissed') {
            alert('用户取消安装应用');
        } else {
            alert('用户安装了应用');
        }
    });
});
