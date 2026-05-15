/* page.backup.js - backup manager - Touch of Hope CBO */
let backupFreq='daily';

async function loadBackup(){
  try{
    const cfg=await api('GET','/admin/backup/config');
    if(cfg){
      setFreq(cfg.frequency||'daily');
      document.getElementById('backup-time').value=(cfg.backupTime||'02:00').slice(0,5);
      document.getElementById('backup-retention').value=cfg.retentionDays||30;
      setToggle('local',cfg.localEnabled);
      setToggle('cloud',cfg.cloudEnabled);
      if(cfg.cloudProvider) document.getElementById('cloud-provider').value=cfg.cloudProvider;
      if(cfg.bucketName)    document.getElementById('cloud-bucket').value=cfg.bucketName;
    }
  }catch(e){console.error(e);}
  loadBackupHistory();
}

function setFreq(f){
  backupFreq=f;
  ['daily','weekly','hourly','monthly'].forEach(x=>document.getElementById('freq-'+x)?.classList.toggle('active',x===f));
}

function setToggle(id,on){
  const t=document.getElementById('toggle-'+id);
  const o=document.getElementById('opt-'+id);
  if(!t)return;
  const isOn=Boolean(on);
  t.classList.toggle('on',isOn);
  o?.classList.toggle('enabled',isOn);
  if(id==='cloud') document.getElementById('cloud-config')?.classList.toggle('hide',!isOn);
}

function toggleBackupDest(id){setToggle(id,!document.getElementById('toggle-'+id).classList.contains('on'));}

async function saveBackupConfig(){
  try{
    await api('PUT','/admin/backup/config',{
      frequency:backupFreq,
      localEnabled:document.getElementById('toggle-local').classList.contains('on'),
      cloudEnabled:document.getElementById('toggle-cloud').classList.contains('on'),
      retentionDays:parseInt(document.getElementById('backup-retention').value)||30,
      cloudProvider:document.getElementById('cloud-provider')?.value||'gcs',
      bucketName:document.getElementById('cloud-bucket')?.value||null,
      backupTime:document.getElementById('backup-time').value||'02:00',
    });
    toast('Backup configuration saved!');
  }catch(e){toast(e.message,true);}
}

async function runManualBackup(){
  toast('Running backup… this may take a moment.');
  try{
    const r=await api('POST','/admin/backup/run');
    toast('Backup complete: '+r.filename);
    loadBackupHistory();
  }catch(e){toast(e.message,true);}
}

async function loadBackupHistory(){
  try{
    const rows=await api('GET','/admin/backup/list');
    const sel=document.getElementById('restore-select');
    if(!rows||!rows.length){
      document.getElementById('backup-history').innerHTML='<p style="color:var(--ink-lt);font-size:13px;padding:12px;">No backups recorded yet.</p>';
      return;
    }
    document.getElementById('backup-history').innerHTML=rows.map(r=>`
      <div class="backup-row">
        <div class="backup-status-dot ${r.status==='success'?'dot-success':'dot-failed'}" style="margin-right:12px;"></div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;">${r.filename}</div>
          <div style="font-size:11.5px;color:var(--ink-lt);">${fmtDate(r.createdAt)} · ${fmtBytes(r.sizeBytes)} · Cloud: ${r.cloudStatus}</div>
        </div>
      </div>`).join('');
    sel.innerHTML='<option value="">— Choose a backup —</option>'+
      rows.map(r=>`<option value="${r._id}">${r.filename} (${fmtDate(r.createdAt)})</option>`).join('');
  }catch(e){console.error(e);}
}

async function doRestore(){
  const id=document.getElementById('restore-select').value;
  if(!id){toast('Select a backup to restore',true);return;}
  if(!confirm('⚠️ This will OVERWRITE the current database. A safety snapshot will be created automatically. Continue?'))return;
  toast('Restoring database… please wait.');
  try{
    const r=await api('POST','/admin/backup/restore',{backupId:id});
    toast('✅ '+r.message);
  }catch(e){toast('Restore failed: '+e.message,true);}
}
