// Uso: node render.js  -> genera three3-intro.mp4 (1080x1920, 30fps, 15s)
const {chromium}=require('playwright');const {execSync}=require('child_process');const fs=require('fs');
(async()=>{
  fs.mkdirSync('frames',{recursive:true});
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+__dirname+'/intro.html');
  const FPS=30,DUR=15;
  for(let i=0;i<FPS*DUR;i++){
    await p.evaluate(t=>setT(t),i/FPS);
    await p.screenshot({path:`frames/f_${String(i).padStart(4,'0')}.png`});
  }
  await b.close();
  execSync('ffmpeg -y -v error -framerate 30 -i frames/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 three3-intro.mp4',{stdio:'inherit'});
  fs.rmSync('frames',{recursive:true});
  console.log('OK three3-intro.mp4');
})();
