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

/* ══════════ SOUND (synthesized in the browser, no audio files) ══════════ */
var AC=null,master=null,revIn=null,muted=false;
function audioInit(){
  try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)()}if(AC.state==='suspended')AC.resume()}catch(e){AC=null}
}
function impulse(sec,decay){var r=AC.sampleRate,n=r*sec,b=AC.createBuffer(2,n,r);for(var c=0;c<2;c++){var d=b.getChannelData(c);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}return b}
var NOISE=null;function noiseBuf(){if(!NOISE){var n=AC.sampleRate*2;NOISE=AC.createBuffer(1,n,AC.sampleRate);var d=NOISE.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1}return NOISE}
function newBus(){
  if(!AC)return;
  if(master){var old=master;old.gain.cancelScheduledValues(AC.currentTime);old.gain.setTargetAtTime(0,AC.currentTime,.06);setTimeout(function(){try{old.disconnect()}catch(e){}},800)}
  master=AC.createGain();master.gain.value=muted?0:.85;
  var comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;
  master.connect(comp);comp.connect(AC.destination);
  var conv=AC.createConvolver();conv.buffer=impulse(KEY==='s1'?3.2:2.4,KEY==='s1'?2.2:3);
  var rg=AC.createGain();rg.gain.value=KEY==='s1'?.42:.3;conv.connect(rg);rg.connect(master);
  revIn=conv;
}
function out(node,dry,wet){var g=AC.createGain();g.gain.value=dry;node.connect(g);g.connect(master);if(wet){var w=AC.createGain();w.gain.value=wet;node.connect(w);w.connect(revIn)}}
function hz(m){return 440*Math.pow(2,(m-69)/12)}
function env(g,t,a,peak,rel){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+rel)}
/* instruments */
function box(m,t,v){ /* music box / celesta */
  [[1,'sine',1],[2,'sine',.35],[3.01,'triangle',.12]].forEach(function(p){var o=AC.createOscillator(),g=AC.createGain();o.type=p[1];o.frequency.value=hz(m)*p[0];env(g,t,.005,(v||.11)*p[2],1.4);o.connect(g);out(g,.9,.9);o.start(t);o.stop(t+1.6)})
}
function pad(ms,t,dur,v,cut){
  var f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=cut||900;var g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v||.035,t+Math.min(.9,dur*.4));g.gain.setValueAtTime(v||.035,t+dur*.8);g.gain.linearRampToValueAtTime(0.0001,t+dur+.6);
  f.connect(g);out(g,1,.6);
  ms.forEach(function(m){[-6,6].forEach(function(dt){var o=AC.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=dt;o.connect(f);o.start(t);o.stop(t+dur+.8)})});
}
function bass(m,t,dur,v){var o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();o.type='triangle';o.frequency.value=hz(m);f.type='lowpass';f.frequency.value=380;env(g,t,.01,v||.22,dur);o.connect(f);f.connect(g);out(g,1,0);o.start(t);o.stop(t+dur+.1)}
function kick(t,v,f0,f1){var o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(f0||120,t);o.frequency.exponentialRampToValueAtTime(f1||42,t+.22);env(g,t,.004,v||.5,.32);o.connect(g);out(g,1,0);o.start(t);o.stop(t+.4)}
function heart(t,v){kick(t,v||.42,80,38);kick(t+.2,(v||.42)*.7,72,36)}
function noise(t,dur,type,f0,f1,v,q,wet){var s=AC.createBufferSource();s.buffer=noiseBuf();var f=AC.createBiquadFilter();f.type=type;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);var g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+Math.min(.01,dur/3));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);out(g,1,wet||0);s.start(t);s.stop(t+dur+.05)}
function hat(t,v){noise(t,.05,'highpass',7500,0,v||.05)}
function bells(t,v){for(var i=0;i<3;i++)noise(t+i*.035,.09,'bandpass',6800+i*900,0,v||.05,6,.4)}
function whoosh(t,dur,v,up){noise(t,dur||.6,'bandpass',up?400:3200,up?5000:300,v||.08,1.2,.3)}
function riser(t,dur,v){var s=AC.createBufferSource();s.buffer=noiseBuf();s.loop=true;var f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(7000,t+dur);var g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v||.14,t+dur*.95);g.gain.linearRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);out(g,1,.3);s.start(t);s.stop(t+dur+.05)}
function boom(t,v){var o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(28,t+1.8);env(g,t,.01,v||.6,2.4);o.connect(g);out(g,1,.4);o.start(t);o.stop(t+2.6);noise(t,1.2,'lowpass',900,120,.12,1,.5)}
function glitch(t){for(var i=0;i<4;i++){var o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=180+Math.random()*1400;env(g,t+i*.035,.002,.035,.03);o.connect(g);out(g,1,0);o.start(t+i*.035);o.stop(t+i*.035+.06)}noise(t,.14,'highpass',2500,0,.06)}
function tick(t){noise(t,.018,'highpass',3500,0,.03)}
function pop(t){var o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(900,t);o.frequency.exponentialRampToValueAtTime(1600,t+.06);env(g,t,.003,.07,.09);o.connect(g);out(g,1,.2);o.start(t);o.stop(t+.15)}
function shimmer(t,dur){[88,91,95,100].forEach(function(m,i){var o=AC.createOscillator(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();o.frequency.value=hz(m);l.frequency.value=5+i;lg.gain.value=.012;l.connect(lg);lg.connect(g.gain);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.02,t+.4);g.gain.linearRampToValueAtTime(0.0001,t+dur);o.connect(g);out(g,.6,1);o.start(t);o.stop(t+dur);l.start(t);l.stop(t+dur)})}

