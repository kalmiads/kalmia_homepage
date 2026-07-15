// ==========================================================================
// kalmia — 히어로 인터랙션
//  1) 커스텀 커서 (도트 + 리퀴드 글래스 링 + 물길 트레일)
//  2) 햄버거 메뉴 토글 (흰색 레이어 페이드인)
//  3) 배경 영상 재생/순환
// ==========================================================================

// ---------- 1) 커스텀 커서 (도트 + 링) ----------
(function(){
  if(!matchMedia('(pointer:fine)').matches) return;   // 터치 기기에선 미적용
  const root=document.querySelector('.cursor');
  const dot=root.querySelector('.cursor-dot');
  const ring=root.querySelector('.cursor-ring');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const INTERACTIVE='a,button,.logo,[data-cursor]';
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,shown=false;

  addEventListener('pointermove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';   // 도트는 즉시 추적
    if(!shown){shown=true;root.classList.add('is-visible');}
  },{passive:true});

  // 링크·버튼·로고 위에서 링 확대
  addEventListener('pointerover',e=>{
    if(e.target.closest&&e.target.closest(INTERACTIVE)) root.classList.add('is-hover');
  },{passive:true});
  addEventListener('pointerout',e=>{
    const from=e.target.closest&&e.target.closest(INTERACTIVE);
    const to=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest(INTERACTIVE);
    if(from&&!to) root.classList.remove('is-hover');
  },{passive:true});

  addEventListener('pointerdown',()=>root.classList.add('is-down'),{passive:true});
  addEventListener('pointerup',()=>root.classList.remove('is-down'),{passive:true});
  document.addEventListener('mouseleave',()=>root.classList.remove('is-visible'));
  document.addEventListener('mouseenter',()=>{if(shown)root.classList.add('is-visible');});

  // 물길(트레일) 노드 생성 — 서로를 따라오는 작은 물방울 체인
  const TRAIL_N=7, trail=[];
  for(let i=0;i<TRAIL_N;i++){
    const el=document.createElement('div');
    el.className='cursor-trail';
    const size=15-i*1.6; el.style.width=size+'px'; el.style.height=size+'px';
    root.appendChild(el);
    trail.push({el,x:mx,y:my,base:0.42*(1-i/TRAIL_N)});
  }

  // 링 지연 추적 + 이동 방향 늘어남 + 물길 (reduced-motion이면 즉시·트레일 off)
  let prx=rx,pry=ry;
  (function tick(){
    if(reduce){rx=mx;ry=my;}else{rx+=(mx-rx)*0.18;ry+=(my-ry)*0.18;}
    ring.style.left=rx+'px';ring.style.top=ry+'px';

    const dx=rx-prx,dy=ry-pry,sp=Math.hypot(dx,dy); prx=rx;pry=ry;
    // 이동 방향으로 늘어나고 수직으로 눌림 (관성 변형)
    if(!reduce&&sp>0.5){
      const st=Math.min(sp*0.018,0.42), ang=Math.atan2(dy,dx);
      ring.style.transform=`translate(-50%,-50%) rotate(${ang}rad) scale(${1+st},${1-st*0.55})`;
    }else{
      ring.style.transform='translate(-50%,-50%)';
    }

    // 물길: 속도에 따라 꼬리가 늘어났다가 멈추면 본체로 모이며 사라짐
    const sf=reduce?0:Math.min(1,sp*0.09);
    let lx=rx,ly=ry;
    for(let i=0;i<TRAIL_N;i++){
      const tn=trail[i];
      tn.x+=(lx-tn.x)*0.4; tn.y+=(ly-tn.y)*0.4;
      tn.el.style.left=tn.x+'px'; tn.el.style.top=tn.y+'px';
      tn.el.style.opacity=(tn.base*sf).toFixed(3);
      lx=tn.x; ly=tn.y;
    }
    requestAnimationFrame(tick);
  })();
})();

// ---------- 2) 햄버거 메뉴 토글 ----------
(function(){
  const btn=document.querySelector('.menu-btn');
  const overlay=document.getElementById('menu');
  if(!btn||!overlay) return;
  function setOpen(open){
    document.body.classList.toggle('menu-open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  }
  btn.addEventListener('click',()=>setOpen(!document.body.classList.contains('menu-open')));
  // 메뉴 항목 클릭 시 닫기
  overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  // ESC 로 닫기
  addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
})();

// ---------- 3) 배경 영상 ----------
// 여기에 파일 경로를 추가하면 순서대로 재생되고, 목록이 끝나면 처음부터 반복됩니다.
(function(){
  const VIDEOS=[
    'assets/hero.mp4',
  ];
  const bg=document.getElementById('bg');
  if(!bg) return;
  let vi=0;
  function playVideo(i){
    bg.src=VIDEOS[i%VIDEOS.length];
    bg.load();
    bg.play().catch(()=>{});   // 자동재생 차단 시 조용히 무시
  }
  // 영상이 하나면 loop 속성으로 반복, 여러 개면 끝날 때마다 다음 영상으로 순환
  bg.loop=(VIDEOS.length<=1);
  if(VIDEOS.length>1){
    bg.addEventListener('ended',()=>{vi=(vi+1)%VIDEOS.length;playVideo(vi);});
  }
  playVideo(0);
})();
