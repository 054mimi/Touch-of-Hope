/* page.dashboard.js - Touch of Hope CBO */
async function loadDashboard() {
  const role = currentUser?.role||'member';
  document.getElementById('dash-hero').innerHTML = `
    <div style="background:linear-gradient(135deg,var(--ink),#3d2a10);border-radius:16px;padding:28px 32px;color:#fff;position:relative;overflow:hidden;">
      <div style="position:absolute;right:-30px;top:-30px;width:160px;height:160px;background:rgba(196,122,43,.12);border-radius:50%;"></div>
      <h2 style="font-family:'Playfair Display',serif;font-size:21px;font-weight:700;margin-bottom:5px;">Welcome, ${(currentUser?.name||'User').split(' ')[0]} 👋</h2>
      <p style="font-size:13.5px;opacity:.7;max-width:420px;line-height:1.5;">Signed in as <strong style="color:var(--brown-lt);">${role}</strong> · Membership No: <strong style="color:var(--brown-lt);">${currentUser?.membershipNo||'—'}</strong></p>
    </div>`;

  // Fetch live stats
  try {
    const d = await api('GET','/public/overview',null,false);
    const s = d.stats||MOCK.stats;
    document.getElementById('dash-stats').innerHTML = `
      <div class="stat-card c-brown"><div class="stat-label">Members</div><div class="stat-value">${s.memberCount||47}</div><div class="stat-sub">Registered</div></div>
      <div class="stat-card c-green"><div class="stat-label">Funds Raised</div><div class="stat-value">KSh ${fmtNum(s.totalRaised||284000)}</div><div class="stat-sub">All time</div></div>
      <div class="stat-card c-orange"><div class="stat-label">Campaigns</div><div class="stat-value">${s.activecampaigns||4}</div><div class="stat-sub">Active</div></div>
      <div class="stat-card c-teal"><div class="stat-label">Volunteers</div><div class="stat-value">${s.volunteerCount||23}</div><div class="stat-sub">Approved</div></div>`;

    const cams = (d.campaigns||MOCK.campaigns).filter(c=>c.status==='active');
    document.getElementById('dash-campaigns').innerHTML = cams.map(c=>{
      const pct = c.percentageRaised??Math.min(100,Math.round((c.amountRaised/c.targetAmount)*100));
      return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px;">
          <span>${c.title}</span><span style="color:var(--brown)">${pct}%</span>
        </div>
        <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:11.5px;color:var(--ink-lt);margin-top:3px;">KSh ${fmtNum(c.amountRaised)} of KSh ${fmtNum(c.targetAmount)}</div>
      </div>`;
    }).join('');

    const anns = d.announcements||MOCK.announcements;
    document.getElementById('dash-anns').innerHTML = anns.map(a=>`
      <div class="ann-card"><h4>${a.title}</h4><p>${(a.content||'').substring(0,100)}…</p>
      <div class="ann-meta">${fmtDate(a.createdAt)}</div></div>`).join('');
  } catch(e) { console.error(e); }
}
