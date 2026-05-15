/* api.js - API helper, auth state, utility functions - Touch of Hope CBO */
let authToken   = localStorage.getItem('toh_token') || null;
let currentUser = JSON.parse(localStorage.getItem('toh_user') || 'null');

async function api(method, path, body = null, auth = true) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (auth && authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
  if (body) opts.body = JSON.stringify(body);
  try {
    const r    = await fetch(API + path, opts);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  } catch (e) {
    if (e.name === 'TypeError' || e.message.includes('fetch')) return mockData(method, path, body);
    throw e;
  }
}

function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'toast show' + (isError ? ' toast-error' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 4500);
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function fmtNum(n) {
  n = parseFloat(n) || 0;
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (n >= 1000)    return (n/1000).toFixed(n%1000===0?0:1)+'K';
  return n.toLocaleString();
}
function fmtBytes(b) {
  if (!b) return '—';
  if (b > 1048576) return (b/1048576).toFixed(1)+' MB';
  if (b > 1024)    return (b/1024).toFixed(1)+' KB';
  return b+' B';
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'});
}
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
});
