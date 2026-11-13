/* =====================================================
   JS Advanced Assignment — UI Logic
   Fetches app.js, renders each question as a card,
   runs solutions in a sandboxed Function with a fake console.
   ===================================================== */
(function () {
  'use strict';

  /* ---------- Elements ---------- */
  var qlistEl = document.getElementById('qlist');
  var contentEl = document.getElementById('content');
  var searchEl = document.getElementById('search');
  var runAllBtn = document.getElementById('run-all');
  var clearBtn = document.getElementById('clear-btn');
  var menuBtn = document.getElementById('menu-btn');
  var sidebarEl = document.getElementById('sidebar');
  var backdropEl = document.getElementById('backdrop');
  var statRunEl = document.getElementById('stat-run');
  var statTotalEl = document.getElementById('stat-total');

  /* ---------- State ---------- */
  var questions = [];
  var runSet = new Set();
  var activeId = null;

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, n) {
    if (str.length <= n) return str;
    return str.slice(0, n).trimEnd() + '…';
  }

  /* ---------- Syntax Highlighting ---------- */
  var TOKEN_RE = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|if|else|for|while|new|class|extends|this|true|false|null|undefined|typeof|instanceof|in|of|async|await|try|catch|throw|switch|case|break|continue|default|do|delete|void|yield|static|get|set|import|export|from)\b)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

  function highlightLine(line) {
    var out = '';
    var last = 0;
    var m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(line)) !== null) {
      if (m.index > last) out += escapeHtml(line.slice(last, m.index));
      var text = m[0];
      if (m[1] !== undefined) {
        out += '<span class="tok-comment">' + escapeHtml(text) + '</span>';
      } else if (m[2] !== undefined) {
        out += '<span class="tok-string">' + escapeHtml(text) + '</span>';
      } else if (m[3] !== undefined) {
        out += '<span class="tok-keyword">' + escapeHtml(text) + '</span>';
      } else if (m[4] !== undefined) {
        out += '<span class="tok-number">' + escapeHtml(text) + '</span>';
      } else {
        var after = line.slice(TOKEN_RE.lastIndex);
        if (/^\s*\(/.test(after)) {
          out += '<span class="tok-fn">' + escapeHtml(text) + '</span>';
        } else {
          out += escapeHtml(text);
        }
      }
      last = TOKEN_RE.lastIndex;
    }
    if (last < line.length) out += escapeHtml(line.slice(last));
    return out;
  }

  function highlightCode(code) {
    return code.split('\n').map(function (line, i) {
      return '<span class="code-line"><span class="ln">' + (i + 1) +
        '</span><span class="lc">' + highlightLine(line) + '</span></span>';
    }).join('');
  }

  /* ---------- Value Formatting ---------- */
  function formatValue(v) {
    if (typeof v === 'string') return v;
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
    if (typeof v === 'function') return v.toString();
    if (typeof v === 'symbol') return v.toString();
    try {
      return JSON.stringify(v, null, 2);
    } catch (e) {
      return String(v);
    }
  }

  /* ---------- Fake Console ---------- */
  function makeFakeConsole(outEl) {
    function write(type) {
      return function () {
        var args = Array.prototype.slice.call(arguments);
        var line = document.createElement('div');
        line.className = 'out-line ' + type;
        line.textContent = args.map(formatValue).join(' ');
        outEl.appendChild(line);
      };
    }
    return {
      log: write('log'),
      info: write('log'),
      debug: write('log'),
      table: write('log'),
      dir: write('log'),
      warn: write('warn'),
      error: write('error')
    };
  }

  /* ---------- Run Code ---------- */
  function runCode(q) {
    var outEl = q.outEl;
    outEl.innerHTML = '';
    outEl.classList.add('has-output');

    var stamp = document.createElement('div');
    stamp.className = 'out-stamp';
    stamp.textContent = '› running ' + q.id + ' …';
    outEl.appendChild(stamp);

    var startTime = performance.now();
    var errored = false;

    try {
      var fn = new Function('console', q.code);
      fn(makeFakeConsole(outEl));
    } catch (err) {
      errored = true;
      var errLine = document.createElement('div');
      errLine.className = 'out-line error';
      var name = err && err.name ? err.name + ': ' : '';
      var msg = err && err.message ? err.message : String(err);
      errLine.textContent = name + msg;
      outEl.appendChild(errLine);
    }

    var elapsed = (performance.now() - startTime).toFixed(1);

    var foot = document.createElement('div');
    foot.className = 'out-foot ' + (errored ? 'error' : 'ok');
    foot.innerHTML = '<span class="dot"></span>' +
      (errored ? 'Failed' : 'Completed') + ' in ' + elapsed + 'ms';
    outEl.appendChild(foot);

    q.cardEl.classList.add('ran');
    if (q.sidebarEl) q.sidebarEl.classList.add('ran');
    runSet.add(q.id);
    updateStats();
  }

  /* ---------- Stats ---------- */
  function updateStats() {
    statRunEl.textContent = runSet.size;
    statTotalEl.textContent = questions.length;
  }

  /* ---------- Toast ---------- */
  var toastContainer = null;
  function toast(message, type) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = message;
    toastContainer.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = 'opacity .3s, transform .3s';
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 300);
    }, 2200);
  }

  /* ---------- Copy ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---------- Render ---------- */
  function render(rawText) {
    var chunks = rawText.split(/^(?=\/\/ Q\d+:)/m);
    contentEl.innerHTML = '';
    qlistEl.innerHTML = '';
    questions.length = 0;
    runSet.clear();
    activeId = null;

    chunks.forEach(function (chunk) {
      var m = chunk.match(/^\/\/ (Q\d+):[ \t]*([^\n]*)\n?([\s\S]*)$/);
      if (!m) return;
      var id = m[1];
      var text = m[2].trim();
      var code = m[3].replace(/\s+$/, '');
      if (!code.trim()) return;

      var q = { id: id, text: text, code: code };
      questions.push(q);

      var lineCount = code.split('\n').length;

      var card = document.createElement('article');
      card.className = 'card';
      card.id = 'card-' + id;

      card.innerHTML =
        '<div class="card-head">' +
          '<div class="card-badge">' + escapeHtml(id) + '</div>' +
          '<div class="card-title-wrap">' +
            '<h3 class="card-title">' + escapeHtml(text) + '</h3>' +
            '<div class="card-meta">' +
              '<span class="meta-item">' + lineCount + ' lines</span>' +
              '<span class="meta-item">JavaScript</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="code-block">' +
          '<pre class="code"><code>' + highlightCode(code) + '</code></pre>' +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="btn primary run-btn" type="button">' +
            '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 4l14 8-14 8z" fill="currentColor"/></svg>' +
            '<span>Run ' + escapeHtml(id) + '</span>' +
          '</button>' +
          '<button class="btn ghost copy-btn" type="button">' +
            '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="9" y="9" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V5a2 2 0 0 1 2-2h10" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>' +
            '<span>Copy code</span>' +
          '</button>' +
        '</div>' +
        '<div class="output" data-empty="Press Run ' + escapeHtml(id) + ' to execute this solution"></div>';

      var outEl = card.querySelector('.output');
      var runBtn = card.querySelector('.run-btn');
      var copyBtn = card.querySelector('.copy-btn');

      q.cardEl = card;
      q.outEl = outEl;
      q.runBtn = runBtn;

      runBtn.addEventListener('click', function () { runCode(q); });

      copyBtn.addEventListener('click', function () {
        copyText(code).then(function () {
          copyBtn.classList.add('copied');
          copyBtn.querySelector('span').textContent = 'Copied!';
          setTimeout(function () {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = 'Copy code';
          }, 1500);
        }).catch(function () {
          toast('Copy failed', 'error');
        });
      });

      contentEl.appendChild(card);

      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'q-item';
      item.dataset.id = id;
      item.innerHTML =
        '<span class="q-num">' + escapeHtml(id.replace('Q', '')) + '</span>' +
        '<span class="q-label">' + escapeHtml(truncate(text, 42)) + '</span>';
      item.addEventListener('click', function () {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth <= 900) closeSidebar();
      });
      q.sidebarEl = item;
      qlistEl.appendChild(item);
    });

    if (questions.length === 0) {
      showError('No questions found',
        'Make sure app.js contains "// Q1:" style comment headers for each question.');
      return;
    }

    updateStats();
    bindScrollSpy();

    // Activate the first question by default
    if (questions[0] && questions[0].sidebarEl) {
      questions[0].sidebarEl.classList.add('active');
      activeId = questions[0].id;
    }
  }

  /* ---------- Scroll Spy ---------- */
  function setActive(id) {
    if (activeId === id) return;
    activeId = id;
    questions.forEach(function (q) {
      if (!q.sidebarEl) return;
      q.sidebarEl.classList.toggle('active', q.id === id);
    });
  }

  function updateActiveOnScroll() {
    if (!questions.length) return;
    var containerTop = contentEl.getBoundingClientRect().top + 80;
    var current = questions[0];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      if (!q.cardEl) continue;
      var rect = q.cardEl.getBoundingClientRect();
      if (rect.top <= containerTop) current = q;
    }
    setActive(current.id);
  }

  function bindScrollSpy() {
    var ticking = false;
    contentEl.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        updateActiveOnScroll();
      });
    });
  }

  /* ---------- Search ---------- */
  function filterQuestions(query) {
    var q = (query || '').trim().toLowerCase();
    questions.forEach(function (item) {
      var match = !q ||
        item.id.toLowerCase().indexOf(q) !== -1 ||
        item.text.toLowerCase().indexOf(q) !== -1 ||
        item.code.toLowerCase().indexOf(q) !== -1;
      if (item.cardEl) item.cardEl.style.display = match ? '' : 'none';
      if (item.sidebarEl) item.sidebarEl.style.display = match ? '' : 'none';
    });
  }

  searchEl.addEventListener('input', function () {
    filterQuestions(searchEl.value);
  });

  /* ---------- Run All ---------- */
  runAllBtn.addEventListener('click', function () {
    if (!questions.length) return;
    runAllBtn.disabled = true;
    var originalHtml = runAllBtn.innerHTML;
    runAllBtn.innerHTML = '<span class="spinner"></span><span>Running…</span>';

    var i = 0;
    function step() {
      if (i >= questions.length) {
        runAllBtn.disabled = false;
        runAllBtn.innerHTML = originalHtml;
        toast('All questions executed', 'success');
        return;
      }
      runCode(questions[i++]);
      setTimeout(step, 120);
    }
    step();
  });

  /* ---------- Clear ---------- */
  clearBtn.addEventListener('click', function () {
    questions.forEach(function (q) {
      if (!q.outEl) return;
      q.outEl.innerHTML = '';
      q.outEl.classList.remove('has-output');
      q.cardEl.classList.remove('ran');
      if (q.sidebarEl) q.sidebarEl.classList.remove('ran');
    });
    runSet.clear();
    updateStats();
    toast('Outputs cleared');
  });

  /* ---------- Mobile Sidebar ---------- */
  function openSidebar() {
    sidebarEl.classList.add('open');
    backdropEl.classList.add('show');
  }
  function closeSidebar() {
    sidebarEl.classList.remove('open');
    backdropEl.classList.remove('show');
  }
  menuBtn.addEventListener('click', function () {
    if (sidebarEl.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  backdropEl.addEventListener('click', closeSidebar);

  /* ---------- Keyboard Shortcuts ---------- */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runAllBtn.click();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      searchEl.focus();
      searchEl.select();
    } else if (e.key === 'Escape') {
      if (document.activeElement === searchEl) {
        searchEl.value = '';
        filterQuestions('');
        searchEl.blur();
      }
      closeSidebar();
    }
  });

  /* ---------- Error Panel ---------- */
  function showError(title, detail) {
    contentEl.innerHTML =
      '<div class="error-panel">' +
        '<h2>⚠ ' + escapeHtml(title) + '</h2>' +
        '<p>' + escapeHtml(detail) + '</p>' +
        '<p>If you opened this file directly with <code>file://</code>, the browser blocks ' +
        '<code>fetch()</code> on local files. Serve the folder with a local server instead:</p>' +
        '<pre><code>python -m http.server 5500\n# then open http://localhost:5500</code></pre>' +
        '<p>…or deploy the project to <strong>Vercel</strong> and open the live URL.</p>' +
      '</div>';
    statTotalEl.textContent = '—';
    statRunEl.textContent = '—';
  }

  /* ---------- Init ---------- */
  runAllBtn.disabled = true;

  fetch('app.js', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function (text) {
      render(text);
      runAllBtn.disabled = false;
    })
    .catch(function (err) {
      showError('Could not load app.js', err && err.message ? err.message : 'fetch() failed');
      runAllBtn.disabled = true;
    });
})();