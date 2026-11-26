(function(){
'use strict';
var A='assets/';
var KEY=document.body.getAttribute('data-season');
var stage=document.getElementById('stage'),prog=document.getElementById('prog'),rate=document.getElementById('rate'),skipB=document.getElementById('skip'),sndB=document.getElementById('snd');

/* ── cast (public profile only) ── */
var C={
 s1:{sion:['남시온',28,'건축설계사'],yeonwoo:['주연우',25,'광고 카피라이터'],taegyeom:['유태겸',29,'다큐멘터리 촬영감독'],hangyeol:['한결',23,'피아노 연주자'],seoa:['채서아',26,'플로리스트'],dain:['문다인',24,'피겨스케이팅 코치'],haerin:['신해린',28,'패션 매거진 에디터']},
 s2:{mujin:['차무진',31,'프라이빗 라운지 브랜드 대표'],igeon:['백이건',27,'DJ · 음악 프로듀서'],jaeheon:['류재헌',29,'프래그런스 크리에이티브 디렉터'],yunjae:['도윤재',28,'펜싱 코치'],rahee:['서라희',28,'광고 · 뷰티 모델'],seon:['진세온',25,'타투이스트'],iseo:['한이서',30,'아트 갤러리 디렉터']}
}[KEY];
var IDS=Object.keys(C);
function face(id){return KEY+'-'+id+'-01.png'}
var BPM=KEY==='s1'?92:100,BEAT=60/BPM;

/* ══════════ MUSIC (season theme, cut so the break and final chorus land on the right scenes) ══════════ */
var music=new Audio(A+'theme-'+KEY+'.mp3');music.preload='auto';var muted=false;
sndB.onclick=function(){muted=!muted;music.muted=muted;sndB.textContent=muted?'🔇 소리 꺼짐':'🔊 소리 켜짐'};

/* ══════════ VISUALS ══════════ */
var timers=[];
function later(fn,ms){timers.push(setTimeout(fn,ms))}
function show(h){var d=document.createElement('div');d.className='scene';d.innerHTML=h;stage.innerHTML='';stage.appendChild(d);return d}
function bg(src,mode,dim){return '<div class="bg '+(mode||'kin')+'" style="background-image:url('+A+src+')"></div><div class="dim" style="background:'+(dim||'rgba(0,0,0,.25)')+'"></div>'}
function fx(n){var h='<div class="fx">';for(var i=0;i<n;i++){var sz=KEY==='s1'?(2+Math.random()*5):(1.5+Math.random()*2.5);h+='<i style="left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+sz+'px;animation-duration:'+(6+Math.random()*8)+'s;animation-delay:-'+(Math.random()*12)+'s;opacity:'+(.4+Math.random()*.6)+'"></i>'}return h+'</div>'}
var tc0=0;
function rec(cam){return '<div class="rec"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><span class="r">REC</span><span class="tc" id="tc">00:00:00:00</span><span class="cam">'+(cam||'CAM 02 · INTERVIEW')+'</span></div>'}
function tickTC(){var el=document.getElementById('tc');if(!el)return;var t=Date.now()-tc0+(KEY==='s2'?85440000:0),f=Math.floor(t/40)%25,s=Math.floor(t/1000),p=function(n){return('0'+n).slice(-2)};el.textContent=p(Math.floor(s/3600)%24)+':'+p(Math.floor(s/60)%60)+':'+p(s%60)+':'+p(f)}
setInterval(tickTC,40);
function type(el,txt,sp){var i=0;el.innerHTML='<span></span><i class="cur"></i>';var s=el.firstChild;(function t(){if(i<=txt.length){s.innerHTML=txt.slice(0,i).replace(/\n/g,'<br>');i++;later(t,sp)}})()}
function setRate(r){rate.className='rate'+(r?' '+r:'');rate.textContent=r==='all'?'ALL':r==='r19'?'19':''}
var trans=KEY==='s1'?'<div class="flash"></div>':'<div class="glitch"></div>';

/* scene factories */
function sOpen(top,sub){return function(){show('<div class="big"><div class="sm" style="animation-delay:.1s">'+top+'</div><div style="animation-delay:.5s;font-size:clamp(22px,5vw,40px)">'+sub+'</div></div>')}}
function sQuestion(q,cam){return function(){var s=show(rec(cam)+'<div class="qt"><small>INTERVIEW</small><div id="ty"></div></div>');type(s.querySelector('#ty'),q,70)}}
function sInterview(id,img,ans,cam){var c=C[id];return function(){show(bg(img,'kin face','linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,.05) 40%,rgba(0,0,0,.65))')+rec(cam)+'<div class="who"><b>'+c[0]+'</b><span>'+c[1]+'세 · '+c[2]+'</span></div><div class="sub"><span>“'+ans+'”</span></div>'+trans)}}
function sQuote(id,q,label){var c=C[id];return function(){show(bg(face(id),'kout face','rgba(0,0,0,.12)')+fx(14)+'<div class="vtag">'+label+'</div><div class="vcap"><span><em>'+c[0]+' · '+c[1]+'세</em>'+q+'</span></div>'+trans)}}
function sBig(lines,bgsrc,dim){return function(){var h=lines.map(function(l,i){var cls=l.charAt(0)==='!'?' class="hl"':l.charAt(0)==='~'?' class="sm"':'';return '<div'+cls+' style="animation-delay:'+(.15+i*.55)+'s">'+l.replace(/^[!~]/,'')+'</div>'}).join('');show((bgsrc?bg(bgsrc,'pan',dim||'rgba(0,0,0,.6)'):'')+fx(KEY==='s1'?30:20)+'<div class="big">'+h+'</div>')}}
function sPlace(src,label,mode){return function(){show(bg(src,mode||'pan','rgba(0,0,0,.2)')+fx(18)+'<div class="vcap"><span>'+label+'</span></div>'+trans)}}
function sGroup(src,line,mode){return function(){show(bg(src,mode||'kin','linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.2) 55%,rgba(0,0,0,.65))')+fx(30)+'<div class="sub"><span>'+line+'</span></div>')}}
function sGrid(cap){return function(){var h=IDS.map(function(id,i){return '<div style="animation-delay:'+(i*.32)+'s"><img src="'+A+face(id)+'" alt=""><span>'+C[id][0]+'</span></div>'}).join('')+'<div class="q" style="animation-delay:'+(IDS.length*.32)+'s">?</div>';show(fx(20)+'<div class="grid">'+h+'</div><div class="gridcap" style="animation-delay:'+(IDS.length*.32+.6)+'s">'+cap+'</div>')}}
/* highlight montage: situational shots, one per beat */
function sMontage(list){return function(){var h=list.map(function(src,i){return '<div style="background-image:url('+A+src+');animation-delay:'+(i*MSTEP)+'s;--md:'+MSTEP+'s"></div>'}).join('');show('<div class="mont">'+h+'</div><div class="dim" style="background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.45))"></div>'+fx(20))}}
function sTitle(k,t1,t2,t3,dim){return function(){show('<div class="dim" style="background:'+dim+'"></div>'+fx(KEY==='s1'?46:36)+'<div class="tt"><div class="k">'+k+'</div><div class="t1">'+t1+'</div><div class="t2">'+t2+'</div><div class="t3">'+t3+'</div></div>'+trans)}}
function airStatus(){var d=new Date(),y=d.getFullYear(),st=new Date(y,10,24),en=new Date(y,11,26);if(d<st)return '첫 방송 D-'+Math.ceil((st-d)/864e5);if(d<en)return 'EP.'+('0'+(Math.floor((d-st)/864e5)+1)).slice(-2)+' 지금 방송 중';return '전 회차 다시보기'}

/* ── season scripts: [duration ms, scene, sound tag] ── */
var M1=['s1-yeonwoo-snow.png','s1-seoa-snow.png','s1-taegyeom-date.png','s1-dain-date.png','s1-hangyeol-snow.png','s1-haerin-snow.png','s1-sion-eve.png','s1-seoa-eve.png'];
var M2=['s2-mujin-date.png','s2-rahee-party.png','s2-igeon-night.png','s2-jaeheon-party.png','s2-yunjae-party.png','s2-iseo-party.png','s2-seon-party.png','s2-jaeheon-date.png'];
function beats(n){return Math.round(n*BEAT*1000)}
var MSTEP=.7;                       /* montage: seconds per shot */
var ASK=KEY==='s1'?2000:2175;         /* two question cards fill the music break exactly */
var SCRIPT={
s1:{rate:'all',mont:M1,end:{bg:'s1-group-2.png',dim:'rgba(244,236,223,.55)',title:'MISTLETOE',ko:'《미슬토우》',d:'11.24 첫 방송 · 크리스마스까지 매일 밤',go:'index.html#s1',other:['JINGLE TV 심야 편성','미슬토우 : AFTER DARK 티저 ›','teaser-s2.html']},
 T:[
  [beats(4),sOpen('JINGLE TV ORIGINAL','올겨울, 단 한 번의 크리스마스'),'open'],
  [beats(6),sQuestion('Q. 이번 겨울,\n어떤 사람을 만나고 싶어요?','CAM 02 · FIRESIDE INTERVIEW'),'q'],
  [beats(5),sInterview('sion','s1-sion-fire.png','일상을 함께 나눌 사람을 만나고 싶어서요.','CAM 02 · FIRESIDE INTERVIEW'),'iv'],
  [beats(5),sInterview('seoa','s1-seoa-fire.png','처음으로, 저를 위한 크리스마스를 보내고 싶었어요.','CAM 02 · FIRESIDE INTERVIEW'),'iv'],
  [beats(5),sInterview('hangyeol','s1-hangyeol-fire.png','정해진 악보 밖의 인연이요.','CAM 02 · FIRESIDE INTERVIEW'),'iv'],
  [beats(5),sInterview('dain','s1-dain-fire.png','솔직하게 다가오는 사람이요. 저도 그럴 거라서.','CAM 02 · FIRESIDE INTERVIEW'),'iv'],
  [beats(4),sBig(['~12.24 크리스마스 이브까지','서로 모르는 남녀 일곱 명이','!한 지붕 아래에서']),'big'],
  [beats(4),sPlace('place-house-01.png','설산 위의 WINTER HOUSE','kin'),'scene'],
  [beats(4),sGroup('s1-group-1.png','첫눈이 내리던 날,'),'scene'],
  [beats(4),sGroup('s1-group-2.png','낯선 사람들이 같은 집에 도착했다','kout'),'scene'],
  [beats(4),sQuote('yeonwoo','여기 자리 있어요. 컵은 누가 이렇게 예쁘게 골라 놨어요?','FIRST IMPRESSION'),'quote'],
  [beats(4),sQuote('taegyeom','돌려 말하는 건 잘 못해요. 같이 걸을래요?','FIRST IMPRESSION'),'quote'],
  [beats(4),sQuote('haerin','첫인상으로 판단하진 않아요. 기억은 해 두지만요.','FIRST IMPRESSION'),'quote'],
  [beats(7),sGrid('그리고, 아직 도착하지 않은 한 사람'),'grid'],
  [ASK,sBig(['첫인상은','!끝까지 갈 수 있을까']),'ask'],
  [ASK,sBig(['크리스마스 아침,','!웃는 사람은 누구일까']),'ask'],
  [6000,sMontage(M1),'mont'],
  [6500,sTitle('JINGLE TV ORIGINAL','MISTLETOE','SEASON 01 · 《미슬토우》','겨울, 사랑이 내리는 순간.','radial-gradient(circle at 50% 45%,#fffaf2,#efe3d0 75%)'),'title']
 ]},
s2:{rate:'r19',mont:M2,end:{bg:'s2-group-1.png',dim:'rgba(11,6,8,.6)',title:'AFTER DARK',ko:'《미슬토우 : AFTER DARK》',d:'11.24 첫 방송 · 매일 밤, 심야 편성',go:'index.html#s2',other:['JINGLE TV 오리지널','미슬토우 시즌 1 티저 ›','teaser-s1.html']},
 T:[
  [beats(4),sOpen('JINGLE TV LATE NIGHT','19세 미만 시청 불가'),'open'],
  [beats(6),sQuestion('Q. 이 집에\n들어온 이유가 뭐예요?','CAM 04 · LATE INTERVIEW'),'q'],
  [beats(5),sInterview('mujin','s2-mujin-night.png','예측할 수 없는 사람들. 그거면 충분하죠.','CAM 04 · LATE INTERVIEW'),'iv'],
  [beats(5),sInterview('rahee','s2-rahee-night.png','자유롭게, 다양한 사람을 만나 보고 싶어서요.','CAM 04 · LATE INTERVIEW'),'iv'],
  [beats(5),sInterview('yunjae','s2-yunjae-night.png','승패 없는 관계. 한 번은 해 보고 싶었어요.','CAM 04 · LATE INTERVIEW'),'iv'],
  [beats(5),sInterview('seon','s2-seon-night.png','평소엔 못 만나는 사람들이 궁금해서?','CAM 04 · LATE INTERVIEW'),'iv'],
  [beats(4),sBig(['~같은 설산, 다른 집','매력과 취향으로 부딪히는','!일곱 명의 밤'],'s2-group-1.png','rgba(10,3,6,.72)'),'big'],
  [beats(4),sPlace('place-house2-00.png','AFTER DARK HOUSE','kin'),'scene'],
  [beats(4),sPlace('place-house2-03.png','VELVET BAR'),'scene'],
  [beats(4),sGroup('s2-group-1.png','정규 일정이 끝난 뒤부터,'),'scene'],
  [beats(4),sGroup('s2-group-2.png','진짜가 시작된다','kout'),'scene'],
  [beats(4),sQuote('igeon','와, 분위기부터 돈 좀 썼네. 여기 진짜 크리스마스 맞죠?','FIRST IMPRESSION'),'quote'],
  [beats(4),sQuote('jaeheon','아까와 향이 달라졌네요. 조금 더 가벼운 쪽으로.','FIRST IMPRESSION'),'quote'],
  [beats(4),sQuote('iseo','처음 오셨으면 규칙부터 확인하는 게 편할 거예요.','FIRST IMPRESSION'),'quote'],
  [beats(7),sGrid('그리고, 예정에 없던 마지막 변수'),'grid'],
  [ASK,sBig(['누가 먼저','!선을 넘을까']),'ask'],
  [ASK,sBig(['마지막 밤,','!끝까지 남는 사람은']),'ask'],
  [6000,sMontage(M2),'mont'],
  [6500,sTitle('MISTLETOE · SEASON 02','AFTER DARK','《미슬토우 : AFTER DARK》','겨울, 마음이 가장 뜨거워지는 밤.','radial-gradient(circle at 50% 42%,#3a0d1c,#0b0608 72%)'),'title']
 ]}
}[KEY];

/* ── playback: scenes follow the music clock, so cuts stay on the break and the final chorus ── */
var raf=0,idx=0,starts=[],total=0,startWall=0,useMusic=true;
(function(){var at=0;SCRIPT.T.forEach(function(s){starts.push(at);at+=s[0]});total=at})();
function clock(){return useMusic&&music.currentTime>0?music.currentTime*1000:Date.now()-startWall}
function loop(){
  var t=clock();
  while(idx<SCRIPT.T.length&&t>=starts[idx]){var s=SCRIPT.T[idx];s[1]();prog.style.transition='width '+(s[0]/1000)+'s linear';prog.style.width=((starts[idx]+s[0])/total*100)+'%';idx++}
  if(idx>=SCRIPT.T.length&&t>=total){endCard(false);return}
  raf=requestAnimationFrame(loop);
}
function endCard(fromSkip){
  cancelAnimationFrame(raf);clear();var e=SCRIPT.end;skipB.style.display='none';prog.style.transition='none';prog.style.width='100%';
  if(fromSkip&&useMusic){try{music.currentTime=total/1000;if(music.paused)music.play()}catch(err){}}
  show(bg(e.bg,'kin',e.dim)+fx(24)+'<div class="end"><div class="lg">JINGLE<b>·</b>TV '+(KEY==='s1'?'ORIGINAL':'LATE NIGHT')+'</div><h1>'+e.title+'</h1><div class="ko">'+e.ko+'</div><div class="d">'+e.d+'</div><div class="st"><i></i>'+airStatus()+'</div>'+
   '<div class="btns"><a class="go" href="'+e.go+'">프로그램 소개 보러 가기</a><button class="rp" id="replay">↻ 티저 다시 보기</button></div><a class="other" href="'+e.other[2]+'">'+e.other[0]+'<b>'+e.other[1]+'</b></a></div>');
  document.getElementById('replay').onclick=play;
}
function clear(){timers.forEach(clearTimeout);timers=[]}
function play(){
  cancelAnimationFrame(raf);clear();idx=0;skipB.style.display='';setRate(SCRIPT.rate);tc0=Date.now();startWall=Date.now();
  prog.style.transition='none';prog.style.width='0';
  useMusic=true;music.muted=muted;
  try{music.currentTime=0}catch(err){}
  var p=music.play();if(p&&p.catch)p.catch(function(){useMusic=false;startWall=Date.now()});
  loop();
}
skipB.onclick=function(){endCard(true)};
/* leaving the tab pauses the music; the scenes wait with it */
document.addEventListener('visibilitychange',function(){if(document.hidden&&!music.paused){music.pause();music.__resume=true}else if(!document.hidden&&music.__resume){music.__resume=false;music.play()}});

/* ── start screen: preload images + theme, then play on tap ── */
var imgs=IDS.map(face).concat([KEY+'-group-1.png',KEY+'-group-2.png'],SCRIPT.mont,
  KEY==='s1'?['place-house-01.png','s1-sion-fire.png','s1-seoa-fire.png','s1-hangyeol-fire.png','s1-dain-fire.png']:['place-house2-00.png','place-house2-03.png','s2-mujin-night.png','s2-rahee-night.png','s2-yunjae-night.png','s2-seon-night.png']);
var need=imgs.length+1,done=0,btn=document.getElementById('playBtn'),pbi=document.getElementById('pbi');
btn.disabled=true;
function one(){done++;pbi.style.width=(done/need*100)+'%';if(done>=need)ready()}
imgs.forEach(function(s){var im=new Image();im.onload=im.onerror=one;im.src=A+s});
var mOnce=false;function mDone(){if(!mOnce){mOnce=true;one()}}
music.addEventListener('canplaythrough',mDone);music.addEventListener('error',mDone);music.load();
var isReady=false;function ready(){if(isReady)return;isReady=true;btn.disabled=false;btn.querySelector('span').textContent=btn.getAttribute('data-label')}
setTimeout(ready,12000);
btn.onclick=function(){document.getElementById('start').classList.add('hide');play()};
})();
