/* page.public.js - public website data loader - Touch of Hope CBO */
async function loadPublicSite() {
  try {
    const d = await api('GET','/public/overview',null,false);
    const s = d.stats || MOCK.stats;
    document.getElementById('ps-members').textContent   = s.memberCount   || 47;
    document.getElementById('ps-raised').textContent    = 'KSh '+fmtNum(s.totalRaised||284000);
    document.getElementById('ps-campaigns').textContent = s.activecampaigns||4;
    document.getElementById('ps-vols').textContent      = s.volunteerCount  ||23;

    const anns = d.announcements||MOCK.announcements;
    document.getElementById('pub-announcements').innerHTML = anns.slice(0,4).map(a=>`
      <div class="pub-card">
        <h3>${a.title}</h3><p>${(a.content||'').substring(0,120)}…</p>
        <p style="font-size:11px;color:var(--brown);margin-top:8px;font-weight:600;">${fmtDate(a.createdAt)}</p>
      </div>`).join('');

    const cams = (d.campaigns||MOCK.campaigns).filter(c=>c.status==='active');
    document.getElementById('pub-campaigns').innerHTML = cams.slice(0,3).map(c=>{
      const pct = c.percentageRaised ?? Math.min(100,Math.round((c.amountRaised/c.targetAmount)*100));
      return `<div class="pub-card">
        <div class="badge badge-active" style="margin-bottom:10px;">Active</div>
        <h3>${c.title}</h3><p style="margin-bottom:12px;">${(c.description||'').substring(0,80)}…</p>
        <div class="progress" style="margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-lt);">
          <span>KSh ${fmtNum(c.amountRaised)} raised</span><span>${pct}%</span>
        </div>
        <button class="btn btn-primary btn-sm btn-block" style="margin-top:14px;" onclick="showAuth()">Donate →</button>
      </div>`;
    }).join('');

    const evs = d.events||MOCK.events;
    document.getElementById('pub-events').innerHTML = evs.slice(0,3).map(ev=>`
      <div class="pub-card">
        <div style="background:var(--brown);color:#fff;display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;margin-bottom:8px;">📅 ${fmtDate(ev.eventDate)}</div>
        <h3>${ev.title}</h3><p>📍 ${ev.location}</p>
        <p style="margin-top:6px;">${(ev.description||'').substring(0,80)}…</p>
      </div>`).join('');

    const pjs = d.projects||MOCK.projects;
    document.getElementById('pub-projects').innerHTML = pjs.slice(0,3).map(p=>`
      <div class="pub-card">
        <div class="badge ${p.status==='active'?'badge-active':'badge-completed'}" style="margin-bottom:10px;">${p.status}</div>
        <h3>${p.title}</h3><p>📍 ${p.location}</p>
        <p style="margin-top:6px;color:var(--green);font-weight:600;font-size:12.5px;">✓ ${p.impactSummary}</p>
      </div>`).join('');
  } catch(e) { console.error('Public load error',e); }
}
