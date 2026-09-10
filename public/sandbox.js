(function() {
  const rootEl = document.getElementById('widget-root');
  const styleEl = document.getElementById('custom-style');
  const errorEl = document.getElementById('widget-error');
  let activeIntervals = [];
  let activeTimeouts = [];

  function clearTimers() {
    activeIntervals.forEach(function(id) { clearInterval(id); });
    activeIntervals = [];
    activeTimeouts.forEach(function(id) { clearTimeout(id); });
    activeTimeouts = [];
  }

  const origSetInterval = window.setInterval;
  window.setInterval = function(fn, delay) {
    var rest = Array.prototype.slice.call(arguments, 2);
    var id = origSetInterval.apply(window, [fn, delay].concat(rest));
    activeIntervals.push(id);
    return id;
  };

  const origSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay) {
    var rest = Array.prototype.slice.call(arguments, 2);
    var id = origSetTimeout.apply(window, [fn, delay].concat(rest));
    activeTimeouts.push(id);
    return id;
  };

  function executeUserScript(code) {
    if (!code || !code.trim()) return;

    try {
      // 1. First attempt: Direct execution via Function constructor (allowed in Extension Sandbox)
      var fn = new Function(code);
      fn();
      window.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (err) {
      // 2. Check if the failure is due to CSP EvalError ('unsafe-eval' blocked in web preview)
      var isCspEvalBlock = err && (
        err.name === 'EvalError' ||
        String(err.message || '').toLowerCase().includes('content security policy') ||
        String(err.message || '').toLowerCase().includes('unsafe-eval')
      );

      if (isCspEvalBlock) {
        // Fallback: execute via same-origin script runner endpoint
        loadScriptViaSameOrigin(code);
      } else {
        console.warn("Widget runtime warning:", err);
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = 'Runtime error: ' + (err.message || String(err));
        }
      }
    }
  }

  function loadScriptViaSameOrigin(code) {
    try {
      var oldScript = document.getElementById('dynamic-widget-script');
      if (oldScript) {
        oldScript.remove();
      }

      var script = document.createElement('script');
      script.id = 'dynamic-widget-script';
      script.src = '/api/widget-script.js?c=' + encodeURIComponent(code) + '&t=' + Date.now();
      script.onerror = function() {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = 'Eksekusi JavaScript dibatasi oleh kebijakan CSP browser.';
        }
      };
      document.body.appendChild(script);
    } catch (fallbackErr) {
      console.error('Failed to load fallback script:', fallbackErr);
    }
  }

  function render(payload) {
    clearTimers();
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }

    if (styleEl) {
      styleEl.textContent = payload.css || '';
    }

    if (rootEl) {
      rootEl.innerHTML = payload.html || '<div style="text-align:center;padding:20px;color:#888;">Widget kosong</div>';
    }

    if (payload.theme === 'light') {
      document.body.style.color = '#171717';
    } else {
      document.body.style.color = '#e5e5e5';
    }

    executeUserScript(payload.js);
  }

  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data) return;
    if (data.type === 'RENDER_WIDGET') {
      render(data);
    }
  });

  // Announce readiness to parent frame
  function notifyReady() {
    try {
      window.parent.postMessage({ type: 'WIDGET_SANDBOX_READY' }, '*');
    } catch (e) {}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    notifyReady();
  } else {
    window.addEventListener('DOMContentLoaded', notifyReady);
  }
})();
