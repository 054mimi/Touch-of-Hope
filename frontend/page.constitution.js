/* ================================================================
   pages/constitution.js — Constitution accordion
   Touch of Hope CBO
================================================================ */

const constitution = [
  { num: '1',  title: 'Name',                 body: 'TOUCH OF HOPE COMMUNITY–BASED ORGANIZATION.' },
  { num: '2',  title: 'Vision',               body: 'A community with social and economic strength to allow provision of equal opportunity for all regardless of economic status.' },
  { num: '3',  title: 'Mission',              body: '(3.1) Support orphanages, less privileged families, individuals and persons living with disabilities. (3.2) Raise funds through fund drives, donations, government grants, youth funds and member contributions. (3.3) Venture in emergency activities on emerging issues such as climate change, floods and drought.' },
  { num: '4',  title: 'Objectives',           body: '(4.1.1) Raising funds to support needy families, individuals and orphans. (4.1.2) Providing support to orphanages through donations. (4.1.3) Supporting education of less fortunate students through Touch of Hope scholarship programs.' },
  { num: '5',  title: 'Values',               body: 'Kind and respectable · Honest and trustworthy · Inclusive — no discrimination · Partnership with communities · Hard work · Discipline · Time-conscious.' },
  { num: '6',  title: 'Membership',           body: "Open to all individuals supporting the organization's objectives. Members may elect and be elected. Must be Kenyan citizen, share the common interest, abide by rules, and commit to the constitution. Office bearers may not stay in office more than three years. Rules violations determined by a five-member committee." },
  { num: '7',  title: 'Rules & Regulations',  body: 'Attend meetings without fail · No drugs or alcohol · No lateness or absenteeism · Orderly meetings — no heckling · All members are equal · Punctuality · Timely contributions · No discussion of group matters outside meetings.' },
  { num: '8',  title: 'Amendments',           body: 'Must be approved by two-thirds of registered members at a general meeting, and require written consent of the registrar before implementation.' },
  { num: '9',  title: 'Elections',            body: 'Held annually at the AGM. Mode decided by the general meeting (secret ballot or show of hands). One person, one vote. Two-thirds quorum required.' },
  { num: '10', title: 'Governance Structure', body: 'Governed by a board of directors: Chairperson, Secretary, Treasurer, and others as needed. Chairperson presides over meetings, outsources funds, coordinates activities. Secretary issues notices, keeps minutes, handles correspondence. Treasurer receives and disburses funds under committee directive, keeps accurate financial records. Members may suspend office bearers suspected of misappropriation.' },
  { num: '11', title: 'Committee',            body: 'All official office bearers plus two elected members. Serve until next AGM. Committee members remain for two years. Duties: implement objectives, make decisions, conflict resolution, discipline.' },
  { num: '12', title: 'Meetings',             body: 'Annual General Meeting (AGM) to review activities. Regular meetings as determined by the board. AGM agenda: consideration of accounts, elections, planning & budgeting, highlighting achievements.' },
  { num: '13', title: 'Financial Management', body: "Funds from donations, fundraising, member contributions, entrepreneurial activities, investments. Treasurer maintains records and presents report at each AGM. All monies deposited to the bank account approved by the group. No payment without members' resolution. Cheques signed by appointed signatories." },
  { num: '14', title: 'Shares',               body: 'Shares and dividends determined at AGM. Group may operate a business. Group owns a reputable bank account.' },
  { num: '15', title: 'Auditors',             body: 'Appointed annually at AGM. All accounts and records open for inspection at any time. Treasurer provides updated financial records for auditing.' },
  { num: '16', title: 'Amendment Procedure',  body: 'Two-thirds majority vote at AGM or special general meeting.' },
  { num: '17', title: 'Dissolution',          body: 'Two-thirds vote at a general meeting. If quorum not met, postponed one month with 14 days\' notice. Assets distributed to another non-profit with similar objectives.' },
];

function renderConstitution() {
  document.getElementById('constitution-list').innerHTML = constitution.map(a => `
    <div class="art-wrap">
      <div class="art-head" onclick="toggleArt(this)">
        <span>Article ${a.num}: ${a.title}</span>
        <svg class="art-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="art-body">${a.body}</div>
    </div>
  `).join('');
}

function toggleArt(el) {
  const b = el.nextElementSibling;
  b.classList.toggle('open');
  el.querySelector('.art-chevron').style.transform = b.classList.contains('open') ? 'rotate(180deg)' : '';
}
