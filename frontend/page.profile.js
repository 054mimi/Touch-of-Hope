/* page.profile.js - Touch of Hope CBO */
async function loadProfile() {
  try {
    const r = await api('GET','/members/me');
    const p = r.profile||currentUser;
    document.getElementById('prof-name').value  = p.name||'';
    document.getElementById('prof-email').value = p.email||'';
    document.getElementById('prof-phone').value = p.phone||'';
    document.getElementById('prof-role').value  = (p.role||'').toUpperCase();
    if (document.getElementById('prof-membership'))
      document.getElementById('prof-membership').value = p.membershipNo||'—';

    const dn = r.donations||MOCK.donations.slice(0,3);
    document.getElementById('my-donations').innerHTML = dn.length
      ? dn.map(d=>`
          <div class="flex gap-12" style="padding:10px 0;border-bottom:1px solid var(--cream-dk);">
            <div style="flex:1;">
              <div style="font-size:13.5px;font-weight:600;">${d.campaign?.title||'General Fund'}</div>
              <div style="font-size:12px;color:var(--ink-lt);">${fmtDate(d.createdAt)} · ${d.paymentMethod?.toUpperCase()}</div>
            </div>
            <strong style="color:var(--green);">KSh ${fmtNum(d.amount)}</strong>
          </div>`).join('')
      : '<p style="color:var(--ink-lt);font-size:13px;">No donations yet.</p>';
  } catch(e) { toast('Could not load profile',true); }
}

async function saveProfile() {
  const name  = document.getElementById('prof-name').value.trim();
  const phone = document.getElementById('prof-phone').value.trim();
  if (!name) { toast('Name cannot be empty',true); return; }
  try {
    await api('PUT','/members/me',{name,phone});
    // Update local cache
    currentUser.name = name;
    localStorage.setItem('toh_user',JSON.stringify(currentUser));
    document.getElementById('user-name-top').textContent = name;
    toast('Profile updated successfully!');
  } catch(e) { toast(e.message,true); }
}

async function changePassword() {
  const old = document.getElementById('pw-old').value;
  const nw  = document.getElementById('pw-new').value;
  if (!old||!nw) { toast('Enter both passwords',true); return; }
  const err = validatePassword(nw);
  if (err) { toast(err,true); return; }
  try {
    await api('POST','/auth/change-password',{oldPassword:old,newPassword:nw});
    toast('Password changed successfully!');
    document.getElementById('pw-old').value='';
    document.getElementById('pw-new').value='';
  } catch(e) { toast(e.message,true); }
}
