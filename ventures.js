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
    byId('tool-link').href = link.href;
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
let mode = 'debt';
function payoff(debt,apr,payment) {
  const rate = Math.expm1(Math.log1p(apr/100)/12);
  let balance = debt, interest = 0, months = 0;
  while (balance > .00001) {
    const charge = balance*rate;
    const instalment = payment ?? Math.max(100,balance*.03);
    if (instalment <= charge) return null;
    balance -= instalment-charge;
    months++;
    interest += charge;
  }
  return {months,interest};
}
function monthAfter(months) {
  const today = new Date();
  return new Date(today.getFullYear(),today.getMonth()+months,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
}
function updatePlan() {
  const {debt,apr,payment,price,savings,monthly} = inputs;
  let heading,value,summary,comparison,assumption,action,url,first,second;
  if (mode === 'debt') {
    const plan = payoff(debt,apr,payment), baseline = payoff(debt,apr,null);
    heading = 'Estimated debt-free date';
    value = plan ? monthAfter(plan.months) : 'Increase the payment';
    summary = plan ? money(plan.interest)+' total interest over '+plan.months+' months.' : 'The monthly payment does not cover the interest.';
    first = baseline.months; second = plan?.months ?? 0;
    comparison = 'Baseline: '+first+' months.' + (plan ? ' Your plan: '+second+' months.':'');
    if (plan && plan.interest < baseline.interest && second < first) comparison += ' Save '+money(baseline.interest-plan.interest)+' and '+(first-second)+' months.';
    assumption = 'Assumes a fixed APR, monthly interest and no new borrowing or fees. The example baseline pays 3% of the opening balance each month, with a £100 minimum.';
    url = new URL(topicLinks[0].href);
    action = 'Open My Debt Calculator →';
  } else {
    const target = price*.1, gap = Math.max(0,target-savings), months = Math.ceil(gap/monthly);
    heading = 'Estimated 10% deposit date';
    value = months ? monthAfter(months) : 'Deposit ready';
    summary = money(gap)+' left to reach a '+money(target)+' deposit.';
    first = target; second = Math.min(savings,target);
    comparison = money(savings)+' saved towards '+money(target)+'.';
    assumption = 'Assumes equal monthly contributions, a fixed property price and no interest. Purchase costs and Forces Help to Buy are excluded.';
    url = new URL(topicLinks[1].href);
    action = 'Explore Forces Help to Buy →';
  }
  for (const [key] of fields[mode]) url.searchParams.set(key,inputs[key]);
  byId('metric').textContent = heading;
  if(byId('estimate').textContent !== value && !reducedMotion.matches) byId('estimate').animate?.([{opacity:.68,transform:'translateY(2px)'},{opacity:1,transform:'none'}],{duration:160});
  byId('estimate').textContent = value;
  byId('summary').textContent = summary;
  byId('compare').textContent = comparison;
  byId('assumptions').textContent = assumption;
  byId('full-plan').textContent = action;
  byId('full-plan').href = url.href;
  const scale = Math.max(first,second,1);
  document.querySelectorAll('.bars i').forEach((bar,i) => bar.style.width = (100*[first,second][i]/scale)+'%');
  const progress = mode === 'debt' ? (payment-100)/1400 : (monthly-100)/2400;
  byId('planner').style.setProperty('--tint','hsl('+Math.round(30+155*progress)+' 35% 18%)');
}
function showFields() {
  const host = byId('sliders');
  host.replaceChildren();
  for (const [key,title,min,max,step] of fields[mode]) {
    const input = document.createElement('input'), label = document.createElement('label'), output = document.createElement('output');
    Object.assign(input,{id:'plan-'+key,type:'range',min,max,step,value:inputs[key]});
    label.htmlFor = input.id; label.textContent = title;
    output.setAttribute('aria-hidden','true');
    function display() {
      output.textContent = key==='apr' ? inputs[key]+'%' : money(inputs[key]);
      input.setAttribute('aria-valuetext',output.textContent);
    }
    input.addEventListener('input',() => {inputs[key] = input.valueAsNumber;display();updatePlan();});
    display();label.append(output);host.append(label,input);
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  updatePlan();
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click',() => {mode=button.dataset.mode;showFields();}));
byId('tool-link').addEventListener('click', () => {
  if (selected === 2) { mode = 'debt'; showFields(); }
});
showFields();
byId('planner').hidden = false;
