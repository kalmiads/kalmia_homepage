// ==========================================================================
// kalmia — 히어로 인터랙션
//  0) 부드러운 스크롤 (관성/감속)
//  1) 커스텀 커서 (임시: 심플 원)
//  2) 햄버거 메뉴 토글
//  3) 배경 영상 재생/순환
// ==========================================================================

// ---------- 0) 부드러운 스크롤 (관성/감속) — 데스크톱 휠 전용 ----------
(function(){
  if(!matchMedia('(pointer:fine)').matches) return;                 // 터치는 네이티브 관성 유지
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return; // 모션 최소화 존중
  const EASE=0.1;          // 작을수록 더 미끄러지듯(잔여 스크롤 김)
  const MULT=1;            // 휠 이동량 배율 (작을수록 느림)
  let target=scrollY, current=target, animating=false;
  const maxScroll=()=>document.documentElement.scrollHeight-innerHeight;
  const clamp=v=>{const m=maxScroll();return v<0?0:(v>m?m:v);};

  function animate(){
    current+=(target-current)*EASE;
    if(Math.abs(target-current)<0.4){ current=target; scrollTo(0,current); animating=false; return; }
    scrollTo(0,current);
    requestAnimationFrame(animate);
  }
  function start(){ if(!animating){ animating=true; requestAnimationFrame(animate); } }

  addEventListener('wheel',e=>{
    if(e.ctrlKey) return;                       // 확대(ctrl+휠)는 통과
    e.preventDefault();
    let d=e.deltaY;
    if(e.deltaMode===1) d*=16;                  // 줄 단위 → px 근사
    else if(e.deltaMode===2) d*=innerHeight;    // 페이지 단위
    target=clamp(target + d*MULT);
    start();
  },{passive:false});

  // 네이티브 스크롤(키보드·스크롤바·앵커)과 동기화
  addEventListener('scroll',()=>{ if(!animating){ current=target=scrollY; } },{passive:true});
  addEventListener('resize',()=>{ target=clamp(target); },{passive:true});
})();

// ---------- 1) 커스텀 커서 (임시: 심플 원) ----------
// 물방울 커서는 docs/cursor-droplet-backup.md 에 보관
(function(){
  if(!matchMedia('(pointer:fine)').matches) return;   // 터치 기기에선 미적용
  const c=document.querySelector('.cursor');
  if(!c) return;
  let shown=false;
  addEventListener('pointermove',e=>{
    c.style.left=e.clientX+'px';
    c.style.top=e.clientY+'px';
    if(!shown){shown=true;c.classList.add('is-visible');}
  },{passive:true});
  document.addEventListener('mouseleave',()=>c.classList.remove('is-visible'));
  document.addEventListener('mouseenter',()=>{if(shown)c.classList.add('is-visible');});
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

// ---------- 2.5) 홈 스크롤 스크럽 (영상 페이드 + kalmia → GNB 중앙) ----------
(function(){
  if(!document.body.classList.contains('page-home')) return;
  const hero=document.querySelector('.hero');
  const brand=document.querySelector('.brand');
  const mark=brand&&brand.querySelector('.mark');
  const tag=brand&&brand.querySelector('.tag');
  const ticker=document.querySelector('.ticker');
  const menuBtn=document.querySelector('.menu-btn');
  if(!hero||!brand||!mark) return;

  let s1=1,tx1=0,ty1=0,phase=1;
  const clamp=(v,a,b)=>v<a?a:(v>b?b:v);

  // 정지 상태(rest)에서 기준값 측정 → 시작/끝 좌표·스케일 계산
  function measure(){
    brand.style.transform='none';
    const r=mark.getBoundingClientRect();
    const base=parseFloat(getComputedStyle(mark).fontSize)||180;
    const w0=r.width, h0=r.height, x0=r.left, y0=r.top;
    // GNB 중앙 도착 크기: 모바일로 갈수록 작게
    const endFont=Math.max(26,Math.min(40,innerWidth*0.075));
    s1=endFont/base;
    const b=menuBtn?menuBtn.getBoundingClientRect():{top:24,height:64};
    const cy1=b.top+b.height/2;       // GNB 세로 중앙
    const cx1=innerWidth/2;           // 가로 중앙
    tx1=cx1 - x0 - s1*w0/2;
    ty1=cy1 - y0 - s1*h0/2;
    phase=innerHeight*0.9;            // 이 스크롤 거리 동안 애니메이션 완료
    update();
  }

  function update(){
    const p=clamp(scrollY/phase,0,1);
    brand.style.transform='translate('+(tx1*p).toFixed(2)+'px,'+(ty1*p).toFixed(2)+'px) scale('+(1+(s1-1)*p).toFixed(4)+')';
    hero.style.opacity=(1-p).toFixed(3);                 // 영상 페이드아웃
    if(tag) tag.style.opacity=clamp(1-p/0.3,0,1).toFixed(3);      // 태그: 빠르게 사라짐
    if(ticker) ticker.style.opacity=clamp(1-p/0.6,0,1).toFixed(3);// 티커: kalmia 도착 전 사라짐
  }

  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',measure,{passive:true});
  measure();
  addEventListener('load',measure);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measure);   // 폰트 로드 후 재측정
})();

// ---------- 2.6) 블랙 섹션 크리스털 패럴랙스 (스크롤 시 살짝 위로) ----------
(function(){
  if(!document.body.classList.contains('page-home')) return;
  const section=document.querySelector('.dark-section');
  const crystal=document.querySelector('.dark-crystal');
  if(!section||!crystal) return;
  const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
  function parallax(){
    const r=section.getBoundingClientRect();
    // 섹션이 화면을 지나가는 진행도(0→1)
    const p=clamp((innerHeight - r.top)/(innerHeight + r.height),0,1);
    const y=360 - 450*p;             // 스크롤에 따라 아래 → 위로 이동 (시작을 더 아래)
    crystal.style.transform='translateY('+y.toFixed(1)+'px)';
  }
  addEventListener('scroll',parallax,{passive:true});
  addEventListener('resize',parallax,{passive:true});
  parallax();
})();

// ---------- 2.7) 별 생성 + 스크롤에 따라 하나둘 등장 ----------
(function(){
  if(!document.body.classList.contains('page-home')) return;
  const field=document.getElementById('starfield');
  if(!field) return;
  const N=90, stars=[];
  for(let i=0;i<N;i++){
    const s=document.createElement('div');
    s.className='star';
    // 크기 변주: 대부분 작은 별, 가끔 큰 별(은은한 글로우)
    const size=(Math.random()<0.14 ? 2.4 : (Math.random()<0.5 ? 1.4 : 1)) * (1+Math.random()*0.6);
    s.style.width=size.toFixed(2)+'px';
    s.style.height=size.toFixed(2)+'px';
    s.style.left=(Math.random()*100).toFixed(2)+'%';
    s.style.top=(Math.random()*100).toFixed(2)+'%';
    s.style.setProperty('--o',(0.4+Math.random()*0.6).toFixed(2));
    if(size>2.2) s.style.boxShadow='0 0 6px rgba(255,255,255,.85)';
    field.appendChild(s);
    stars.push(s);
  }
  let ticking=false;
  function reveal(){
    const trigger=innerHeight*0.9;   // 화면 하단쯤 올라오면 켜짐
    for(let i=0;i<stars.length;i++){
      const s=stars[i];
      if(s.classList.contains('on')) continue;
      if(s.getBoundingClientRect().top < trigger) s.classList.add('on');
    }
    ticking=false;
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(reveal);}},{passive:true});
  addEventListener('resize',reveal,{passive:true});
  reveal();
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
