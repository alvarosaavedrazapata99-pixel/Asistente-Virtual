// Uso: node render.js [archivo.html] [salida.mp4] [segundos]  (1080x1920, 30fps)
const {chromium}=require('playwright');const {execSync}=require('child_process');const fs=require('fs');
(async()=>{
  const HTML=process.argv[2]||'intro.html',OUT=process.argv[3]||'three3-intro.mp4';const DUR=+(process.argv[4]||15);
  fs.mkdirSync('frames',{recursive:true});
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+__dirname+'/'+HTML);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
  const FPS=30;
  for(let i=0;i<FPS*DUR;i++){
    await p.evaluate(t=>setT(t),i/FPS);
    await p.screenshot({path:`frames/f_${String(i).padStart(4,'0')}.png`});
  }
  await b.close();
  execSync('ffmpeg -y -v error -framerate 30 -i frames/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 '+OUT,{stdio:'inherit'});
  fs.rmSync('frames',{recursive:true});
  console.log('OK '+OUT);
})();
