/* portal.js - view switching, sidebar, navigation - Touch of Hope CBO */
function showPublic(){
  document.getElementById('public-site')?.classList.add('active');
  document.getElementById('auth-page')?.classList.remove('active');
  const p=document.getElementById('portal');if(p)p.style.display='none';
}
function showAuth(tab='login'){
  document.getElementById('public-site')?.classList.remove('active');
  document.getElementById('auth-page')?.classList.add('active');
  const p=document.getElementById('portal');if(p)p.style.display='none';
  switchAuthTab(tab);
}
function goPublic(){showPublic();}
function showPortal(){
  document.getElementById('public-site')?.classList.remove('active');
  document.getElementById('auth-page')?.classList.remove('active');
  const p=document.getElementById('portal');if(p)p.style.display='flex';
  buildSidebar();navigate('dashboard');
}
function showDonatePublic(){showAuth('login');}

function buildSidebar(){
  const role=currentUser?.role||'member';
  const nav=NAV_BY_ROLE[role]||NAV_BY_ROLE.member;
  document.getElementById('sidebar-role-icon').textContent =ROLE_ICONS[role]||'👤';
  document.getElementById('sidebar-role-label').textContent=role.charAt(0).toUpperCase()+role.slice(1);
  document.getElementById('user-avatar-top').textContent   =(currentUser?.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2);
  document.getElementById('user-name-top').textContent     =currentUser?.name||'';
  document.getElementById('user-role-top').textContent     =role;
  let html='';
  nav.forEach(section=>{
    html+=`<div class="nav-label">${section.section}</div>`;
    section.items.forEach(item=>{html+=`<div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">${item.icon} ${item.label}</div>`;});
  });
  document.getElementById('sidebar-nav').innerHTML=html;
}

function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page)?.classList.add('active');
  document.getElementById('nav-'+page)?.classList.add('active');
  document.getElementById('topbar-title').textContent=PAGE_TITLES[page]||page;
  loadPage(page);
}

async function loadPage(page){
  switch(page){
    case 'dashboard':        return loadDashboard();
    case 'profile':          return loadProfile();
    case 'users':            return loadUsers();
    case 'campaigns':        return loadCampaigns();
    case 'events':           return loadEvents();
    case 'projects':         return loadProjects();
    case 'finances':         return loadFinances();
    case 'announcements':    return loadAnnouncements();
    case 'volunteers':       return loadVolunteers();
    case 'backup':           return loadBackup();
    case 'donate':           return loadDonate();
    case 'volunteer-portal': return loadVolPortal();
    case 'constitution':     return renderConstitution();
  }
}

window.addEventListener('load',async()=>{
  const l=document.getElementById('loading');
  if(l){l.style.transition='opacity .3s';l.style.opacity='0';setTimeout(()=>l.style.display='none',300);}
  loadPublicSite();
  if(authToken&&currentUser) showPortal();
  else showPublic();
});
