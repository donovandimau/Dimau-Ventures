const byId = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tools = [
  ['My Debt Calculator', 'See how your monthly payment changes your payoff date.', 'Explore debt repayments →'],
  ['FHTB Calculator', 'Explore Forces Help to Buy alongside your savings.', 'Calculate my FHTB →'],
  ['Monthly payment planner', 'See what a change in your monthly payment could mean for your debt.', 'Try the calculator ↓'],
  ['Dimau Visuals', 'Explore your numbers through interactive graphics.', 'Open Dimau Visuals →']
];
const topicLinks = [...document.querySelectorAll('[data-topic]')];
const card = document.querySelector('.tool-card');
let selected = -1;
let highlighted = -1;
let revealTimer;
topicLinks.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selected = index;
    const [name, detail, action] = tools[index];
    byId('tool-name').textContent = name;
    byId('tool-detail').textContent = detail;
    byId('tool-link').textContent = action;
    byId('tool-link').href = index < 2 ? toolUrl(index === 0 ? 'debt' : 'home') : link.href;
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      card.hidden = false;
      byId('reset-topic').focus({preventScroll:true});
    }, reducedMotion.matches ? 0 : 320);
    repaint();
  });
  for (const type of ['pointerenter','focus','pointerleave','blur']) {
    link.addEventListener(type, () => {
      highlighted = ['pointerenter','focus'].includes(type) ? index : -1;
      repaint();
    });
  }
});
function resetTopic() {
  if (selected < 0) return;
  clearTimeout(revealTimer);
  const link = topicLinks[selected];
  selected = -1;
  card.hidden = true;
  link.focus({preventScroll:true});
  repaint();
}
byId('reset-topic').addEventListener('click', resetTopic);
document.querySelector('.atlas').addEventListener('keydown', e => { if(e.key === 'Escape') resetTopic(); });

const canvas = byId('network');
const ctx = canvas.getContext('2d');
const colours = ['#77bfff','#73f1df','#f2bb88','#b7abfc'];
const labels = [['Debt','Interest','Repayments'],['House prices','Deposit','Mortgage'],['Energy bills','Council tax','Broadband'],['Savings','Pension','Paperwork']];
const particles = Array.from({length:144}, (_, i) => {
  const group = Math.floor(i / 36);
  const angle = i * 2.39996;
  const radius = .18 * Math.sqrt((i % 36 + 1)/36);
  return {group, x:(group % 2 ? .71 : .29) + Math.cos(angle)*radius, y:(group > 1 ? .71 : .29) + Math.sin(angle)*radius, phase:angle};
});
let visible = false, frame = 0, collapse = 0, lastTime = 0;
let width = 0, height = 0;
function repaint() {
  if (visible && ctx && !frame) frame = requestAnimationFrame(draw);
}
function draw(now) {
  frame = 0;
  if (!visible) return;
  const target = selected >= 0 ? 1 : 0;
  const dt = Math.min(64,now-lastTime);
  collapse = reducedMotion.matches ? target : target + (collapse-target)*Math.exp(-dt/85);
  lastTime = now;
  const time = reducedMotion.matches ? 0 : now/5000;
  ctx.clearRect(0,0,width,height);
  const points = particles.map(({group,x,y,phase},i) => {
    const fold = group === selected || selected < 0 ? collapse : 0;
    const drift = .012 * Math.sin(time+phase);
    return [(x+drift)*(1-fold)*width + (.32+.36*(i%36)/35)*width*fold,
      (y+.014*Math.cos(time+phase))*(1-fold)*height + .5*height*fold];
  });
  particles.forEach(({group},i) => {
    const [x,y] = points[i];
    const alpha = selected >= 0 && group !== selected ? 1-collapse : highlighted >= 0 && group !== highlighted && selected < 0 ? .15 : 1;
    ctx.strokeStyle = ctx.fillStyle = colours[group];
    ctx.globalAlpha = alpha*.28;
    for (const offset of [5,8]) {
      if (i%36 < offset) continue;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...points[i-offset]);ctx.stroke();
    }
    ctx.globalAlpha = alpha;
    ctx.beginPath();ctx.arc(x,y,i%6 ? 1.4 : 2.6,0,Math.PI*2);ctx.fill();
    if (i%12 === 11 && width>280) {
      ctx.globalAlpha = alpha*(1-collapse)*.85;
      ctx.font = '12px system-ui';
      ctx.fillText(labels[group][Math.floor(i%36/12)],Math.min(width-70,Math.max(0,x-24)),y-7);
    }
  });
  ctx.globalAlpha = 1;
  if (!reducedMotion.matches && (target===0 || Math.abs(target-collapse)>.001)) repaint();
}
new ResizeObserver(() => {
  width = canvas.clientWidth; height = canvas.clientHeight;
  const ratio = Math.min(devicePixelRatio,2);
  canvas.width = width*ratio; canvas.height = height*ratio;
  ctx?.setTransform(ratio,0,0,ratio,0,0); repaint();
}).observe(canvas);
new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; repaint();}).observe(canvas);
reducedMotion.addEventListener('change',repaint);

