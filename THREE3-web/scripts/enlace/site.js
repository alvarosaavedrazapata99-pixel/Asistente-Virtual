(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
// videos: solo se reproducen cuando son visibles
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){v.play().catch(()=>{})}else v.pause()}),{threshold:.4});
if(!rm)document.querySelectorAll('video').forEach(v=>io.observe(v));
else document.querySelectorAll('video').forEach(v=>{ // movimiento reducido: imagen fija + botón para reproducir
 const b=document.createElement('button');b.type='button';b.className='vplay';b.setAttribute('aria-label','Reproducir video');b.textContent='▶';
 b.onclick=()=>{if(v.paused){v.play().catch(()=>{});b.textContent='❚❚';b.setAttribute('aria-label','Pausar video')}else{v.pause();b.textContent='▶';b.setAttribute('aria-label','Reproducir video')}};
 v.parentElement.appendChild(b)});
// tarjetas de servicio: Ver precio / Cerrar
document.querySelectorAll('.card .foot button').forEach(b=>b.onclick=()=>{const c=b.closest('.card'),o=!c.classList.contains('open');
 document.querySelectorAll('.card.open').forEach(x=>{if(x!==c){x.classList.remove('open');const y=x.querySelector('.foot button');y.textContent='Ver precio';y.setAttribute('aria-expanded','false')}});
 c.classList.toggle('open',o);b.textContent=o?'Cerrar':'Ver precio';b.setAttribute('aria-expanded',o);});
// comparador boceto / render
const cmp=document.querySelector('.cmp'),rg=cmp&&cmp.querySelector('input');if(rg)rg.oninput=()=>cmp.style.setProperty('--p',rg.value+'%');
// camino de Tri
const st=[...document.querySelectorAll('.st')],ar=[...document.querySelectorAll('.pw .arr')],rp=document.querySelector('.ctl button');let tm;
function go(i){st.forEach((e,k)=>{e.classList.toggle('on',k===i);e.classList.toggle('done',k<i)});ar.forEach((a,k)=>a.classList.toggle('on',k<i))}
function play(){clearInterval(tm);go(-1);if(rm){go(3);return}let i=0;const step=()=>{go(i);i++;if(i>3)clearInterval(tm)};setTimeout(step,300);tm=setInterval(step,2300)}
st.forEach((e,k)=>e.onclick=()=>{clearInterval(tm);go(k)});if(rp)rp.onclick=play;
const pw=document.querySelector('.pw');if(pw){let s=false;new IntersectionObserver(es=>{if(es[0].isIntersecting&&!s){s=true;play()}},{threshold:.35}).observe(pw)}
// mensajes de Instagram
const ms=['Comentario “AUTOMATIZACIÓN” → lead en tu CRM','Mensaje directo → el chatbot responde','Reel guardado → seguimiento automático','Pregunta en comentarios → respuesta en minutos'];
const c=document.querySelector('.igchip span');if(c&&!rm){let k=0;setInterval(()=>{k=(k+1)%ms.length;c.textContent=ms[k]},3200)}
// aparición al hacer scroll (solo lo que está bajo el pliegue)
if(!rm){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pre');o.unobserve(e.target)}}),{threshold:.1});
 document.querySelectorAll('.rv').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight){e.classList.add('pre');o.observe(e)}})}
// red de circuitos del hero
const cv=document.querySelector('.hero canvas');if(cv){const x=cv.getContext('2d');let P=[],W,H;
 function rs(){const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W=cv.width=r.width*d;H=cv.height=r.height*d;P=Array.from({length:Math.round(W/d/14)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25*d,vy:(Math.random()-.5)*.25*d}))}
 function fr(){x.clearRect(0,0,W,H);if(!rm)for(const p of P){p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H}
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<W/9){x.strokeStyle=`rgba(34,211,238,${.16*(1-d/(W/9))})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}
  x.fillStyle='rgba(34,211,238,.5)';for(const p of P)x.fillRect(p.x-1.5,p.y-1.5,3,3);if(!rm)requestAnimationFrame(fr)}
 rs();addEventListener('resize',rs);fr()}
})();
