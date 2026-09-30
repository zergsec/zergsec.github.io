// 首页开屏动画：头像弹出 → 自我介绍逐字出现 → 自动淡出进入主页
(function () {
  'use strict';

  var screen = document.getElementById('intro-screen');
  if (!screen) return;

  var body = document.body;
  var msgEl = screen.querySelector('.intro-message');
  var skipBtn = document.getElementById('intro-skip');

  // 用户系统设置了「减少动效」就直接不播
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    screen.parentNode.removeChild(screen);
    return;
  }

  // 可选：每个浏览器会话只播一次
  if (String(screen.dataset.oncePerSession).trim() === 'true') {
    try {
      if (sessionStorage.getItem('intro-shown')) {
        screen.parentNode.removeChild(screen);
        return;
      }
      sessionStorage.setItem('intro-shown', '1');
    } catch (e) {
      /* 隐私模式下 sessionStorage 可能不可用，忽略 */
    }
  }

  var speed = parseInt(msgEl && msgEl.dataset.speed, 10) || 85;
  var hold = parseInt(screen.dataset.hold, 10) || 900;
  var fade = parseInt(screen.dataset.fade, 10) || 700;

  var done = false;
  var typingTimer = null;
  var holdTimer = null;

  body.classList.add('intro-lock');

  function finish() {
    if (done) return;
    done = true;

    window.clearInterval(typingTimer);
    window.clearTimeout(holdTimer);
    document.removeEventListener('keydown', onKey);
    if (skipBtn) skipBtn.removeEventListener('click', finish);

    screen.classList.add('intro-leave');
    body.classList.remove('intro-lock');

    window.setTimeout(function () {
      if (screen.parentNode) screen.parentNode.removeChild(screen);
    }, fade);
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      finish();
    }
  }

  if (msgEl && msgEl.textContent.trim()) {
    // Array.from 能正确处理 emoji 等代理对，避免打出半个字符
    var chars = Array.from(msgEl.textContent.trim());
    msgEl.textContent = '';
    var i = 0;
    typingTimer = window.setInterval(function () {
      msgEl.textContent += chars[i];
      i += 1;
      if (i >= chars.length) {
        window.clearInterval(typingTimer);
        msgEl.classList.add('intro-done');
        holdTimer = window.setTimeout(finish, hold);
      }
    }, speed);
  } else {
    holdTimer = window.setTimeout(finish, hold);
  }

  if (skipBtn) skipBtn.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
})();
