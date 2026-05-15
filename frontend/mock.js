/* mock.js - demo fallback data - Touch of Hope CBO */
const MOCK = {
  stats:{memberCount:47,volunteerCount:23,activecampaigns:4,totalRaised:284000},
  campaigns:[
    {_id:'c1',title:'School Fees Support 2025',description:'Supporting 20 students with school fees.',targetAmount:150000,amountRaised:87500,endDate:'2025-12-31',status:'active',percentageRaised:58},
    {_id:'c2',title:'Orphanage Food Drive',description:'Monthly food donations to Joyful Hearts Orphanage.',targetAmount:60000,amountRaised:43200,endDate:'2025-06-30',status:'active',percentageRaised:72},
    {_id:'c3',title:'Disability Support Fund',description:'Medical and mobility aids for PWDs.',targetAmount:120000,amountRaised:21000,endDate:'2025-09-30',status:'active',percentageRaised:18},
    {_id:'c4',title:'Emergency Flood Relief',description:'Relief for flood-affected families.',targetAmount:80000,amountRaised:80000,endDate:'2024-12-01',status:'completed',percentageRaised:100},
  ],
  events:[
    {_id:'e1',title:'Annual General Meeting 2025',location:'Community Hall, Nairobi',eventDate:'2025-03-29',requiredVolunteers:5,registeredVolunteers:[],description:'Review 2024 activities.'},
    {_id:'e2',title:'Charity Walk – Uhuru Park',location:'Uhuru Park, Nairobi',eventDate:'2025-04-12',requiredVolunteers:15,registeredVolunteers:[],description:'Fundraising walk.'},
    {_id:'e3',title:'Medical Camp – Kibera',location:'Kibera Community Centre',eventDate:'2025-05-03',requiredVolunteers:20,registeredVolunteers:[],description:'Free medical check-ups.'},
  ],
  projects:[
    {_id:'p1',title:'Joyful Hearts Orphanage Support',location:'Ngong, Kajiado',status:'active',impactSummary:'60 children monthly'},
    {_id:'p2',title:'Kibera Scholarship Programme',location:'Kibera, Nairobi',status:'active',impactSummary:'12 students on full scholarships'},
    {_id:'p3',title:'Flood Disaster Response',location:"Murang'a County",status:'completed',impactSummary:'200 families received relief'},
  ],
  announcements:[
    {_id:'a1',title:'AGM Notice – March 29th',content:'All members are notified of the Annual General Meeting on Saturday, 29th March 2025 at Community Hall.',createdAt:'2025-03-01',postedBy:{name:'James Ochieng'}},
    {_id:'a2',title:'School Fees Campaign – 58% Reached!',content:'We are proud to announce our School Fees Support campaign has reached 58% of its target. Thank you!',createdAt:'2025-02-15',postedBy:{name:'Agnes Akinyi'}},
  ],
  donations:[
    {_id:'d1',donorName:'John Kariuki',campaign:{title:'School Fees Support 2025'},amount:5000,paymentMethod:'mpesa',status:'completed',createdAt:'2025-02-28'},
    {_id:'d2',donorName:'Esther Muthoni',campaign:{title:'Orphanage Food Drive'},amount:2500,paymentMethod:'bank',status:'completed',createdAt:'2025-02-25'},
    {_id:'d3',donorName:'Diaspora Group UK',campaign:{title:'School Fees Support 2025'},amount:25000,paymentMethod:'stripe',status:'completed',createdAt:'2025-02-10'},
  ],
  users:[
    {_id:'u1',name:'Agnes Akinyi',email:'chairman@touchofhope.org',phone:'+254712345678',role:'chairman',isActive:true,createdAt:'2022-03-10',membershipNo:'TOH-0001'},
    {_id:'u2',name:'James Ochieng',email:'secretary@touchofhope.org',phone:'+254723456789',role:'secretary',isActive:true,createdAt:'2022-03-10',membershipNo:'TOH-0002'},
    {_id:'u3',name:'Mary Njeri',email:'treasurer@touchofhope.org',phone:'+254734567890',role:'treasurer',isActive:true,createdAt:'2022-03-10',membershipNo:'TOH-0003'},
    {_id:'u4',name:'Faith Wambui',email:'faith@email.com',phone:'+254756789012',role:'member',isActive:false,createdAt:'2025-01-15',membershipNo:'TOH-0004'},
  ],
  volunteers:[
    {_id:'v1',name:'Grace Otieno',email:'grace@email.com',phone:'+254711222333',volunteerProfile:{skills:'Teaching, Mentorship',availability:'weekends',status:'approved'}},
    {_id:'v2',name:'David Mwangi',email:'david@email.com',phone:'+254722333444',volunteerProfile:{skills:'Medical, First Aid',availability:'weekdays',status:'pending'}},
  ],
  backupHistory:[
    {_id:'b3',filename:'toh_backup_auto_2025-03-18.archive.gz',sizeBytes:184320,cloudStatus:'uploaded',status:'success',createdAt:'2025-03-18T02:00:00'},
    {_id:'b2',filename:'toh_backup_auto_2025-03-17.archive.gz',sizeBytes:181248,cloudStatus:'uploaded',status:'success',createdAt:'2025-03-17T02:00:00'},
    {_id:'b1',filename:'toh_backup_manual_2025-03-15.archive.gz',sizeBytes:179200,cloudStatus:'skipped',status:'success',createdAt:'2025-03-15T14:10:00'},
  ],
};

