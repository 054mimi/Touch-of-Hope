/* page.donate.js - full payment page - Touch of Hope CBO */
let selectedCampaignId=null,selectedPayMethod='mpesa',paymentData={},stripeInstance=null,stripeElements=null;

async function loadDonate(){
  try{
    const cams=await api('GET','/public/campaigns',null,false)||MOCK.campaigns;
    document.getElementById('pay-campaigns').innerHTML=cams.filter(c=>c.status==='active').map(c=>{
      const pct=c.percentageRaised??Math.min(100,Math.round((c.amountRaised/c.targetAmount)*100));
      return `<div class="campaign-card ${selectedCampaignId===c._id?'selected':''}" onclick="selectCampaign('${c._id}',this)" style="margin-bottom:10px;">
        <strong style="font-size:13.5px;">${c.title}</strong>
        <div style="margin-top:6px;"><div class="progress" style="height:5px;"><div class="progress-fill" style="width:${pct}%"></div></div></div>
        <span style="font-size:11.5px;color:var(--ink-lt);">KSh ${fmtNum(c.amountRaised)} / KSh ${fmtNum(c.targetAmount)} (${pct}%)</span>
      </div>`;
    }).join('');
  }catch(e){console.error(e);}
}

function selectCampaign(id,el){
  selectedCampaignId=id;
  document.querySelectorAll('#pay-campaigns .campaign-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}

function selectPayMethod(method){
  selectedPayMethod=method;
  ['mpesa','stripe','paypal','bank'].forEach(m=>{
    document.getElementById('pm-'+m)?.classList.toggle('selected',m===method);
    document.getElementById(m+'-form')?.classList.toggle('hide',m!==method);
  });
  if(method==='stripe') initStripe();
}

function setAmount(amt){ document.getElementById('pay-amount').value=amt; }

async function initStripe(){
  if(stripeInstance) return;
  if(typeof Stripe==='undefined'){
    await new Promise(resolve=>{const s=document.createElement('script');s.src='https://js.stripe.com/v3/';s.onload=resolve;document.head.appendChild(s);});
  }
  try{
    const {key}=await api('GET','/payments/stripe/publishable-key',null,false);
    stripeInstance=Stripe(key||'pk_test_demo');
  }catch(e){stripeInstance=null;}
}

async function initiateStripe(){
  const amount=parseInt(document.getElementById('pay-amount').value);
  const name=document.getElementById('pay-name-stripe')?.value.trim()||currentUser?.name||'Anonymous';
  const email=document.getElementById('pay-email-stripe')?.value.trim()||currentUser?.email||'';
  if(!amount||amount<10){toast('Minimum donation is KSh 10',true);return;}
  showPayStatus('Creating payment…');
  try{
    const {clientSecret,donationId}=await api('POST','/payments/stripe/create-intent',{amount,currency:'kes',campaignId:selectedCampaignId,donorName:name,donorEmail:email});
    paymentData={donationId,method:'stripe'};
    if(!stripeInstance||clientSecret.includes('demo')){
      setTimeout(()=>showPaySuccess({amount,method:'Stripe (Demo)',receipt:'DEMO-STRIPE'}),2000);return;
    }
    const elements=stripeInstance.elements({clientSecret});
    stripeElements=elements;
    const payEl=elements.create('payment');
    payEl.mount('#stripe-payment-element');
    document.getElementById('stripe-submit-btn')?.classList.remove('hide');
    document.getElementById('stripe-form-inner')?.classList.remove('hide');
    updatePayStatus('Fill in your card details above, then click Pay.');
  }catch(e){toast(e.message,true);hidePayStatus();}
}

async function confirmStripePayment(){
  if(!stripeInstance||!stripeElements){toast('Stripe not loaded',true);return;}
  showPayStatus('Processing card payment…');
  const {error}=await stripeInstance.confirmPayment({elements:stripeElements,confirmParams:{return_url:window.location.href},redirect:'if_required'});
  if(error){toast(error.message,true);updatePayStatus('Payment failed: '+error.message);}
  else{showPaySuccess({amount:document.getElementById('pay-amount').value,method:'Card',receipt:paymentData.donationId});}
}

async function initiateMpesa(){
  const amount=parseInt(document.getElementById('pay-amount').value);
  const phone=document.getElementById('pay-phone').value.trim().replace(/\s/g,'');
  const name=document.getElementById('pay-name').value.trim()||currentUser?.name||'Anonymous';
  if(!amount||amount<10){toast('Minimum donation is KSh 10',true);return;}
  if(!phone){toast('Enter your M-Pesa phone number',true);return;}
  showPayStatus('Sending STK Push to your phone…');
  try{
    const r=await api('POST','/payments/mpesa/initiate',{phone,amount,campaignId:selectedCampaignId,donorName:name,donorEmail:currentUser?.email||null});
    paymentData={checkoutId:r.checkoutId,donationId:r.donationId,method:'mpesa'};
    updatePayStatus('Enter your M-Pesa PIN within 60 seconds…');
    toast('STK Push sent to '+phone);
    setTimeout(pollMpesa,8000);setTimeout(pollMpesa,18000);setTimeout(pollMpesa,30000);
  }catch(e){toast(e.message,true);hidePayStatus();}
}

async function pollMpesa(){
  if(!paymentData.checkoutId)return;
  try{
    const r=await api('GET','/payments/mpesa/status/'+paymentData.checkoutId);
    if(r.status==='completed') showPaySuccess({amount:r.amount,method:'M-Pesa',receipt:r.receipt});
    else if(r.status==='failed'){updatePayStatus('❌ Payment failed or timed out.');document.getElementById('pay-spinner').style.display='none';}
  }catch(_){}
}

async function initiatePaypal(){
  const amount=parseFloat(document.getElementById('pay-amount').value);
  if(!amount||amount<1){toast('Enter a valid amount',true);return;}
  showPayStatus('Creating PayPal order…');
  try{
    const {orderId,approveUrl,donationId}=await api('POST','/payments/paypal/create-order',{amount:(amount/110).toFixed(2),currency:'USD',campaignId:selectedCampaignId,donorName:currentUser?.name||'Anonymous',donorEmail:currentUser?.email||null});
    paymentData={orderId,donationId,method:'paypal'};
    if(approveUrl==='#'){setTimeout(()=>showPaySuccess({amount,method:'PayPal (Demo)',receipt:'PP-DEMO'}),2000);return;}
    window.open(approveUrl,'_blank','width=600,height=700');
    updatePayStatus('Complete your PayPal payment in the popup.');
    const iv=setInterval(async()=>{
      try{const r=await api('POST','/payments/paypal/capture-order',{orderId});
      if(r.status==='completed'){clearInterval(iv);showPaySuccess({amount,method:'PayPal',receipt:r.captureId});}}catch(_){}
    },5000);
  }catch(e){toast(e.message,true);hidePayStatus();}
}

function showPayStatus(msg){
  document.getElementById('pay-status-box').classList.remove('hide');
  document.getElementById('pay-status-msg').textContent=msg;
  document.getElementById('pay-status-sub').textContent='';
  document.getElementById('pay-spinner').style.display='block';
}
function updatePayStatus(sub){document.getElementById('pay-status-sub').textContent=sub;}
function hidePayStatus(){document.getElementById('pay-status-box').classList.add('hide');}
function showPaySuccess({amount,method,receipt}){
  document.getElementById('pay-spinner').style.display='none';
  document.getElementById('pay-status-msg').textContent='✅ Payment Confirmed!';
  document.getElementById('pay-status-sub').innerHTML=`<strong>KSh ${fmtNum(amount)}</strong> via ${method}<br/>Receipt: <code>${receipt||'—'}</code><br/><small>A receipt has been emailed to you.</small>`;
  toast('Donation confirmed! Thank you 💛');
}
function checkPaymentStatus(){if(paymentData.method==='mpesa')pollMpesa();}
