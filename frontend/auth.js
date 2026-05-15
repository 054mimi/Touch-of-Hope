/* auth.js - login, register, logout - Touch of Hope CBO */
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab==='login');
  document.getElementById('tab-register').classList.toggle('active', tab==='register');
  document.getElementById('form-login').classList.toggle('hide', tab!=='login');
  document.getElementById('form-register').classList.toggle('hide', tab!=='register');
}

// ── Password strength validator ───────────────────────────────────
function validatePassword(pw) {
  if (pw.length < 8)      return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))  return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(pw))  return 'Password must contain a number';
  return null;
}