function mockData(method,path){
  if(path.includes('/public/overview'))      return {stats:MOCK.stats,campaigns:MOCK.campaigns,events:MOCK.events,projects:MOCK.projects,announcements:MOCK.announcements};
  if(path.includes('/public/campaigns'))     return MOCK.campaigns;
  if(path.includes('/auth/login'))           return {token:'demo_token',user:{_id:'u1',name:'Agnes Akinyi',role:'chairman',email:'chairman@touchofhope.org',membershipNo:'TOH-0001'}};
  if(path.includes('/members/me'))           return {profile:MOCK.users[0],donations:MOCK.donations,events:[]};
  if(path.includes('/admin/users'))          return MOCK.users;
  if(path.includes('/admin/campaigns'))      return MOCK.campaigns;
  if(path.includes('/admin/events'))         return MOCK.events;
  if(path.includes('/admin/projects'))       return MOCK.projects;
  if(path.includes('/admin/announcements'))  return MOCK.announcements;
  if(path.includes('/admin/volunteers'))     return MOCK.volunteers;
  if(path.includes('/admin/reports/donations')) return {donations:MOCK.donations,total:3,page:1,pages:1};
  if(path.includes('/admin/reports/financial')) return {byMethod:[{_id:'mpesa',total:87500,count:35},{_id:'stripe',total:125000,count:18},{_id:'bank',total:71500,count:12}],monthly:[{_id:'2025-03',total:45000},{_id:'2025-02',total:62000}],summary:{total:284000,count:65,avg:4369}};
  if(path.includes('/backup/list'))          return MOCK.backupHistory;
  if(path.includes('/backup/config'))        return {frequency:'daily',localEnabled:true,cloudEnabled:false,retentionDays:30,backupTime:'02:00'};
  if(path.includes('/backup/run'))           return {message:'Backup complete (demo)',filename:'toh_backup_demo.archive.gz'};
  if(path.includes('/backup/restore'))       return {message:'Restore complete (demo)'};
  if(path.includes('/payments/stripe/publishable-key')) return {key:'pk_test_demo'};
  if(path.includes('/payments/stripe/create-intent'))   return {clientSecret:'pi_demo_secret',donationId:'don_demo'};
  if(path.includes('/payments/mpesa/initiate'))         return {message:'STK Push sent (demo)',checkoutId:'demo_001',donationId:'don_mpesa'};
  if(path.includes('/payments/mpesa/status'))           return {status:'completed',amount:1000,receipt:'QH7BKDEMO'};
  if(path.includes('/payments/paypal/create-order'))    return {orderId:'PAYPAL-DEMO',approveUrl:'#',donationId:'don_pp'};
  if(path.includes('/members/volunteer-events/mine'))   return MOCK.events.slice(0,1);
  if(path.includes('/members/volunteer-events/available')) return MOCK.events;
  return {message:'OK (demo)'};
}
