import { formatPhone } from './filter.js';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const CSS = `
:root{--bg:#0d0f12;--card:#171a1f;--line:#262b33;--fg:#eef1f5;--dim:#98a1ae;
--accent:#4da3ff;--ok:#39d98a;--amber:#ffb020;--red:#ff5a5a}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font:16px/1.45 -apple-system,BlinkMacSystemFont,
"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:0 0 64px}
header{position:sticky;top:0;z-index:10;background:#0d0f12f2;backdrop-filter:blur(8px);
border-bottom:1px solid var(--line);padding:14px 16px 12px}
h1{font-size:19px;margin:0 0 2px;letter-spacing:-.01em}
.meta{font-size:13px;color:var(--dim)}
.hours{margin-top:8px;font-size:13px;color:var(--amber);border:1px solid #3a2f14;
background:#221a08;border-radius:8px;padding:8px 10px}
#counter{margin-top:8px;font-size:14px;font-weight:600;color:var(--ok)}
#counter.warn{color:var(--amber)} #counter.hot{color:var(--red)}
#counter .note{display:block;font-weight:400;font-size:12.5px;margin-top:3px;line-height:1.35}
main{padding:12px 12px 0;max-width:640px;margin:0 auto}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;
padding:14px;margin:0 0 12px}
.card.done{opacity:.42}
.card.done .name,.card.done .msg{text-decoration:line-through}
.name{font-size:17px;font-weight:700;margin:0 0 3px;letter-spacing:-.01em}
.sub{font-size:13px;color:var(--dim);margin-bottom:8px}
.tag{display:inline-block;background:#20262e;border-radius:999px;padding:2px 9px;
font-size:12px;color:#b9c3d0;margin-right:6px}
.phone{font-variant-numeric:tabular-nums;font-size:15px;color:#dbe3ec;margin-bottom:10px}
.msg{white-space:pre-wrap;font-size:14px;color:#c9d2dd;background:#11141a;
border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:12px}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
button,a.btn{display:flex;align-items:center;justify-content:center;min-height:52px;
border-radius:11px;font-size:15px;font-weight:650;border:1px solid var(--line);
text-decoration:none;cursor:pointer;font-family:inherit}
.copy{background:#20262e;color:var(--fg)}
.copy.copied{background:#123524;border-color:#1d5b3d;color:var(--ok)}
.sms{background:var(--accent);color:#06111f;border-color:#2b7fd6}
footer{max-width:640px;margin:22px auto 0;padding:0 16px;color:var(--dim);font-size:12.5px}
.empty{padding:40px 16px;text-align:center;color:var(--dim)}
`;

const CLIENT_JS = `
(function(){
  var isIOS = /iP(hone|ad|od)|Mac/i.test(navigator.userAgent) && !window.MSStream;
  var sep = isIOS ? '?' : '&';
  var counter = document.getElementById('counter');
  var noteEl = document.getElementById('counterNote');
  var todayKey = 'leadboard:' + document.body.dataset.date + ':';

  function sentIds(){
    var out = [];
    for (var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if (k && k.indexOf(todayKey) === 0) out.push(k);
    }
    return out;
  }
  function paintCounter(){
    var n = sentIds().length;
    counter.firstChild.nodeValue = 'Sent today: ' + n + ' ';
    counter.className = n >= 60 ? 'hot' : (n >= 40 ? 'warn' : '');
    noteEl.textContent = n >= 40
      ? 'Slow down — high volume from a personal number gets carrier-flagged as spam.'
      : '';
  }
  function markDone(card){
    var id = card.dataset.id;
    localStorage.setItem(todayKey + id, '1');
    card.classList.add('done');
    paintCounter();
  }

  var cards = document.querySelectorAll('.card');
  for (var i=0;i<cards.length;i++){
    (function(card){
      var id = card.dataset.id;
      if (localStorage.getItem(todayKey + id)) card.classList.add('done');

      var a = card.querySelector('a.sms');
      a.href = 'sms:' + card.dataset.phone + sep + 'body=' + card.dataset.body;
      a.addEventListener('click', function(){ markDone(card); });

      var b = card.querySelector('button.copy');
      b.addEventListener('click', function(){
        var text = decodeURIComponent(card.dataset.body.replace(/\\+/g,' '));
        var done = function(){
          b.classList.add('copied');
          var prev = b.textContent;
          b.textContent = 'Copied \\u2713';
          setTimeout(function(){ b.textContent = prev; b.classList.remove('copied'); }, 1500);
          markDone(card);
        };
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch(e){}
          document.body.removeChild(ta); done();
        }
      });
    })(cards[i]);
  }
  paintCounter();
})();
`;

export function renderCard(lead) {
  const body = encodeURIComponent(lead.message);
  return `<article class="card" data-id="${esc(lead.placeId)}" data-phone="+1${esc(lead.phone)}" data-body="${esc(body)}">
  <h2 class="name">${esc(lead.name)}</h2>
  <div class="sub"><span class="tag">${esc(lead.vertical)}</span>${esc(lead.city)}, ${esc(lead.state)}</div>
  <div class="phone">${esc(formatPhone(lead.phone))}</div>
  <div class="msg">${esc(lead.message)}</div>
  <div class="btns">
    <button class="copy" type="button">Copy message</button>
    <a class="btn sms" href="sms:+1${esc(lead.phone)}">Text now &rarr;</a>
  </div>
</article>`;
}

export function renderPage(leads, { date, capped = false } = {}) {
  const pretty = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
  const cards = leads.length
    ? leads.map(renderCard).join('\n')
    : '<p class="empty">No leads today.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="dark">
<title>Lead Board — ${esc(pretty)}</title>
<style>${CSS}</style>
</head>
<body data-date="${esc(date)}">
<header>
  <h1>Lead Board</h1>
  <div class="meta">${esc(pretty)} &middot; ${leads.length} leads${capped ? ' &middot; API cap hit' : ''}</div>
  <div class="hours">Business hours only — 9AM to 7PM local. Never before 8AM or after 9PM.</div>
  <div id="counter">Sent today: 0 <span class="note" id="counterNote"></span></div>
</header>
<main>
${cards}
</main>
<footer>Reply STOP handling: run <code>npm run suppress -- &lt;place_id&gt;</code>. Regenerated daily at 8AM Pacific.</footer>
<script>${CLIENT_JS}</script>
</body>
</html>`;
}
