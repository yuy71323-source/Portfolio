const sharp = require('C:/Users/曹沁雨/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs = require('fs');
const path = require('path');
const out = 'src/assets/works/packaging-motion';
const order = [' (1)', '', ' (5)', ' (3)', ' (2)', ' (4)'];
const points=Array.from({length:40},(_,i)=>{const a=-Math.PI/2+i*Math.PI/20;const r=i%2===0 ? 460 + (i%6)*8 : 265 + (i%5)*8;return `${540+Math.cos(a)*r},${540+Math.sin(a)*r}`}).join(' ');
const svg=Buffer.from(`<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="black"/><polygon points="${points}" fill="#8b55d6"/></svg>`);
(async()=>{for(let i=0;i<order.length;i++){const input=`C:/Users/曹沁雨/Downloads/Render_Mockup_4000_4000_2026-05-16${order[i]}.png`;const product=await sharp(input).trim({background:'#00000000',threshold:5}).resize({width:850,height:760,fit:'inside',withoutEnlargement:true}).png().toBuffer();await sharp(svg).composite([{input:product,gravity:'centre'}]).png().toFile(path.join(out,`frame${i+1}.png`));console.log(i+1)} })().catch(e=>{console.error(e);process.exit(1)});