/* chord sets */
var S1CH=[[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,52]]; /* Cmaj7 Am7 Fmaj7 G6 */
var S2CH=[[45,48,52],[41,45,48,52],[50,53,57],[40,44,47]];        /* Am Fmaj7 Dm E */
function arp(ch,t,beats,v,oct){var pat=[0,2,1,3,2,1,3,2];for(var i=0;i<beats*2;i++){var n=ch[pat[i%8]%ch.length]+(oct||24);box(n,t+i*BEAT/2,v||.07)}}
function groove(t,dur,o){ /* o: kick,hat,bell,bass,ch */
  var n=Math.floor(dur/BEAT);for(var b=0;b<n;b++){var tb=t+b*BEAT;
    if(o.kick&&(o.kick===1||b%2===0))kick(tb,o.kv||.45);
    if(o.hat){hat(tb+BEAT/2,.045);if(o.hat>1){hat(tb+BEAT/4,.025);hat(tb+BEAT*3/4,.025)}}
    if(o.bell&&b%2===1)bells(tb+BEAT/2,.04);
    if(o.bass)bass(o.ch[0]-12,tb,BEAT*.9,o.bv||.2);
  }
}
/* score per scene tag */
function score(tag,t,dur,i){
  if(!AC||!master)return;
  if(KEY==='s1'){
    var ch=S1CH[i%4];
    switch(tag){
     case 'open':pad(S1CH[0],t,dur+.4,.03);box(79,t+.4,.12);box(76,t+1.1,.09);break;
     case 'q':pad(S1CH[1],t,dur,.03);box(81,t+.3,.08);break;
     case 'iv':pad(ch,t,dur,.032);box(ch[3]+24,t+.15,.12);whoosh(t,.5,.05);[1,2,3].forEach(function(k){box(ch[k%ch.length]+24+(k===3?12:0),t+k*BEAT,.07)});break;
     case 'big':pad(ch,t,dur,.04,1400);arp(ch,t,Math.floor(dur/BEAT),.06);bells(t,.05);break;
     case 'scene':pad(ch,t,dur,.04,1600);arp(ch,t,Math.floor(dur/BEAT),.065);groove(t,dur,{kick:2,kv:.3,bell:1,hat:1});break;
     case 'quote':pad(ch,t,dur,.04,1800);arp(ch,t,Math.floor(dur/BEAT),.065);groove(t,dur,{kick:2,kv:.32,bell:1,hat:1,bass:1,ch:ch,bv:.14});pop(t+.05);break;
     case 'grid':pad(S1CH[3],t,dur,.04,2000);riser(t+.4,dur-.4,.12);IDS.concat(['?']).forEach(function(_,k){box(84+k,t+k*.32,.06)});break;
     case 'ask':pad(S1CH[1],t,dur+.2,.04,700);box(69,t+.2,.1);box(64,t+.8,.08);heart(t+.1,.22);break;
     case 'mont':var ch2=S1CH[0];pad(ch2,t,dur,.045,2600);groove(t,dur-BEAT,{kick:1,kv:.5,bell:1,hat:2,bass:1,ch:ch2});arp(ch2,t,Math.floor(dur/BEAT)-1,.08);break;
     case 'title':box(84,t,.16);box(88,t,.12);box(91,t,.12);box(95,t+.02,.1);pad([48,55,59,64],t,dur+1.5,.05,2200);boom(t,.32);[76,74,72,71,72].forEach(function(m,k){box(m+12,t+1.2+k*BEAT,.09)});break;
     case 'end':pad(S1CH[0],t,8,.03,1000);box(84,t+.5,.07);box(79,t+2,.06);box(76,t+3.5,.05);break;
    }
  }else{
    var c2=S2CH[i%4];
    switch(tag){
     case 'open':boom(t+.1,.45);pad([33,45],t,dur+.5,.05,300);glitch(t+.05);break;
     case 'q':pad([33,45,48],t,dur,.04,400);heart(t+.4,.35);heart(t+1.9,.35);break;
     case 'iv':pad(c2,t,dur,.035,550);glitch(t);var n=Math.floor(dur/(BEAT/2));for(var k=0;k<n;k++)bass(c2[0]-12,t+k*BEAT/2,BEAT/2*.8,.16);heart(t+.3,.28);break;
     case 'big':pad(c2,t,dur,.045,800);riser(t,dur,.06);for(var k2=0;k2<Math.floor(dur/BEAT);k2++)bass(c2[0]-12,t+k2*BEAT,BEAT*.8,.2);break;
     case 'scene':pad(c2,t,dur,.045,900);glitch(t);groove(t,dur,{kick:2,kv:.45,hat:2,bass:1,ch:c2,bv:.2});break;
     case 'quote':pad(c2,t,dur,.045,1000);glitch(t);groove(t,dur,{kick:1,kv:.5,hat:2,bass:1,ch:c2,bv:.22});pop(t+.05);break;
     case 'grid':pad(S2CH[3],t,dur,.05,1200);riser(t+.3,dur-.3,.16);IDS.concat(['?']).forEach(function(_,k){kick(t+k*.32,.18,300,120)});break;
     case 'ask':pad([33],t,dur,.05,200);heart(t+.25,.55);heart(t+1.35,.55);break;
     case 'mont':var c3=S2CH[0];pad(c3,t,dur,.05,1600);groove(t,dur-BEAT,{kick:1,kv:.6,hat:2,bass:1,ch:c3,bv:.26});for(var k3=0;k3<Math.floor(dur/BEAT)-1;k3++)if(k3%2===1)noise(t+k3*BEAT,.12,'bandpass',1800,0,.07,3);break;
     case 'title':boom(t,.7);shimmer(t+.1,dur+.8);pad([33,40,45,48,52],t,dur+1.2,.05,1500);break;
     case 'end':pad([33,45,52],t,8,.035,500);shimmer(t+.5,5);break;
    }
  }
}
sndB.onclick=function(){muted=!muted;sndB.textContent=muted?'🔇 소리 꺼짐':'🔊 소리 켜짐';if(master&&AC)master.gain.setTargetAtTime(muted?0:.85,AC.currentTime,.05)};

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
function type(el,txt,sp){var i=0;el.innerHTML='<span></span><i class="cur"></i>';var s=el.firstChild;(function t(){if(i<=txt.length){s.innerHTML=txt.slice(0,i).replace(/\n/g,'<br>');if(AC&&master&&i>0&&txt.charAt(i-1)!==' '&&txt.charAt(i-1)!=='\n')tick(AC.currentTime);i++;later(t,sp)}})()}
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
function sMontage(list){return function(){var h=list.map(function(src,i){return '<div style="background-image:url('+A+src+');animation-delay:'+(i*BEAT)+'s;--md:'+BEAT+'s"></div>'}).join('');show('<div class="mont">'+h+'</div><div class="dim" style="background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.45))"></div>'+fx(20))}}
function sTitle(k,t1,t2,t3,dim){return function(){show('<div class="dim" style="background:'+dim+'"></div>'+fx(KEY==='s1'?46:36)+'<div class="tt"><div class="k">'+k+'</div><div class="t1">'+t1+'</div><div class="t2">'+t2+'</div><div class="t3">'+t3+'</div></div>'+trans)}}
function airStatus(){var d=new Date(),y=d.getFullYear(),st=new Date(y,10,24),en=new Date(y,11,26);if(d<st)return '첫 방송 D-'+Math.ceil((st-d)/864e5);if(d<en)return 'EP.'+('0'+(Math.floor((d-st)/864e5)+1)).slice(-2)+' 지금 방송 중';return '전 회차 다시보기'}

