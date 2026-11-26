(function(){
'use strict';
var A='assets/';
var KEY=document.body.getAttribute('data-season');
var stage=document.getElementById('stage'),prog=document.getElementById('prog'),rate=document.getElementById('rate'),skipB=document.getElementById('skip');

/* ── cast (public profile only) ── */
var C={
 s1:{sion:['남시온',28,'건축설계사'],yeonwoo:['주연우',25,'광고 카피라이터'],taegyeom:['유태겸',29,'다큐멘터리 촬영감독'],hangyeol:['한결',23,'피아노 연주자'],seoa:['채서아',26,'플로리스트'],dain:['문다인',24,'피겨스케이팅 코치'],haerin:['신해린',28,'패션 매거진 에디터']},
 s2:{mujin:['차무진',31,'프라이빗 라운지 브랜드 대표'],igeon:['백이건',27,'DJ · 음악 프로듀서'],jaeheon:['류재헌',29,'프래그런스 크리에이티브 디렉터'],yunjae:['도윤재',28,'펜싱 코치'],rahee:['서라희',28,'광고 · 뷰티 모델'],seon:['진세온',25,'타투이스트'],iseo:['한이서',30,'아트 갤러리 디렉터']}
}[KEY];
var IDS=Object.keys(C);
function face(id){return KEY+'-'+id+'-01.png'}

/* ── building blocks ── */
var timers=[];
function later(fn,ms){timers.push(setTimeout(fn,ms))}
function show(h){var d=document.createElement('div');d.className='scene';d.innerHTML=h;stage.innerHTML='';stage.appendChild(d);return d}
function bg(src,mode,dim){return '<div class="bg '+(mode||'kin')+'" style="background-image:url('+A+src+')"></div><div class="dim" style="background:'+(dim||'rgba(0,0,0,.25)')+'"></div>'}
function fx(n){var h='<div class="fx">';for(var i=0;i<n;i++){var sz=KEY==='s1'?(2+Math.random()*5):(1.5+Math.random()*2.5);h+='<i style="left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+sz+'px;animation-duration:'+(6+Math.random()*8)+'s;animation-delay:-'+(Math.random()*12)+'s;opacity:'+(.4+Math.random()*.6)+'"></i>'}return h+'</div>'}
var tc0=0;
function rec(cam){return '<div class="rec"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><span class="r">REC</span><span class="tc" id="tc">00:00:00:00</span><span class="cam">'+(cam||'CAM 02 · INTERVIEW')+'</span></div>'}
function tick(){var el=document.getElementById('tc');if(!el)return;var t=Date.now()-tc0+(KEY==='s2'?85440000:0),f=Math.floor(t/40)%25,s=Math.floor(t/1000),p=function(n){return('0'+n).slice(-2)};el.textContent=p(Math.floor(s/3600)%24)+':'+p(Math.floor(s/60)%60)+':'+p(s%60)+':'+p(f)}
setInterval(tick,40);
function type(el,txt,sp){var i=0;el.innerHTML='<span></span><i class="cur"></i>';var s=el.firstChild;(function t(){if(i<=txt.length){s.innerHTML=txt.slice(0,i).replace(/\n/g,'<br>');i++;later(t,sp)}})()}
function setRate(r){rate.className='rate'+(r?' '+r:'');rate.textContent=r==='all'?'ALL':r==='r19'?'19':''}
var trans=KEY==='s1'?'<div class="flash"></div>':'<div class="glitch"></div>';

/* scene factories */
function sOpen(top,sub){return function(){show('<div class="big"><div class="sm" style="animation-delay:.1s">'+top+'</div><div style="animation-delay:.5s;font-size:clamp(22px,5vw,40px)">'+sub+'</div></div>')}}
function sQuestion(q,cam){return function(){var s=show(rec(cam)+'<div class="qt"><small>INTERVIEW</small><div id="ty"></div></div>');type(s.querySelector('#ty'),q,70)}}
function sInterview(id,ans,cam){var c=C[id];return function(){show(bg(face(id),'kin face','linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.05) 40%,rgba(0,0,0,.6))')+rec(cam)+'<div class="who"><b>'+c[0]+'</b><span>'+c[1]+'세 · '+c[2]+'</span></div><div class="sub"><span>“'+ans+'”</span></div>'+trans)}}
function sQuote(id,q,label){var c=C[id];return function(){show(bg(face(id),'kout face','rgba(0,0,0,.12)')+fx(14)+'<div class="vtag">'+label+'</div><div class="vcap"><span><em>'+c[0]+' · '+c[1]+'세</em>'+q+'</span></div>'+trans)}}
function sBig(lines,bgsrc,dim){return function(){var h=lines.map(function(l,i){var cls=l.charAt(0)==='!'?' class="hl"':l.charAt(0)==='~'?' class="sm"':'';return '<div'+cls+' style="animation-delay:'+(.15+i*.55)+'s">'+l.replace(/^[!~]/,'')+'</div>'}).join('');show((bgsrc?bg(bgsrc,'pan',dim||'rgba(0,0,0,.6)'):'')+fx(KEY==='s1'?30:20)+'<div class="big">'+h+'</div>')}}
function sPlace(src,label,mode){return function(){show(bg(src,mode||'pan','rgba(0,0,0,.2)')+fx(18)+'<div class="vcap"><span>'+label+'</span></div>'+trans)}}
function sGroup(src,line,mode){return function(){show(bg(src,mode||'kin','linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.2) 55%,rgba(0,0,0,.65))')+fx(30)+'<div class="sub"><span>'+line+'</span></div>')}}
function sGrid(cap){return function(){var h=IDS.map(function(id,i){return '<div style="animation-delay:'+(i*.32)+'s"><img src="'+A+face(id)+'" alt=""><span>'+C[id][0]+'</span></div>'}).join('')+'<div class="q" style="animation-delay:'+(IDS.length*.32+.5)+'s">?</div>';show(fx(20)+'<div class="grid">'+h+'</div><div class="gridcap" style="animation-delay:'+(IDS.length*.32+1)+'s">'+cap+'</div>')}}
function sMontage(){return function(){var step=.32,h=IDS.concat(IDS.slice(0,3)).map(function(id,i){return '<div style="background-image:url('+A+face(id)+');animation-delay:'+(i*step)+'s;--md:'+step+'s"></div>'}).join('');show('<div class="mont beat">'+h+'</div>'+fx(20))}}
function sTitle(k,t1,t2,t3,dim){return function(){show('<div class="dim" style="background:'+dim+'"></div>'+fx(KEY==='s1'?46:36)+'<div class="tt"><div class="k">'+k+'</div><div class="t1">'+t1+'</div><div class="t2">'+t2+'</div><div class="t3">'+t3+'</div></div>'+trans)}}
function airStatus(){var d=new Date(),y=d.getFullYear(),st=new Date(y,10,24),en=new Date(y,11,26);if(d<st)return '첫 방송 D-'+Math.ceil((st-d)/864e5);if(d<en)return 'EP.'+('0'+(Math.floor((d-st)/864e5)+1)).slice(-2)+' 지금 방송 중';return '전 회차 다시보기'}

/* ── season scripts ── */
var SCRIPT={
s1:{rate:'all',end:{bg:'s1-group-2.png',dim:'rgba(244,236,223,.55)',title:'MISTLETOE',ko:'《미슬토우》',d:'11.24 첫 방송 · 크리스마스까지 매일 밤',go:'index.html#s1',other:['JINGLE TV 심야 편성','미슬토우 : AFTER DARK 티저 ›','teaser-s2.html']},
 T:[
  [2400,sOpen('JINGLE TV ORIGINAL','올겨울, 단 한 번의 크리스마스')],
  [3600,sQuestion('Q. 이번 겨울,\n어떤 사람을 만나고 싶어요?','CAM 02 · INTERVIEW')],
  [2900,sInterview('sion','일상을 함께 나눌 사람을 만나고 싶어서요.')],
  [2900,sInterview('seoa','처음으로, 저를 위한 크리스마스를 보내고 싶었어요.')],
  [2900,sInterview('hangyeol','정해진 악보 밖의 인연이요.')],
  [2900,sInterview('dain','솔직하게 다가오는 사람이요. 저도 그럴 거라서.')],
  [2600,sBig(['~12.24 크리스마스 이브까지','서로 모르는 남녀 일곱 명이','!한 지붕 아래에서'])],
  [2500,sPlace('place-house-01.png','설산 위의 WINTER HOUSE','kin')],
  [2800,sGroup('s1-group-1.png','첫눈이 내리던 날,')],
  [2600,sGroup('s1-group-2.png','낯선 사람들이 같은 집에 도착했다','kout')],
  [2700,sQuote('yeonwoo','여기 자리 있어요. 컵은 누가 이렇게 예쁘게 골라 놨어요?','FIRST IMPRESSION')],
  [2700,sQuote('taegyeom','돌려 말하는 건 잘 못해요. 같이 걸을래요?','FIRST IMPRESSION')],
  [2700,sQuote('haerin','첫인상으로 판단하진 않아요. 기억은 해 두지만요.','FIRST IMPRESSION')],
  [2000,sPlace('place-house-02.png','벽난로 앞의 밤')],
  [4300,sGrid('그리고, 아직 도착하지 않은 한 사람')],
  [2600,sBig(['첫인상은','!끝까지 갈 수 있을까'])],
  [2600,sBig(['크리스마스 아침,','!웃는 사람은 누구일까'])],
  [3300,sMontage()],
  [3900,sTitle('JINGLE TV ORIGINAL','MISTLETOE','SEASON 01 · 《미슬토우》','겨울, 사랑이 내리는 순간.','radial-gradient(circle at 50% 45%,#fffaf2,#efe3d0 75%)')]
 ]},
s2:{rate:'r19',end:{bg:'s2-group-1.png',dim:'rgba(11,6,8,.6)',title:'AFTER DARK',ko:'《미슬토우 : AFTER DARK》',d:'11.24 첫 방송 · 매일 밤, 심야 편성',go:'index.html#s2',other:['JINGLE TV 오리지널','미슬토우 시즌 1 티저 ›','teaser-s1.html']},
 T:[
  [2400,sOpen('JINGLE TV LATE NIGHT','19세 미만 시청 불가')],
  [3600,sQuestion('Q. 이 집에\n들어온 이유가 뭐예요?','CAM 04 · LATE INTERVIEW')],
  [2900,sInterview('mujin','예측할 수 없는 사람들. 그거면 충분하죠.','CAM 04 · LATE INTERVIEW')],
  [2900,sInterview('rahee','자유롭게, 다양한 사람을 만나 보고 싶어서요.','CAM 04 · LATE INTERVIEW')],
  [2900,sInterview('yunjae','승패 없는 관계. 한 번은 해 보고 싶었어요.','CAM 04 · LATE INTERVIEW')],
  [2900,sInterview('seon','평소엔 못 만나는 사람들이 궁금해서?','CAM 04 · LATE INTERVIEW')],
  [2600,sBig(['~같은 설산, 다른 집','매력과 취향으로 부딪히는','!일곱 명의 밤'],'s2-group-1.png','rgba(10,3,6,.72)')],
  [2400,sPlace('place-house2-00.png','AFTER DARK HOUSE','kin')],
  [2200,sPlace('place-house2-03.png','VELVET BAR')],
  [2800,sGroup('s2-group-1.png','정규 일정이 끝난 뒤부터,')],
  [2600,sGroup('s2-group-2.png','진짜가 시작된다','kout')],
  [2700,sQuote('igeon','와, 분위기부터 돈 좀 썼네. 여기 진짜 크리스마스 맞죠?','FIRST IMPRESSION')],
  [2700,sQuote('jaeheon','아까와 향이 달라졌네요. 조금 더 가벼운 쪽으로.','FIRST IMPRESSION')],
  [2700,sQuote('iseo','처음 오셨으면 규칙부터 확인하는 게 편할 거예요.','FIRST IMPRESSION')],
  [2000,sPlace('place-house2-01.png','MIDNIGHT LOUNGE')],
  [4300,sGrid('그리고, 예정에 없던 마지막 변수')],
  [2600,sBig(['누가 먼저','!선을 넘을까'])],
  [2600,sBig(['마지막 밤,','!끝까지 남는 사람은'])],
  [3300,sMontage()],
  [4000,sTitle('MISTLETOE · SEASON 02','AFTER DARK','《미슬토우 : AFTER DARK》','겨울, 마음이 가장 뜨거워지는 밤.','radial-gradient(circle at 50% 42%,#3a0d1c,#0b0608 72%)')]
 ]}
}[KEY];

function endCard(){
  clear();var e=SCRIPT.end;skipB.style.display='none';prog.style.width='100%';
  show(bg(e.bg,'kin',e.dim)+fx(24)+'<div class="end"><div class="lg">JINGLE<b>·</b>TV '+(KEY==='s1'?'ORIGINAL':'LATE NIGHT')+'</div><h1>'+e.title+'</h1><div class="ko">'+e.ko+'</div><div class="d">'+e.d+'</div><div class="st"><i></i>'+airStatus()+'</div>'+
   '<div class="btns"><a class="go" href="'+e.go+'">프로그램 소개 보러 가기</a><button class="rp" id="replay">↻ 티저 다시 보기</button></div><a class="other" href="'+e.other[2]+'">'+e.other[0]+'<b>'+e.other[1]+'</b></a></div>');
  document.getElementById('replay').onclick=play;
}
function clear(){timers.forEach(clearTimeout);timers=[]}
function play(){
  clear();skipB.style.display='';setRate(SCRIPT.rate);tc0=Date.now();
  var total=SCRIPT.T.reduce(function(s,x){return s+x[0]},0),at=0;
  prog.style.transition='none';prog.style.width='0';
  SCRIPT.T.forEach(function(s){var a=at;later(function(){s[1]();prog.style.transition='width '+(s[0]/1000)+'s linear';prog.style.width=((a+s[0])/total*100)+'%'},a);at+=s[0]});
  later(endCard,at);
}
skipB.onclick=endCard;

/* ── start screen: preload, then play on tap ── */
var imgs=IDS.map(face).concat([KEY+'-group-1.png',KEY+'-group-2.png'],KEY==='s1'?['place-house-01.png','place-house-02.png']:['place-house2-00.png','place-house2-01.png','place-house2-03.png']);
var done=0,btn=document.getElementById('playBtn'),pbi=document.getElementById('pbi');
btn.disabled=true;
imgs.forEach(function(s){var im=new Image();im.onload=im.onerror=function(){done++;pbi.style.width=(done/imgs.length*100)+'%';if(done===imgs.length)ready()};im.src=A+s});
var isReady=false;function ready(){if(isReady)return;isReady=true;btn.disabled=false;btn.querySelector('span').textContent=btn.getAttribute('data-label')}
setTimeout(ready,10000);
btn.onclick=function(){document.getElementById('start').classList.add('hide');play()};
})();
