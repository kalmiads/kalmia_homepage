# 물방울(리퀴드 글래스) 커스텀 커서 백업

임시로 심플한 원형 커서로 교체하면서 보관해 둔 원본 물방울 커서 코드.
다시 쓰려면 아래 3개 블록을 각 파일에 되돌려 넣으면 된다.

- 도트 + 리퀴드 글래스 링 + 물길(트레일) 구성
- `pointer:fine`(마우스 기기)에서만 동작

---

## 1) HTML — `index.html` / `experience.html` 의 커서 마크업

현재는 `<div class="cursor" aria-hidden="true"></div>` 한 줄로 대체돼 있음.
아래로 되돌린다:

```html
<!-- 커스텀 커서 -->
<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">
  <filter id="dropletGlass" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
<div class="cursor" aria-hidden="true">
  <div class="cursor-ring"></div>
  <div class="cursor-dot"></div>
</div>
```

## 2) CSS — `css/style.css` 의 `@media (pointer:fine)` 블록

현재는 심플 원형 커서 블록으로 대체돼 있음. 아래로 되돌린다:

```css
/* ── 커스텀 커서 (마우스가 있는 기기에서만) ── */
@media (pointer:fine){
  html,body,a,button,.logo{cursor:none;}
  .cursor-dot,.cursor-ring{position:fixed;top:0;left:0;z-index:9999;
    pointer-events:none;border-radius:50%;transform:translate(-50%,-50%);
    opacity:0;transition:opacity .25s ease;will-change:left,top;}
  /* 정밀 포인터 도트 */
  .cursor-dot{width:6px;height:6px;background:rgba(255,255,255,.95);
    box-shadow:0 0 6px rgba(255,255,255,.85),0 1px 4px rgba(0,0,0,.4);
    transition:opacity .25s ease, width .2s ease, height .2s ease;}
  /* 물방울 (리퀴드 글래스) */
  .cursor-ring{width:72px;height:72px;overflow:hidden;
    border-radius:46% 54% 47% 53% / 53% 45% 55% 47%;
    background:rgba(255,255,255,.05);
    -webkit-backdrop-filter:blur(.5px) saturate(2.1) brightness(1.2) contrast(1.12);
    backdrop-filter:blur(.5px) saturate(2.1) brightness(1.2) contrast(1.12);
    -webkit-backdrop-filter:url(#dropletGlass) blur(.5px) saturate(2.1) brightness(1.2) contrast(1.12);
    backdrop-filter:url(#dropletGlass) blur(.5px) saturate(2.1) brightness(1.2) contrast(1.12);
    /* 하드 스트로크 제거 → 부드러운 유리 엣지 */
    box-shadow:
      inset 5px 7px 15px rgba(255,255,255,.5),
      inset -7px -11px 19px rgba(95,120,160,.42),
      inset 10px 0 15px -7px rgba(120,180,255,.4),
      inset -10px 0 15px -7px rgba(255,170,200,.4),
      inset 0 0 24px rgba(255,255,255,.1),
      0 9px 24px rgba(0,0,0,.26);
    animation:blobMorph 7s ease-in-out infinite;
    transition:opacity .25s ease, width .25s ease, height .25s ease;}
  /* 불규칙하게 일렁이는 물방울 형태 */
  @keyframes blobMorph{
    0%,100%{border-radius:46% 54% 47% 53% / 53% 45% 55% 47%;}
    33%{border-radius:55% 45% 56% 44% / 45% 56% 44% 55%;}
    66%{border-radius:47% 53% 44% 56% / 56% 46% 54% 44%;}
  }
  /* 상단 스페큘러 하이라이트 + 하단 집광(caustic) */
  .cursor-ring::before{content:"";position:absolute;top:12%;left:18%;
    width:40%;height:30%;border-radius:50%;
    background:radial-gradient(closest-side, rgba(255,255,255,1), rgba(255,255,255,0));}
  .cursor-ring::after{content:"";position:absolute;bottom:11%;left:50%;
    width:30%;height:20%;border-radius:50%;transform:translateX(-50%);
    background:radial-gradient(closest-side, rgba(255,255,255,.7), rgba(255,255,255,0));}
  .cursor.is-visible .cursor-ring{opacity:1;}
  .cursor.is-visible .cursor-dot{opacity:.8;}   /* 중간 원(포인터) */
  .cursor.is-hover .cursor-ring{width:96px;height:96px;}
  .cursor.is-hover .cursor-dot{width:4px;height:4px;}
  .cursor.is-down .cursor-ring{width:60px;height:60px;}
  /* 물길(트레일) */
  .cursor-trail{position:fixed;top:0;left:0;z-index:9998;pointer-events:none;
    border-radius:50%;transform:translate(-50%,-50%);opacity:0;will-change:left,top,opacity;
    background:radial-gradient(closest-side, rgba(255,255,255,.6), rgba(200,225,255,.18) 55%, rgba(255,255,255,0));}
}
```

## 3) JS — `js/main.js` 의 `1) 커스텀 커서` IIFE

현재는 심플 원형 커서 IIFE로 대체돼 있음. 아래로 되돌린다:

```js
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
```
