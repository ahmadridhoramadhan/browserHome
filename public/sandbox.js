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

    // 1. Primary execution: Direct execution via Function constructor (allowed in Extension Sandbox)
    try {
      var fn = new Function(code);
      fn();
      window.dispatchEvent(new Event('DOMContentLoaded'));
      return;
    } catch (err) {
      var isCspEvalBlock = err && (
        err.name === 'EvalError' ||
        String(err.message || '').toLowerCase().includes('content security policy') ||
        String(err.message || '').toLowerCase().includes('unsafe-eval') ||
        String(err.message || '').toLowerCase().includes('eval')
      );

      // If it is a regular JavaScript syntax or runtime error in the user's code, display it cleanly
      if (!isCspEvalBlock) {
        console.warn("Widget script error:", err);
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = 'Runtime error: ' + (err.message || String(err));
        }
        return;
      }
    }

    // 2. Secondary execution: Dev server script proxy (ONLY on HTTP/HTTPS web preview, NEVER in chrome-extension)
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      loadScriptViaSameOrigin(code);
      return;
    }

    // 3. Third attempt: Blob URL script execution
    try {
      var blob = new Blob([code], { type: 'text/javascript' });
      var blobUrl = URL.createObjectURL(blob);
      var blobScript = document.createElement('script');
      blobScript.src = blobUrl;
      blobScript.onload = blobScript.onerror = function() {
        URL.revokeObjectURL(blobUrl);
        blobScript.remove();
        window.dispatchEvent(new Event('DOMContentLoaded'));
      };
      document.body.appendChild(blobScript);
      return;
    } catch (blobErr) {
      console.warn("Blob script execution failed:", blobErr);
    }

    // If all execution attempts are blocked in extension context
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Eksekusi JavaScript dibatasi oleh Chrome. Silakan buka tab chrome://extensions dan klik ikon Reload (🔄) pada ekstensi ini untuk memperbarui izin sandbox.';
    }
  }

  function loadScriptViaSameOrigin(code) {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
      return;
    }

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

  let lastPayloadState = {
    html: null,
    css: null,
    js: null,
    theme: null
  };

  function render(payload) {
    var newHtml = payload.html || '';
    var newCss = payload.css || '';
    var newJs = payload.js || '';
    var newTheme = payload.theme || 'dark';

    var isInitial = (lastPayloadState.html === null);
    var codeChanged = (
      newHtml !== lastPayloadState.html ||
      newCss !== lastPayloadState.css ||
      newJs !== lastPayloadState.js
    );
    var themeChanged = (newTheme !== lastPayloadState.theme);

    // If already rendered, code hasn't changed, and this isn't an explicit forceRefresh:
    // DO NOT wipe the DOM or restart scripts! This completely prevents flickering!
    if (!isInitial && !codeChanged && !payload.forceRefresh) {
      if (themeChanged) {
        lastPayloadState.theme = newTheme;
        if (newTheme === 'light') {
          document.body.style.color = '#171717';
        } else {
          document.body.style.color = '#e5e5e5';
        }
      }
      return;
    }

    lastPayloadState = {
      html: newHtml,
      css: newCss,
      js: newJs,
      theme: newTheme
    };

    clearTimers();
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }

    if (styleEl) {
      styleEl.textContent = newCss;
    }

    if (rootEl) {
      rootEl.innerHTML = newHtml || '<div style="text-align:center;padding:20px;color:#888;">Widget kosong</div>';
    }

    if (newTheme === 'light') {
      document.body.style.color = '#171717';
    } else {
      document.body.style.color = '#e5e5e5';
    }

    executeUserScript(newJs);
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
