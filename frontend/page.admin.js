/* page.admin.js - all admin pages - Touch of Hope CBO */

// ── USERS ─────────────────────────────────────────────────────────
async function loadUsers(){
  try{
    const users=await api('GET','/admin/users');
    document.getElementById('users-tbody').innerHTML=users.map(u=>`
      <tr>
        <td><div class="flex gap-12">
          <div class="avatar">${(u.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <div><div style="font-weight:600;font-size:13.5px;">${u.name}</div><div style="font-size:11.5px;color:var(--ink-lt);">${u.email} · ${u.membershipNo||''}</div></div>
        </div></td>
        <td><span style="color:${ROLE_COLORS[u.role]||'#555'};font-weight:600;">${u.role}</span></td>
        <td>${u.phone||'—'}</td>
        <td><span class="badge ${u.isActive?'badge-active':'badge-pending'}">${u.isActive?'Active':'Pending'}</span></td>
        <td style="font-size:12px;">${fmtDate(u.createdAt)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          ${!u.isActive?`<button class="btn btn-sm btn-success" onclick="approveUser('${u._id}')">Approve</button>`:''}
          <select class="form-control" style="padding:5px 8px;font-size:12px;" onchange="changeRole('${u._id}',this.value)">
            ${['member','volunteer','secretary','treasurer','chairman'].map(r=>`<option ${r===u.role?'selected':''}>${r}</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-danger" onclick="suspendUser('${u._id}')">Suspend</button>
        </td>
      </tr>`).join('');
  }catch(e){toast('Could not load users',true);}
}
async function approveUser(id){try{await api('PUT',`/admin/users/${id}/approve`);toast('User approved and email sent ✓');loadUsers();}catch(e){toast(e.message,true);}}
async function changeRole(id,role){try{await api('PUT',`/admin/users/${id}/role`,{role});toast('Role updated');}catch(e){toast(e.message,true);}}
async function suspendUser(id){if(!confirm('Suspend this user?'))return;try{await api('PUT',`/admin/users/${id}/suspend`);toast('User suspended');loadUsers();}catch(e){toast(e.message,true);}}

// ── CAMPAIGNS ─────────────────────────────────────────────────────
async function loadCampaigns(){
  try{
    const cams=await api('GET','/admin/campaigns')||MOCK.campaigns;
    document.getElementById('campaigns-list').innerHTML=cams.map(c=>{
      const pct=c.percentageRaised??Math.min(100,Math.round((c.amountRaised/c.targetAmount)*100));
      const sc=c.status==='active'?'badge-active':c.status==='completed'?'badge-completed':'badge-pending';
      return `<div class="panel" style="margin:0;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
          <h4 style="font-size:14.5px;font-weight:700;">${c.title}</h4>
          <span class="badge ${sc}">${c.status}</span>
        </div>
        <p style="font-size:12.5px;color:var(--ink-lt);margin-bottom:12px;">${(c.description||'').substring(0,90)}</p>
        <div class="progress" style="margin-bottom:6px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-lt);">
          <span>KSh ${fmtNum(c.amountRaised)} / KSh ${fmtNum(c.targetAmount)}</span><span>${pct}%</span>
        </div>
        <div style="font-size:11.5px;color:var(--ink-lt);margin-top:4px;">Ends: ${fmtDate(c.endDate)}</div>
        <div style="margin-top:10px;display:flex;gap:6px;">
          <button class="btn btn-sm btn-danger" onclick="deleteCampaign('${c._id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  }catch(e){toast('Could not load campaigns',true);}
}
async function saveCampaign(){
  const title=document.getElementById('c-title').value.trim();
  const target=parseInt(document.getElementById('c-target').value);
  if(!title){toast('Title is required',true);return;}
  if(!target||target<1){toast('Enter a valid target amount',true);return;}
  try{
    await api('POST','/admin/campaigns',{title,description:document.getElementById('c-desc').value,targetAmount:target,endDate:document.getElementById('c-end').value||null});
    closeModal('modal-campaign');loadCampaigns();toast('Campaign created!');
    ['c-title','c-desc','c-target','c-end'].forEach(id=>document.getElementById(id).value='');
  }catch(e){toast(e.message,true);}
}
async function deleteCampaign(id){if(!confirm('Delete this campaign?'))return;try{await api('DELETE',`/admin/campaigns/${id}`);loadCampaigns();toast('Deleted');}catch(e){toast(e.message,true);}}

// ── EVENTS ────────────────────────────────────────────────────────
async function loadEvents(){
  try{
    const evs=await api('GET','/admin/events')||MOCK.events;
    document.getElementById('events-list').innerHTML=evs.map(ev=>`
      <div style="border:1.5px solid var(--cream-dk);border-radius:var(--r);padding:16px;transition:.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow=''">
        <div style="background:var(--brown);color:#fff;display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;margin-bottom:8px;">📅 ${fmtDate(ev.eventDate)}</div>
        <h4 style="font-size:14px;font-weight:700;margin-bottom:6px;">${ev.title}</h4>
        <p style="font-size:12.5px;color:var(--ink-lt);margin-bottom:4px;">📍 ${ev.location||'—'}</p>
        <p style="font-size:12px;color:var(--ink-lt);">👥 ${ev.requiredVolunteers||0} needed · ${ev.registeredVolunteers?.length||0} registered</p>
        <p style="font-size:12.5px;color:var(--ink-lt);margin-top:6px;">${(ev.description||'').substring(0,80)}</p>
        <button class="btn btn-sm btn-danger" style="margin-top:8px;" onclick="deleteEvent('${ev._id}')">Delete</button>
      </div>`).join('');
  }catch(e){toast('Could not load events',true);}
}
async function saveEvent(){
  const title=document.getElementById('e-title').value.trim();
  const date=document.getElementById('e-date').value;
  if(!title){toast('Title is required',true);return;}
  if(!date){toast('Event date is required',true);return;}
  try{
    await api('POST','/admin/events',{title,eventDate:date,location:document.getElementById('e-loc').value,requiredVolunteers:parseInt(document.getElementById('e-vols').value)||0,description:document.getElementById('e-desc').value});
    closeModal('modal-event');loadEvents();toast('Event created!');
    ['e-title','e-date','e-loc','e-desc'].forEach(id=>document.getElementById(id).value='');
  }catch(e){toast(e.message,true);}
}
async function deleteEvent(id){if(!confirm('Delete this event?'))return;try{await api('DELETE',`/admin/events/${id}`);loadEvents();toast('Deleted');}catch(e){toast(e.message,true);}}

// ── PROJECTS ──────────────────────────────────────────────────────
async function loadProjects(){
  try{
    const pjs=await api('GET','/admin/projects')||MOCK.projects;
    document.getElementById('projects-tbody').innerHTML=pjs.map(p=>{
      const sc=p.status==='active'?'badge-active':p.status==='completed'?'badge-completed':'badge-pending';
      return `<tr>
        <td><strong>${p.title}</strong><br/><span style="font-size:12px;color:var(--ink-lt);">${(p.description||'').substring(0,60)}</span></td>
        <td>${p.location||'—'}</td>
        <td><span class="badge ${sc}">${p.status}</span></td>
        <td style="font-size:12px;color:var(--green);font-weight:600;">${p.impactSummary||'—'}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteProject('${p._id}')">Delete</button></td>
      </tr>`;
    }).join('');
  }catch(e){toast('Could not load projects',true);}
}
async function saveProject(){
  const title=document.getElementById('p-title').value.trim();
  if(!title){toast('Title is required',true);return;}
  try{
    await api('POST','/admin/projects',{title,location:document.getElementById('p-loc').value,startDate:document.getElementById('p-start').value||null,status:document.getElementById('p-status').value,description:document.getElementById('p-desc').value,impactSummary:document.getElementById('p-impact').value});
    closeModal('modal-project');loadProjects();toast('Project saved!');
    ['p-title','p-loc','p-start','p-desc','p-impact'].forEach(id=>document.getElementById(id).value='');
  }catch(e){toast(e.message,true);}
}
async function deleteProject(id){if(!confirm('Delete this project?'))return;try{await api('DELETE',`/admin/projects/${id}`);loadProjects();toast('Deleted');}catch(e){toast(e.message,true);}}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────
async function loadAnnouncements(){
  try{
    const anns=await api('GET','/admin/announcements')||MOCK.announcements;
    document.getElementById('anns-list').innerHTML=anns.map(a=>`
      <div class="ann-card" style="position:relative;">
        <h4>${a.title}</h4><p>${a.content}</p>
        <div class="ann-meta">Posted ${fmtDate(a.createdAt)} · ${a.postedBy?.name||''} · <span class="badge ${a.isPublic?'badge-active':'badge-pending'}">${a.isPublic?'Public':'Private'}</span></div>
        <button class="btn btn-sm btn-danger" style="position:absolute;top:12px;right:12px;" onclick="deleteAnn('${a._id}')">Delete</button>
      </div>`).join('');
  }catch(e){toast('Could not load announcements',true);}
}
async function saveAnnouncement(){
  const title=document.getElementById('a-title').value.trim();
  const content=document.getElementById('a-content').value.trim();
  if(!title){toast('Title is required',true);return;}
  if(!content){toast('Content is required',true);return;}
  try{
    await api('POST','/admin/announcements',{title,content,isPublic:document.getElementById('a-public').checked});
    closeModal('modal-ann');loadAnnouncements();toast('Announcement posted!');
    document.getElementById('a-title').value='';document.getElementById('a-content').value='';
  }catch(e){toast(e.message,true);}
}
async function deleteAnn(id){if(!confirm('Delete announcement?'))return;try{await api('DELETE',`/admin/announcements/${id}`);loadAnnouncements();toast('Deleted.');}catch(e){toast(e.message,true);}}

// ── VOLUNTEERS ────────────────────────────────────────────────────
async function loadVolunteers(){
  try{
    const vols=await api('GET','/admin/volunteers')||MOCK.volunteers;
    document.getElementById('vols-tbody').innerHTML=vols.map(v=>{
      const vp=v.volunteerProfile||{};
      return `<tr>
        <td><div class="flex gap-12">
          <div class="avatar">${(v.name||'V').split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <div><div style="font-weight:600;">${v.name}</div><div style="font-size:11.5px;color:var(--ink-lt);">${v.email}</div></div>
        </div></td>
        <td>${(vp.skills||'').split(',').map(s=>`<span style="background:var(--cream-dk);border-radius:12px;padding:2px 9px;font-size:11px;margin:2px;display:inline-block;">${s.trim()}</span>`).join('')}</td>
        <td>${vp.availability||'—'}</td>
        <td><span class="badge ${vp.status==='approved'?'badge-approved':'badge-pending'}">${vp.status||'—'}</span></td>
        <td>
          ${vp.status==='pending'?`<button class="btn btn-sm btn-success" onclick="approveVol('${v._id}')">Approve</button>`:'<span style="color:var(--green);font-size:12px;">✓ Active</span>'}
        </td>
      </tr>`;
    }).join('');
  }catch(e){toast('Could not load volunteers',true);}
}
async function approveVol(id){try{await api('PUT',`/admin/volunteers/${id}/approve`);toast('Volunteer approved!');loadVolunteers();}catch(e){toast(e.message,true);}}

// ── VOLUNTEER PORTAL (self-service) ──────────────────────────────
async function loadVolPortal(){
  try{
    const[myEvs,avEvs]=await Promise.all([api('GET','/members/volunteer-events/mine'),api('GET','/members/volunteer-events/available')]);
    document.getElementById('vol-my-events').innerHTML=(myEvs||[]).length
      ?(myEvs).map(ev=>`<div style="padding:12px;border-bottom:1px solid var(--cream-dk);"><strong>${ev.title}</strong><br/><span style="color:var(--ink-lt);">📅 ${fmtDate(ev.eventDate)} · 📍 ${ev.location||'—'}</span></div>`).join('')
      :'<p style="color:var(--ink-lt);font-size:13px;padding:12px;">No events joined yet.</p>';
    document.getElementById('vol-avail-events').innerHTML=(avEvs||MOCK.events).map(ev=>`
      <div style="padding:12px;border-bottom:1px solid var(--cream-dk);">
        <strong>${ev.title}</strong><br/>
        <span style="color:var(--ink-lt);font-size:12.5px;">📅 ${fmtDate(ev.eventDate)} · ${ev.requiredVolunteers||0} needed</span>
        <button class="btn btn-sm btn-ghost" style="margin-top:6px;" onclick="joinEvent('${ev._id}')">Join →</button>
      </div>`).join('');
  }catch(e){console.error(e);}
}
async function joinEvent(id){try{await api('POST',`/members/volunteer-events/${id}/join`);toast('Joined event!');loadVolPortal();}catch(e){toast(e.message,true);}}
async function submitVolApp(){
  const skills=document.getElementById('vol-skills').value.trim();
  if(!skills){toast('Please enter your skills',true);return;}
  try{
    await api('POST','/members/volunteer-apply',{skills,availability:document.getElementById('vol-avail').value,bio:document.getElementById('vol-bio').value});
    toast('Application submitted! Pending secretary approval.');
  }catch(e){toast(e.message,true);}
}

// ── FINANCES ──────────────────────────────────────────────────────
async function loadFinances(){
  try{
    const[rep,don]=await Promise.all([api('GET','/admin/reports/financial'),api('GET','/admin/reports/donations?limit=30')]);
    const s=rep.summary||{total:284000,count:65,avg:4369};
    document.getElementById('fin-stats').innerHTML=`
      <div class="stat-card c-brown"><div class="stat-label">Total Raised</div><div class="stat-value">KSh ${fmtNum(s.total)}</div><div class="stat-sub">${s.count} donations</div></div>
      <div class="stat-card c-green"><div class="stat-label">Avg Donation</div><div class="stat-value">KSh ${fmtNum(s.avg)}</div></div>
      <div class="stat-card c-orange"><div class="stat-label">M-Pesa</div><div class="stat-value">KSh ${fmtNum((rep.byMethod||[]).find(m=>m._id==='mpesa')?.total||0)}</div></div>
      <div class="stat-card c-teal"><div class="stat-label">Card/Online</div><div class="stat-value">KSh ${fmtNum((rep.byMethod||[]).find(m=>m._id==='stripe')?.total||0)}</div></div>`;
    const donations=(don?.donations||MOCK.donations);
    document.getElementById('donations-tbody').innerHTML=donations.map(d=>`
      <tr>
        <td><strong>${d.donorName}</strong>${d.donorUser?`<br/><span style="font-size:11px;color:var(--ink-lt);">${d.donorUser.email||''}</span>`:''}</td>
        <td style="font-size:12.5px;">${d.campaign?.title||'General Fund'}</td>
        <td><strong style="color:var(--green);">KSh ${fmtNum(d.amount)}</strong></td>
        <td><span class="badge badge-${d.paymentMethod}">${d.paymentMethod}</span></td>
        <td><span class="badge ${d.status==='completed'?'badge-active':d.status==='pending'?'badge-pending':'badge-inactive'}">${d.status}</span></td>
        <td style="font-size:12px;">${fmtDate(d.createdAt)}</td>
      </tr>`).join('');
  }catch(e){console.error(e);}
}
async function recordDonation(){
  const donor=document.getElementById('d-donor').value.trim();
  const amount=parseInt(document.getElementById('d-amount').value);
  if(!donor){toast('Donor name required',true);return;}
  if(!amount||amount<1){toast('Enter a valid amount',true);return;}
  try{
    await api('POST','/payments/manual',{donorName:donor,donorEmail:document.getElementById('d-email')?.value||null,campaignId:document.getElementById('d-campaign').value||null,amount,method:document.getElementById('d-method').value,reference:document.getElementById('d-ref').value,date:document.getElementById('d-date').value,notes:document.getElementById('d-notes')?.value});
    closeModal('modal-donation');loadFinances();toast('Donation recorded!');
    ['d-donor','d-amount','d-ref'].forEach(id=>document.getElementById(id).value='');
  }catch(e){toast(e.message,true);}
}