/* ── season scripts: [duration ms, scene, sound tag] ── */
var M1=['s1-yeonwoo-snow.png','s1-seoa-snow.png','s1-taegyeom-date.png','s1-dain-date.png','s1-hangyeol-snow.png','s1-haerin-snow.png','s1-sion-eve.png','s1-seoa-eve.png'];
var M2=['s2-mujin-date.png','s2-rahee-party.png','s2-igeon-night.png','s2-jaeheon-party.png','s2-yunjae-party.png','s2-iseo-party.png','s2-seon-party.png','s2-jaeheon-date.png'];
function beats(n){return Math.round(n*BEAT*1000)}
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
  [beats(4),sBig(['첫인상은','!끝까지 갈 수 있을까']),'ask'],
  [beats(4),sBig(['크리스마스 아침,','!웃는 사람은 누구일까']),'ask'],
  [beats(M1.length+1),sMontage(M1),'mont'],
  [beats(7),sTitle('JINGLE TV ORIGINAL','MISTLETOE','SEASON 01 · 《미슬토우》','겨울, 사랑이 내리는 순간.','radial-gradient(circle at 50% 45%,#fffaf2,#efe3d0 75%)'),'title']
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
  [beats(4),sBig(['누가 먼저','!선을 넘을까']),'ask'],
  [beats(4),sBig(['마지막 밤,','!끝까지 남는 사람은']),'ask'],
  [beats(M2.length+1),sMontage(M2),'mont'],
  [beats(7),sTitle('MISTLETOE · SEASON 02','AFTER DARK','《미슬토우 : AFTER DARK》','겨울, 마음이 가장 뜨거워지는 밤.','radial-gradient(circle at 50% 42%,#3a0d1c,#0b0608 72%)'),'title']
 ]}
}[KEY];

