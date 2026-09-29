/* Travel Outtakes — native Web Animations, pointer parallax and a scroll timeline. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const board = $('.artboard');
  const wrap = $('.stage-wrap');
  const totalHeight = 7130;
  let scale = 1, motionPaused = reduceQuery.matches, tourPlaying = false;
  let tourStart = 0, tourY = 0, tourDuration = 0, lastFrame = 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
  const seen = new Set();
  const running = new Set();
  const revealItems = $$('.reveal');
  const depthItems = $$('[data-depth]');
  if(!motionPaused) revealItems.forEach(el=>el.setAttribute('data-pending',''));
  const photos = [
    {src:'assets/Hero_Polaroid_01.webp', title:'路人乱入', story:'You framed the view. The world added a couple of characters. Sometimes the best part of a photo is the part you didn’t plan.'},
    {src:'assets/Hero_Polaroid_02.webp', title:'表情失控', story:'Somewhere between “say cheese” and the shutter, a real smile happened. Keep that one.'},
    {src:'assets/Hero_Polaroid_02-1.webp', title:'先吃一口', story:'The perfect shot could wait. The first bite couldn’t. A tiny, delicious piece of the trip.'}
  ];

  function resize() {
    scale = Math.min(750, document.documentElement.clientWidth) / 750;
    wrap.style.width = `${750 * scale}px`;
    wrap.style.height = `${totalHeight * scale}px`;
    board.style.transform = `scale(${scale})`;
    updateProgress();
  }
  function animate(el, frames, options) {
    if (motionPaused) return;
    const animation = el.animate(frames, {fill:'none', ...options});
    running.add(animation);
    animation.finished.then(() => running.delete(animation)).catch(() => running.delete(animation));
    return animation;
  }
  function reveal(el) {
    if (seen.has(el)) return;
    seen.add(el);
    el.removeAttribute('data-pending');
    if (motionPaused) return;
    const type = el.dataset.reveal;
    const tilt = Number(el.dataset.tilt || 0);
    let from = {opacity:0, transform:'translateY(65px) rotate(-3deg)'};
    let duration = 1050;
    if (type === 'left') from.transform = 'translate(-130px, 35px) rotate(-9deg)';
    if (type === 'right') from.transform = 'translate(130px, 35px) rotate(9deg)';
    if (type === 'pop') from.transform = 'translateY(35px) scale(.55) rotate(-8deg)';
    if (type === 'paper') from.transform = 'translateY(70px) rotate(5deg) scale(.92)';
    if (type === 'prize') {from.transform = 'translateY(100px) scale(.78) rotate(-7deg)'; duration = 1300;}
    if (type === 'photo') {
      animate(el, [
        {opacity:0, transform:`translateY(-100px) rotate(${tilt * 3}deg) scale(1.15)`},
        {opacity:1, transform:`translateY(12px) rotate(${-tilt / 2}deg) scale(.97)`,offset:.65},
        {opacity:1, transform:'translateY(0) rotate(0) scale(1)'}
      ], {duration:1150,easing:'cubic-bezier(.2,.7,.2,1)'});
    } else if (type === 'draw') {
      animate(el,[{clipPath:'inset(0 100% 0 0)',opacity:0},{clipPath:'inset(0 0% 0 0)',opacity:1}],{duration:1300,easing:'cubic-bezier(.65,0,.35,1)'});
    } else animate(el,[from,{opacity:1,transform:'translate(0,0) rotate(0) scale(1)'}],{duration,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {if(entry.isIntersecting) reveal(entry.target);});
  }, {threshold:.13});
  revealItems.forEach(el => observer.observe(el));

  function opening() {
    if (motionPaused) return;
    animate($('.title-cutout'),[
      {opacity:0,transform:'translateY(-140px) rotate(-13deg) scale(.6)'},
      {opacity:1,transform:'translateY(10px) rotate(3deg) scale(1.03)',offset:.7},
      {opacity:1,transform:'translateY(0) rotate(0) scale(1)'}
    ],{duration:1550,easing:'cubic-bezier(.2,.75,.25,1)'});
    animate($('.hill'),[{transform:'translateY(160px) scale(1.12)'},{transform:'none'}],{duration:1700,easing:'cubic-bezier(.16,1,.3,1)'});
    $$('.cloud').forEach((el,i) => animate(el,[{opacity:0,transform:`translateX(${i%2?100:-100}px)`},{opacity:1,transform:'translateX(0)'}],{duration:1800,delay:200+i*100,easing:'cubic-bezier(.16,1,.3,1)'}));
  }
  function updateProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / max));
    $('#progress').style.width = `${progress*100}%`;
    $('#percent').textContent = `${String(Math.round(progress*100)).padStart(2,'0')}%`;
    const position = (scrollY + innerHeight * .35) / scale;
    const chapter = position < 2180 ? 'hero' : position < 4330 ? 'guide' : 'prizes';
    $$('.chapters a').forEach(a => {
      a.classList.toggle('active', a.dataset.chapter === chapter);
      if(a.dataset.chapter === chapter) a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
  }
  function stopTour() {
    tourPlaying = false;
    $('#tour-label').textContent = 'Play the story';
    $('#tour-icon').textContent = '▶';
    $('#tour').setAttribute('aria-label','Play automatic scroll tour');
  }
  function startTour() {
    if (motionPaused) {toast('Enable motion to play the scroll tour.');return;}
    if(scrollY >= document.documentElement.scrollHeight-innerHeight-20) window.scrollTo({top:0,behavior:'instant'});
    tourY = scrollY;
    tourStart = performance.now() + (scrollY < 10 ? 1800 : 300);
    const remaining = document.documentElement.scrollHeight-innerHeight-tourY;
    tourDuration = Math.max(1000,remaining/(scale*88)*1000);
    tourPlaying = true;
    $('#tour-label').textContent = 'Pause the story';
    $('#tour-icon').textContent = 'Ⅱ';
    $('#tour').setAttribute('aria-label','Pause automatic scroll tour');
  }
  function replay() {
    stopTour();
    running.forEach(a=>a.cancel());
    seen.clear();
    if(!motionPaused)revealItems.forEach(el=>el.setAttribute('data-pending',''));
    window.scrollTo({top:0,behavior:'instant'});
    opening();
    revealItems.forEach(el => {const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight*.92)reveal(el);});
  }
  function setMotion(paused) {
    motionPaused = paused;
    document.body.classList.toggle('motion-off',paused);
    $('#motion').setAttribute('aria-pressed',String(paused));
    $('#motion').setAttribute('aria-label',paused?'Enable animation':'Pause ambient animation');
    $('#motion').title = paused?'Enable motion':'Pause motion';
    if(paused){stopTour();running.forEach(a=>a.cancel());depthItems.forEach(el=>el.style.transform='');revealItems.forEach(el=>el.removeAttribute('data-pending'));}
  }
  function tick(now) {
    const dt=Math.min(40,now-lastFrame||16);lastFrame=now;
    if(tourPlaying && now>=tourStart) {
      const p=Math.min(1,(now-tourStart)/tourDuration);
      const max=document.documentElement.scrollHeight-innerHeight;
      window.scrollTo({top:tourY+(max-tourY)*p,behavior:'instant'});
      if(p>=1)stopTour();
    }
    if(!motionPaused && scrollY<1000*scale && !document.hidden) {
      const ease=1-Math.exp(-dt/160);
      smoothX+=(pointerX-smoothX)*ease;smoothY+=(pointerY-smoothY)*ease;
      depthItems.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${smoothX*d}px,${smoothY*d}px,0)`;});
    }
    requestAnimationFrame(tick);
  }
  $('#tour').addEventListener('click',()=>tourPlaying?stopTour():startTour());
  $('#replay').addEventListener('click',replay);
  $('#back-top').addEventListener('click',replay);
  $('#motion').addEventListener('click',()=>setMotion(!motionPaused));
  reduceQuery.addEventListener('change',e=>setMotion(e.matches));
  addEventListener('pointermove',e=>{pointerX=(e.clientX-innerWidth/2)/(innerWidth/2);pointerY=(e.clientY-innerHeight/2)/(innerHeight/2);},{passive:true});
  document.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  addEventListener('scroll',updateProgress,{passive:true});
  addEventListener('resize',()=>{stopTour();resize();},{passive:true});
  ['wheel','touchstart'].forEach(event=>addEventListener(event,stopTour,{passive:true}));
  addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stopTour();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTour();});
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>stopTour()));

  let activePhoto=0;
  function showPhoto(index) {
    activePhoto=index;
    const p=photos[index];
    $('#detail-photo').src=p.src;$('#detail-photo').alt=p.title;
    $('#photo-title').textContent=p.title;$('#photo-story').textContent=p.story;
  }
  $$('[data-photo]').forEach(el=>el.addEventListener('click',()=>{stopTour();showPhoto(+el.dataset.photo);$('#photo-dialog').showModal();}));
  $('#next-photo').addEventListener('click',()=>{showPhoto((activePhoto+1)%photos.length);animate($('#detail-photo'),[{opacity:0,transform:'rotate(5deg) translateY(20px)'},{opacity:1,transform:'rotate(-4deg) translateY(0)'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});});
  $$('[data-publish]').forEach(el=>el.addEventListener('click',()=>{stopTour();$('#compose-dialog').showModal();}));
  $$('dialog').forEach(dialog=>{
    $('.close-dialog',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  });
  let uploadedURL, keepsakeURL;
  $('#upload').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    if(uploadedURL)URL.revokeObjectURL(uploadedURL);
    uploadedURL=URL.createObjectURL(file);
    $('#upload-preview').src=uploadedURL;
    try{await $('#upload-preview').decode();$('#upload-preview').hidden=false;$('#upload-label').hidden=true;}
    catch{$('#upload').value='';$('#upload-preview').hidden=true;$('#upload-label').hidden=false;toast('Please choose an image your browser can open.');}
  });
  $('#scrapbook-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const img=$('#upload-preview');if(!img.complete||!img.naturalWidth)return;
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#e5ebd6';ctx.fillRect(0,0,1200,1500);
    ctx.fillStyle='#fffdf5';ctx.translate(600,710);ctx.rotate(-.025);ctx.fillRect(-535,-625,1070,1260);
    const ratio=Math.max(980/img.naturalWidth,900/img.naturalHeight);
    ctx.save();ctx.beginPath();ctx.rect(-490,-580,980,900);ctx.clip();ctx.drawImage(img,-img.naturalWidth*ratio/2,-130-img.naturalHeight*ratio/2,img.naturalWidth*ratio,img.naturalHeight*ratio);ctx.restore();
    ctx.fillStyle='#006438';ctx.font='bold 46px sans-serif';ctx.fillText('#旅行边角料',-465,400);
    ctx.font='28px sans-serif';
    const story=$('#story').value.replace(/\s+/g,' ').trim();let line='',y=465;
    for(const ch of Array.from(story)){if(ctx.measureText(line+ch).width>910){ctx.fillText(line,-465,y);line=ch;y+=42;}else line+=ch;}
    if(line)ctx.fillText(line,-465,y);
    ctx.setTransform(1,0,0,1,0,0);ctx.font='17px sans-serif';ctx.fillText('OFF THE POSTCARD   /   KEEP THE IMPERFECT ONES.',72,1435);
    canvas.toBlob(blob=>{
      if(!blob){toast('Could not save this image. Please try another.');return;}
      if(keepsakeURL)URL.revokeObjectURL(keepsakeURL);
      keepsakeURL=URL.createObjectURL(blob);
      $('#keepsake-preview').src=keepsakeURL;
      $('#keepsake-download').href=keepsakeURL;
      $('#keepsake-result').hidden=false;
      $('#keepsake-result').scrollIntoView({behavior:motionPaused?'instant':'smooth',block:'nearest'});
      toast('Your little memory is ready to keep.');
    },'image/png');
  });
  let toastTimer;
  function toast(message){$('.toast').textContent=message;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3500);}
  resize();setMotion(motionPaused);requestAnimationFrame(tick);
  // Wait for the key artwork, so the opening starts with actual pixels on screen.
  Promise.allSettled($$('.title-cutout img, .hill').map(img=>img.decode())).then(opening);
})();
