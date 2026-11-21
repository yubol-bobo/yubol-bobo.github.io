import {readFileSync,writeFileSync} from 'fs';import {feature} from 'topojson-client';import {geoContains} from 'd3-geo';
const land=feature(JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json')),'land');
const W=120,H=52;let rows=[];for(let j=0;j<H;j++){let r='';for(let i=0;i<W;i++){const lon=-180+(i+.5)*360/W,lat=78-(j+.5)*(78+58)/H;r+=geoContains(land,[lon,lat])?'1':'0'}rows.push(r)}
writeFileSync('src/land.json',JSON.stringify({W,H,latTop:78,latBot:-58,rows}));console.log(rows.slice(8,30).join('\n'));
