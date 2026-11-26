(() => {
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id), screens={menu:$('menu'),paused:$('paused'),over:$('over')};
  const W=960,H=480,ground=390;let state='menu',last=0,time=0,speed=360,distance=0,chakra=0,scrolls=0,score=0,spawn=0,objects=[],particles=[],best=Number(localStorage.getItem('shinobiBest')||0);
  const player={x:150,y:ground,w:40,h:58,vy:0,slide:0,grounded:true};$('menuBest').textContent=best;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function start(){state='play';time=distance=chakra=scrolls=score=0;speed=360;spawn=1.1;objects=[];particles=[];player.y=ground;player.vy=0;player.slide=0;player.grounded=true;Object.values(screens).forEach(s=>s.hidden=true);$('hud').hidden=false;$('hint').hidden=false;$('pause').textContent='Ⅱ';last=performance.now();requestAnimationFrame(loop)}
  function menu(){state='menu';$('hud').hidden=true;$('hint').hidden=true;Object.values(screens).forEach(s=>s.hidden=true);screens.menu.hidden=false;$('menuBest').textContent=best}
  function pause(){if(state==='play'){state='paused';screens.paused.hidden=false;$('pause').textContent='▶'}else if(state==='paused'){state='play';screens.paused.hidden=true;$('pause').textContent='Ⅱ';last=performance.now();requestAnimationFrame(loop)}}
  function end(){state='over';$('hud').hidden=true;$('hint').hidden=true;best=Math.max(best,score);localStorage.setItem('shinobiBest',best);$('finalScore').textContent=score;$('finalDistance').textContent=Math.floor(distance)+'m';$('finalChakra').textContent=chakra;$('finalScrolls').textContent=scrolls;$('finalBest').textContent=best;screens.over.hidden=false}
  function jump(){if(state==='play'&&player.grounded){player.vy=-660;player.grounded=false;burst(player.x+20,player.y+player.h,5,'#d8d8bc')}}
  function slide(){if(state==='play'&&player.grounded)player.slide=.68}
  function add(type,x){objects.push({type,x,y:type==='orb'?rand(280,335):type==='scroll'?rand(295,340):0,got:false,phase:rand(0,6)})}
  function obstacle(){const kinds=['rock','root','log','barrier'];const k=kinds[Math.floor(rand(0,kinds.length))];add(k,W+20);if(Math.random()<.65){const n=Math.floor(rand(3,6));for(let i=0;i<n;i++)add('orb',W+95+i*38)}if(Math.random()<.18)add('scroll',W+180)}
  function burst(x,y,n,color){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-110,110),vy:rand(-180,-40),life:rand(.3,.65),color})}
  function rounded(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  function draw(){
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#172b39');sky.addColorStop(.58,'#56766e');sky.addColorStop(1,'#c08a5e');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // distant moon and clouds
    ctx.fillStyle='#eed8a6';ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(760,90,29,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    for(let i=0;i<5;i++){let x=((i*235-time*speed*.035)%(W+250)+W+250)%(W+250)-100,y=65+(i%3)*26;ctx.fillStyle='#c1c9ae22';ctx.beginPath();ctx.ellipse(x,y,54,9,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+21,y-5,26,11,0,0,Math.PI*2);ctx.fill()}
    // layered forest silhouettes
    for(let layer=0;layer<3;layer++){let base=layer===0?330:layer===1?350:ground;let gap=layer===0?90:layer===1?125:165,par=layer===0?.08:layer===1?.2:.42;ctx.fillStyle=['#253f3e','#203b36','#18312b'][layer];for(let i=-2;i<Math.ceil(W/gap)+2;i++){let x=((i*gap-time*speed*par)%(W+gap)+W+gap)%(W+gap)-gap;let hh=(layer===0?75:layer===1?100:145)+((i*17%31+31)%31);ctx.beginPath();ctx.moveTo(x-40,base);ctx.lineTo(x,base-hh);ctx.lineTo(x+42,base);ctx.fill();if(layer===2){ctx.fillStyle='#31503a';ctx.fillRect(x-5,base-hh+35,10,hh-30);ctx.fillStyle='#18312b'}}}
    // ground
    ctx.fillStyle='#182921';ctx.fillRect(0,ground,W,H-ground);ctx.fillStyle='#526343';ctx.fillRect(0,ground,W,7);ctx.fillStyle='#b17a4f';ctx.fillRect(0,ground+7,W,2);
    for(let i=0;i<45;i++){let x=((i*73-time*speed*.95)%(W+70)+W+70)%(W+70)-30,y=ground+18+(i%5)*15;ctx.fillStyle=i%3?'#78905a':'#c18b58';ctx.fillRect(x,y,2+(i%3),2)}
    for(const o of objects)drawObject(o);
    drawPlayer();for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4);ctx.globalAlpha=1}
    if(state==='menu'){ctx.fillStyle='#0d171522';ctx.fillRect(0,0,W,H)}
  }
  function drawObject(o){let y=o.y||ground;if(o.type==='orb'){let yy=y+Math.sin(time*5+o.phase)*7;ctx.save();ctx.shadowColor='#59d8e3';ctx.shadowBlur=18;ctx.fillStyle='#7cf1e8';ctx.beginPath();ctx.arc(o.x,yy,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eaffdd';ctx.fillRect(o.x-2,yy-5,3,7);ctx.restore();return}if(o.type==='scroll'){rounded(o.x-11,y-17,22,30,4,'#e9bb75');ctx.fillStyle='#8c4e38';ctx.fillRect(o.x-7,y-8,14,2);ctx.fillRect(o.x-7,y-3,10,2);return}if(o.type==='rock'){ctx.fillStyle='#555c4d';ctx.beginPath();ctx.moveTo(o.x-20,ground);ctx.lineTo(o.x-16,ground-18);ctx.lineTo(o.x-5,ground-29);ctx.lineTo(o.x+12,ground-27);ctx.lineTo(o.x+21,ground);ctx.fill();ctx.fillStyle='#7c8066';ctx.fillRect(o.x-10,ground-19,7,3)}else if(o.type==='root'){ctx.fillStyle='#9b6340';ctx.fillRect(o.x-26,ground-13,52,13);ctx.fillStyle='#c58a59';ctx.fillRect(o.x-18,ground-13,3,3);ctx.fillRect(o.x+8,ground-13,3,3)}else{let h=o.type==='log'?22:38;rounded(o.x-25,ground-h,50,h,3,o.type==='log'?'#8c573b':'#a8794b');ctx.fillStyle='#d1a16a';ctx.fillRect(o.x-19,ground-h+5,38,2);if(o.type==='barrier'){ctx.fillStyle='#d5b17b';ctx.fillRect(o.x-2,ground-h,4,h);ctx.fillRect(o.x-23,ground-h+12,46,3)}}}
  function drawPlayer(){let p=player,slide=p.slide>0,h=slide?29:58,y=slide?ground-h:p.y-58;ctx.save();ctx.translate(p.x,y);ctx.fillStyle='#101a1a66';ctx.beginPath();ctx.ellipse(20,ground-y+3,22,5,0,0,Math.PI*2);ctx.fill();ctx.translate(0,slide?0:Math.sin(time*18)*2);
    // legs, tunic, head and scarf
    ctx.fillStyle='#d5c9a8';if(!slide){ctx.fillRect(8,40,10,17);ctx.fillRect(24,40,9,17);ctx.fillStyle='#141d23';ctx.fillRect(5,54,15,5);ctx.fillRect(22,54,15,5)}
    rounded(4,16,32,30,5,'#a74739');ctx.fillStyle='#d7875c';ctx.fillRect(4,20,32,4);ctx.fillStyle='#222f35';ctx.fillRect(7,39,26,7);
    ctx.fillStyle='#d4b28a';ctx.beginPath();ctx.arc(21,12,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#20282a';ctx.fillRect(8,8,24,6);ctx.fillStyle='#e3b56c';ctx.fillRect(16,11,10,3);ctx.fillStyle='#21292c';ctx.fillRect(11,15,4,2);ctx.fillRect(25,15,4,2);
    ctx.fillStyle='#c24b3e';ctx.beginPath();ctx.moveTo(7,20);ctx.lineTo(-10,17+Math.sin(time*13)*3);ctx.lineTo(5,26);ctx.fill();ctx.restore();
  }
  function loop(now){if(state!=='play')return;let dt=Math.min((now-last)/1000,.035);last=now;time+=dt;distance+=speed*dt/24;speed=Math.min(610,360+distance*.48);score=Math.floor(distance)+chakra*25+scrolls*100;spawn-=dt;if(spawn<=0){obstacle();spawn=Math.max(.72,rand(1.25,1.9)-distance/2000)}
    player.slide=Math.max(0,player.slide-dt);if(!player.grounded){player.vy+=1750*dt;player.y+=player.vy*dt;if(player.y>=ground){player.y=ground;player.vy=0;player.grounded=true}}
    for(const o of objects)o.x-=speed*dt;objects=objects.filter(o=>o.x>-60&&!o.got);
    let ph=player.slide>0?29:58,py=player.slide>0?ground-ph:player.y-58;for(const o of objects){let collectible=o.type==='orb'||o.type==='scroll';if(collectible){if(Math.abs(o.x-(player.x+20))<25&&Math.abs(o.y-(py+ph/2))<35){o.got=true;if(o.type==='orb'){chakra++;burst(o.x,o.y,7,'#69e5df')}else{scrolls++;burst(o.x,o.y,9,'#edbd73')}}continue}let oh=o.type==='barrier'?38:o.type==='log'?22:o.type==='rock'?28:13,top=ground-oh;let overlap=o.type==="barrier"?player.slide<=0&&o.x+22>player.x+5&&o.x-22<player.x+35:o.x+22>player.x+5&&o.x-22<player.x+35&&py+ph>top+3&&py+5<ground;if(overlap){end();draw();return}}
    for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt}particles=particles.filter(p=>p.life>0);
    $('score').textContent=score;$('distance').textContent=Math.floor(distance);$('chakra').textContent=chakra;$('scrolls').textContent=scrolls;draw();requestAnimationFrame(loop)
  }
  $('start').onclick=start;$('retry').onclick=start;$('resume').onclick=pause;$('pause').onclick=pause;$('home').onclick=menu;
  window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat)jump();if(e.code==='ArrowDown')slide();if(e.code==='KeyP')pause();if(e.code==='KeyR')start()});
  let touchY=0;canvas.addEventListener('touchstart',e=>{touchY=e.changedTouches[0].clientY},{passive:true});canvas.addEventListener('touchend',e=>{if(state!=='play')return;let dy=e.changedTouches[0].clientY-touchY;if(dy>25)slide();else jump()},{passive:true});
  let resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()};window.addEventListener('resize',resize);resize();
})();


