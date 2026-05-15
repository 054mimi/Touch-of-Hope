/* ================================================================
   config.js — API endpoint, role definitions, navigation config
   Touch of Hope CBO  |  Change API_URL to your deployed server
================================================================ */

const API = 'http://localhost:5000/api';   // ← change for production

const ROLE_ICONS  = { chairman:'👑', treasurer:'💰', secretary:'📋', volunteer:'🤝', member:'👤' };
const ROLE_COLORS = { chairman:'#c47a2b', treasurer:'#6a3ab5', secretary:'#2a8c7a', volunteer:'#2d7a1c', member:'#555' };

const NAV_BY_ROLE = {
  chairman: [
    { section:'Main', items:[
      {id:'dashboard',label:'Dashboard',icon:'⊞'},
      {id:'profile',label:'My Profile',icon:'👤'},
      {id:'donate',label:'Make Donation',icon:'💛'},
    ]},
    { section:'Management', items:[
      {id:'users',label:'Users',icon:'👥'},
      {id:'volunteers',label:'Volunteers',icon:'🤝'},
      {id:'campaigns',label:'Campaigns',icon:'💰'},
      {id:'events',label:'Events',icon:'📅'},
      {id:'projects',label:'Projects',icon:'🌱'},
    ]},
    { section:'Admin', items:[
      {id:'finances',label:'Finances',icon:'💵'},
      {id:'announcements',label:'Announcements',icon:'📢'},
      {id:'backup',label:'Backup & Restore',icon:'🗃️'},
      {id:'constitution',label:'Constitution',icon:'📜'},
    ]},
  ],
  treasurer:[
    { section:'Main', items:[{id:'dashboard',label:'Dashboard',icon:'⊞'},{id:'profile',label:'My Profile',icon:'👤'},{id:'donate',label:'Make Donation',icon:'💛'}]},
    { section:'Finance', items:[{id:'finances',label:'Finances',icon:'💵'},{id:'campaigns',label:'Campaigns',icon:'💰'}]},
    { section:'Reference', items:[{id:'constitution',label:'Constitution',icon:'📜'}]},
  ],
  secretary:[
    { section:'Main', items:[{id:'dashboard',label:'Dashboard',icon:'⊞'},{id:'profile',label:'My Profile',icon:'👤'}]},
    { section:'Operations', items:[{id:'volunteers',label:'Volunteers',icon:'🤝'},{id:'events',label:'Events',icon:'📅'},{id:'announcements',label:'Announcements',icon:'📢'}]},
    { section:'Reference', items:[{id:'constitution',label:'Constitution',icon:'📜'}]},
  ],
  volunteer:[
    { section:'Main', items:[{id:'dashboard',label:'Dashboard',icon:'⊞'},{id:'profile',label:'My Profile',icon:'👤'},{id:'donate',label:'Make Donation',icon:'💛'},{id:'volunteer-portal',label:'My Volunteer Hub',icon:'🤝'}]},
    { section:'Reference', items:[{id:'constitution',label:'Constitution',icon:'📜'}]},
  ],
  member:[
    { section:'Main', items:[{id:'dashboard',label:'Dashboard',icon:'⊞'},{id:'profile',label:'My Profile',icon:'👤'},{id:'donate',label:'Make Donation',icon:'💛'}]},
    { section:'Reference', items:[{id:'constitution',label:'Constitution',icon:'📜'}]},
  ],
};

const PAGE_TITLES = {
  dashboard:'Dashboard', profile:'My Profile', donate:'Make a Donation',
  users:'User Management', campaigns:'Campaigns', events:'Events',
  projects:'Projects', finances:'Finances', announcements:'Announcements',
  volunteers:'Volunteers', backup:'Backup & Restore', constitution:'Constitution',
  'volunteer-portal':'My Volunteer Hub',
};
