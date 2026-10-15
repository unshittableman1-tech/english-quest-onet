import fs from 'fs';
const d = fs.readFileSync('sheet_html.txt','utf-8'); 
const m = [...d.matchAll(/class="goog-inline-block docs-sheet-tab-caption">([^<]+)<\/div>/g)];
console.log("Sheet names:");
m.forEach(match => console.log(match[1]));

const gids = [...d.matchAll(/id="([^"]+)-grid-container"/g)];
console.log("GIDs:", gids.map(match => match[1]));