function endCard(fromSkip){
  clear();var e=SCRIPT.end;skipB.style.display='none';prog.style.transition='none';prog.style.width='100%';
  if(fromSkip)newBus();
  score('end',AC?AC.currentTime+.05:0,8,0);
  show(bg(e.bg,'kin',e.dim)+fx(24)+'<div class="end"><div class="lg">JINGLE<b>·</b>TV '+(KEY==='s1'?'ORIGINAL':'LATE NIGHT')+'</div><h1>'+e.title+'</h1><div class="ko">'+e.ko+'</div><div class="d">'+e.d+'</div><div class="st"><i></i>'+airStatus()+'</div>'+
   '<div class="btns"><a class="go" href="'+e.go+'">프로그램 소개 보러 가기</a><button class="rp" id="replay">↻ 티저 다시 보기</button></div><a class="other" href="'+e.other[2]+'">'+e.other[0]+'<b>'+e.other[1]+'</b></a></div>');
  document.getElementById('replay').onclick=play;
}
function clear(){timers.forEach(clearTimeout);timers=[]}
function play(){
  clear();audioInit();newBus();skipB.style.display='';setRate(SCRIPT.rate);tc0=Date.now();
  var total=SCRIPT.T.reduce(function(s,x){return s+x[0]},0),at=0,a0=AC?AC.currentTime+.08:0;
  prog.style.transition='none';prog.style.width='0';
  SCRIPT.T.forEach(function(s,i){var a=at;
    score(s[2],a0+a/1000,s[0]/1000,i);
    later(function(){s[1]();prog.style.transition='width '+(s[0]/1000)+'s linear';prog.style.width=((a+s[0])/total*100)+'%'},a+80);
    at+=s[0]});
  later(function(){endCard(false)},at+80);
}
skipB.onclick=function(){endCard(true)};

/* ── start screen: preload, then play on tap (tap also unlocks sound) ── */
var imgs=IDS.map(face).concat([KEY+'-group-1.png',KEY+'-group-2.png'],SCRIPT.mont,
  SCRIPT.T.map(function(s){return null}).filter(Boolean),
  KEY==='s1'?['place-house-01.png','s1-sion-fire.png','s1-seoa-fire.png','s1-hangyeol-fire.png','s1-dain-fire.png']:['place-house2-00.png','place-house2-03.png','s2-mujin-night.png','s2-rahee-night.png','s2-yunjae-night.png','s2-seon-night.png']);
var done=0,btn=document.getElementById('playBtn'),pbi=document.getElementById('pbi');
btn.disabled=true;
imgs.forEach(function(s){var im=new Image();im.onload=im.onerror=function(){done++;pbi.style.width=(done/imgs.length*100)+'%';if(done===imgs.length)ready()};im.src=A+s});
var isReady=false;function ready(){if(isReady)return;isReady=true;btn.disabled=false;btn.querySelector('span').textContent=btn.getAttribute('data-label')}
setTimeout(ready,12000);
btn.onclick=function(){document.getElementById('start').classList.add('hide');play()};
})();
