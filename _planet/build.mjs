import {build} from 'esbuild';import {readFileSync,writeFileSync,mkdirSync} from 'fs';
const f=(p)=>readFileSync(p);
const font=(fam,file,w,st)=>`@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};font-display:swap;src:url(data:font/woff2;base64,${f('node_modules/@fontsource/'+file).toString('base64')}) format("woff2")}`;
const fonts=[font('Fraunces','fraunces/files/fraunces-latin-400-normal.woff2',400,'normal'),font('Fraunces','fraunces/files/fraunces-latin-400-italic.woff2',400,'italic'),font('Fraunces','fraunces/files/fraunces-latin-600-normal.woff2',600,'normal'),font('Fraunces','fraunces/files/fraunces-latin-600-italic.woff2',600,'italic'),
 ...[400,500,600].map(w=>font('Instrument Sans',`instrument-sans/files/instrument-sans-latin-${w}-normal.woff2`,w,'normal'))].join('\n');
const SITE=process.env.INTEGRATED?'':'https://yubol-bobo.github.io';
const r=await build({entryPoints:['src/main.js'],bundle:true,minify:true,format:'iife',write:false,loader:{'.json':'json'},target:'es2020',define:{__SITE__:JSON.stringify(SITE),__TARGET__:JSON.stringify(process.env.INTEGRATED?'_self':'_blank')}});
const js=r.outputFiles[0].text.replace(/<\/script/g,'<\\/script');
let html=f('src/index.html').toString().replace('/*CSS*/',()=>f('src/style.css').toString().replace('/*FONTS*/',()=>fonts)).replace('/*JS*/',()=>js).replaceAll('/*SITE*/',SITE);
mkdirSync('dist',{recursive:true});writeFileSync(process.env.INTEGRATED?'dist/world.html':'dist/index.html',html);console.log('built',(html.length/1e6).toFixed(2)+'MB');
