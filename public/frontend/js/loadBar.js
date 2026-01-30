const loadingBar = document.getElementById('loading-bar');

let progress = 0;

const simulateProgress = setInterval(() => {
    progress += Math.random() * 5; 
    if (progress > 90) progress = 90;
    loadingBar.style.width = progress + '%';
}, 100);

window.addEventListener('DOMContentLoaded', () => {
    progress = 50; // DOM 解析完成，进度大约到 50%
    loadingBar.style.width = progress + '%';
});

window.addEventListener('load', () => {
    clearInterval(simulateProgress); // 停止模拟
    loadingBar.style.width = '100%'; // 最终进度 100%

    setTimeout(() => {
        loadingBar.style.opacity = 0;
    }, 300);

    setTimeout(() => {
        loadingBar.style.display = 'none';
    }, 600);
});