const currency = new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
const money = n => currency.format(n);
const fields = {
  debt:[['debt','Total debt',1000,50000,500,8500],['apr','Average interest (APR)',5,35,1,19],['payment','Monthly payment',100,1500,25,300]],
  home:[['price','Property price',100000,600000,5000,250000],['savings','Current savings',0,100000,1000,10000],['monthly','Monthly savings',100,2500,50,500]]
};
const inputs = Object.fromEntries(Object.values(fields).flat().map(([key,,,,,value]) => [key,value]));

const storageKey = 'ventures.plan.v1';
let mode = 'debt';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  for (const [key,,min,max,step] of Object.values(fields).flat()) {
    const n = saved?.inputs?.[key];
    if (Number.isInteger(n) && n >= min && n <= max && (n-min)%step === 0) inputs[key] = n;
  }
  if (saved?.mode === 'home') mode = 'home';
} catch { /* Browser storage is optional. */ }
function savePlan() {
  try { localStorage.setItem(storageKey, JSON.stringify({mode, inputs})); } catch { /* Session only. */ }
}
function payoff(debt, apr, payment) {
  const rate = Math.expm1(Math.log1p(apr/100)/12);
  const balances = [debt];
  let balance = debt, interest = 0;
  while (balance > 0.00001) {
    const charge = balance*rate;
    const instalment = payment ?? Math.max(100,balance*.03);
    if (instalment <= charge) return null;
    balance = Math.max(0,balance+charge-instalment);
    balances.push(balance);
    interest += charge;
  }
  return {balances, months:balances.length-1, interest};
}
function monthAfter(months) {
  const today = new Date();
  return new Date(today.getFullYear(),today.getMonth()+months,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
}
function chartLine(id, points, duration, amount) {
  byId(id).setAttribute('d', points.map(([m,b],i) =>
    (i ? 'L' : 'M')+(1+398*m/Math.max(1,duration)).toFixed(2)+' '+(58-56*b/amount).toFixed(2)
  ).join(' '));
}
function toolUrl(type) {
  if (type === 'debt') return 'https://mydebtcalculator.app/';
  // The FHTB import dialog lets the visitor keep an existing comparison.
  const comparison = {v:1,s:[0,0,0,0,0],p:[
    ['Ventures estimate',inputs.price,inputs.savings,0,25,10,0,0,'']
  ]};
  const fragment = btoa(JSON.stringify(comparison)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  return 'https://fhtbcalculator.co.uk/#plan='+fragment;
}
function result(metric,estimate,compare,summary,legend,assumptions) {
  for (const [id,text] of Object.entries({metric,estimate,compare,summary,legend,assumptions})) byId(id).textContent = text;
}
function updatePlan() {
  const {debt,apr,payment,price,savings,monthly} = inputs;
  if (mode === 'debt') {
    const baseline = payoff(debt,apr,null), plan = payoff(debt,apr,payment);
    const duration = Math.max(baseline.months,plan?.months ?? 0);
    for (const [id,series] of [['base-line',baseline],['plan-line',plan]]) {
      chartLine(id,(series?.balances ?? []).map((b,i)=>[i,b]),duration,debt);
    }
    let comparison = 'The payment does not cover the interest.';
    if (plan) {
      const difference = baseline.interest-plan.interest;
      const months = baseline.months-plan.months;
      comparison = difference > 0 ? 'Save '+money(difference)+' in interest' : money(-difference)+' more interest';
      if (months > 0) comparison += ' and '+months+' months';
    }
    result('Estimated debt-free date',plan ? monthAfter(plan.months) : 'Increase the payment',comparison,
      plan ? money(plan.interest)+' total interest over '+plan.months+' months.' : '',
      'Baseline (dashed) · '+baseline.months+' months   /   Your plan · '+(plan ? plan.months+' months' : 'no payoff'),
      'Monthly rate = (1 + APR ÷ 100)^(1/12) − 1. Each month we add opening balance × monthly rate, then subtract the payment, limited to the amount owed. Baseline pays the greater of £100 or 3% of that month’s opening balance. Your plan pays the chosen amount. Assumes fixed APR, no fees and no new borrowing.');
  } else {
    const target = price*.1, gap = Math.max(0,target-savings), months = Math.ceil(gap/monthly);
    const points = Array.from({length:months+1},(_,i)=>[i,Math.min(target,savings+i*monthly)]);
    chartLine('base-line',[[0,target],[Math.max(months,1),target]],months,target);
    chartLine('plan-line',points,months,target);
    result('Estimated 10% deposit date',months ? monthAfter(months) : 'Deposit ready',
      money(gap)+' left to save',money(savings)+' saved towards '+money(target)+'.',
      'Deposit target (dashed)   /   Your savings · '+months+' months',
      'Target = property price × 10%. Months = remaining deposit divided by monthly contributions, rounded up. Assumes fixed price, constant contributions and no interest. Purchase costs and Forces Help to Buy are excluded.');
  }
  byId('full-plan').textContent = mode === 'debt' ? 'Open My Debt Calculator →' : 'Explore Forces Help to Buy →';
  byId('full-plan').href = toolUrl(mode);
  byId('debt-transfer').hidden = mode !== 'debt';
  byId('home-transfer').hidden = mode !== 'home';
  byId('home-card').href = toolUrl('home');
  byId('debt-card').href = toolUrl('debt');
  byId('home-preview').textContent = money(price*.1)+' deposit target →';
  byId('debt-preview').textContent = money(debt)+' to repay →';
  byId('monthly-preview').textContent = money(mode === 'debt' ? payment : monthly)+' per month →';
  for (const button of byId('presets').children) button.setAttribute('aria-pressed',String(+button.value === inputs[fields[mode][0][0]]));
}
function showFields() {
  const host = byId('sliders'), presets = byId('presets');
  host.replaceChildren();
  presets.replaceChildren();
  presets.setAttribute('aria-label',mode === 'debt' ? 'Debt presets' : 'Property price presets');
  for (const amount of (mode === 'debt' ? [5000,10000,25000] : [150000,250000,400000])) {
    const button = document.createElement('button');
    button.textContent = '£'+amount/1000+'k';
    button.value = amount;
    button.onclick = () => {
      const slider = byId('plan-'+fields[mode][0][0]);
      slider.value = amount;
      slider.dispatchEvent(new Event('input'));
    };
    presets.append(button);
  }
  for (const [key,title,min,max,step] of fields[mode]) {
    const input = document.createElement('input'), label = document.createElement('label'), output = document.createElement('output');
    Object.assign(input,{id:'plan-'+key,type:'range',min,max,step,value:inputs[key]});
    label.htmlFor = input.id; label.textContent = title;
    output.setAttribute('aria-hidden','true');
    function display() {
      output.textContent = key==='apr' ? inputs[key]+'%' : money(inputs[key]);
      input.setAttribute('aria-valuetext',output.textContent);
    }
    input.addEventListener('input',() => {inputs[key]=input.valueAsNumber;display();updatePlan();savePlan();});
    display();label.append(output);host.append(label,input);
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  updatePlan();
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click',() => {mode=button.dataset.mode;showFields();savePlan();}));
byId('tool-link').addEventListener('click',() => {if(selected === 2){mode='debt';showFields();savePlan();}});
byId('download-plan').addEventListener('click',() => {
  const now = new Date();
  const start = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const plan = {debts:[{name:'Ventures balance',bal:inputs.debt,apr:inputs.apr,min:0}],
    budget:inputs.payment,method:'avalanche',start,example:false,currency:'GBP'};
  const blob = new Blob([JSON.stringify({app:'MyDebtCalculator',version:1,plan})],{type:'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ventures-debt-plan.json';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),30000);
});
byId('snapshot').addEventListener('click',() => window.print());
showFields();
byId('planner').hidden = false;
