// Four approved prototypes. All written evidence comes directly from art.
export const physicalStimulusKind = art => ({
  'Reading celebration':'poster', 'Meet the little penguin':'exhibit',
  'Park gate':'gate', 'Printer not connected':'printer',
})[art?.title] || null;
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function linesFor(value,size,width){
 const max=Math.max(8,Math.floor(width/(size*.57))),lines=[];
 for(const word of value.split(' ')){if(!lines.length||`${lines.at(-1)} ${word}`.length>max)lines.push(word);else lines[lines.length-1]+=' '+word;}
 return lines;
}
function lettering(value,x,y,{size=22,width=600,fill='#193f4b',weight=400,anchor='start',font='Arial, sans-serif'}={}){
 const lines=linesFor(value,size,width),lineHeight=size*1.4;
 return {svg:lines.map((line,i)=>`<text x="${x}" y="${y+i*lineHeight}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escape(line)}</text>`).join(''),bottom:y+(lines.length-1)*lineHeight};
}
const books=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-105 12h182v28h-182q-12-14 0-28" fill="#296b6b"/><path d="M-99 18H69v16H-99" fill="#fff4d9"/><path d="M-72-20H112V8H-72q-12-14 0-28" fill="#d8a449"/><path d="M-66-14H105V2H-66" fill="#fff9ec"/><path d="M-112-48H66v24h-178q-10-12 0-24" fill="#a75145"/><path d="M-106-42H59v12H-106" fill="#fff4df"/></g>`;
const penguin=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="102" rx="72" ry="12" fill="#577b8a" opacity=".18"/><path d="M-35-65Q-71-35-62 55L-41 46Z" fill="#243e50"/><path d="M35-65Q71-35 62 55L41 46Z" fill="#243e50"/><ellipse cy="0" rx="48" ry="88" fill="#243e50"/><ellipse cy="17" rx="35" ry="65" fill="#fffdf4"/><path d="M-31-70Q0-98 31-70v39q-14 14-31-2-17 16-31 2Z" fill="#fffdf4"/><circle cx="-13" cy="-56" r="4" fill="#182a38"/><circle cx="13" cy="-56" r="4" fill="#182a38"/><path d="M-11-39h22L0-25Z" fill="#d98d36"/><path d="M-13 81q-35-4-31 16h38M13 81q35-4 31 16H6" fill="#d98d36"/></g>`;
const printer=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-46-55h92v60h-92Z" fill="#fff" stroke="#506778" stroke-width="3"/><path d="M-60-13h120q14 0 14 14v61H-74V1q0-14 14-14Z" fill="#cbd7df" stroke="#506778" stroke-width="3"/><path d="M-48 37h96v49h-96Z" fill="#fff" stroke="#506778" stroke-width="3"/><path d="M-34 54H32M-34 66H20" stroke="#bdcbd3" stroke-width="3"/><circle cx="53" cy="6" r="5" fill="#d69b38"/><path d="M74 21q35 0 35 30" fill="none" stroke="#506778" stroke-width="5"/><path d="M99 58h20v19H99ZM104 77v9m10-9v9" fill="#dce5eb" stroke="#506778" stroke-width="3"/></g>`;

export function renderPhysicalStimulus(art,requestedWidth=760){
 const kind=physicalStimulusKind(art);if(!kind)return null;
 const width=Math.max(220,Math.round(requestedWidth)),mobile=width<560;
 const pad=mobile?24:48,titleSize=mobile?27:40,bodySize=mobile?19:26;
 let body='',height=0;
 if(kind==='poster'){
  let cursor=mobile?76:100;
  const heading=lettering(art.title,width/2,cursor,{size:mobile?34:52,width:width-pad*2,weight:700,anchor:'middle',font:'Georgia, serif',fill:'#205c61'});body+=heading.svg;cursor=heading.bottom+48;
  art.lines.forEach((value,i)=>{const final=i===art.lines.length-1;if(final)body+=`<path d="M${pad} ${cursor-29}H${width-pad}" stroke="#c7b783"/>`;const block=lettering(value,width/2,cursor,{size:bodySize,width:width-pad*2,weight:final?700:400,anchor:'middle'});body+=block.svg;cursor=block.bottom+(final?65:bodySize*1.8);});
  body+=books(width/2,cursor+16,mobile?.65:1);height=cursor+(mobile?66:90);
  body=`<path d="M9 20H${width-9}V${height-8}H9Z" fill="#d4c6a2"/><path d="M5 13H${width-13}V${height-15}H5Z" fill="#fff9e9" stroke="#dacba8"/><path d="M25 13V${height-15}" stroke="#e4d4ac" stroke-dasharray="2 8"/><path d="M${width-30} 13V${height-15}" stroke="#e4d4ac" stroke-dasharray="2 8"/><g fill="#b95b43" stroke="#833b2b"><circle cx="27" cy="27" r="7"/><circle cx="${width-35}" cy="27" r="7"/></g>${body}`;
 }else if(kind==='gate'){
  let cursor=112;
  const heading=lettering(art.title,width/2,cursor,{size:titleSize,width:width-pad*2,weight:700,fill:'#fff3cb',anchor:'middle'});body+=heading.svg;cursor=heading.bottom+52;
  art.lines.forEach((value,i)=>{const block=lettering(value,width/2,cursor,{size:i===0?bodySize+4:bodySize,width:width-pad*2,weight:i===0?700:400,fill:'#fff8e5',anchor:'middle'});body+=block.svg;cursor=block.bottom+bodySize*1.8;});height=cursor+38;
  const grain=Array.from({length:Math.max(1,Math.floor((height-130)/25))},(_,i)=>{const y=90+i*25;return `<path d="M25 ${y}Q${width*.25} ${y-6} ${width*.5} ${y}T${width-25} ${y}" stroke="#b08658" fill="none" stroke-width="2" opacity=".18"/>`;}).join('');
  body=`<path d="M${width*.25} 62L${width*.39} 7H${width*.61}L${width*.75} 62" fill="none" stroke="#8a795e" stroke-width="4"/><rect x="6" y="54" width="${width-12}" height="${height-72}" rx="10" fill="#67452d"/><rect x="13" y="61" width="${width-26}" height="${height-89}" rx="6" fill="#765236" stroke="#b38c5c" stroke-width="2"/>${grain}${[29,width-29].map(x=>`<circle cx="${x}" cy="79" r="5" fill="#ddc18b"/><circle cx="${x}" cy="${height-49}" r="5" fill="#ddc18b"/>`).join('')}${body}`;
 }else if(kind==='exhibit'){
  const heading=lettering(art.title,pad,58,{size:titleSize,width:width-pad*2,weight:700,fill:'#145967'});body+=heading.svg;
  const top=heading.bottom+28,factsX=mobile?pad:width*.43,factsWidth=mobile?width-pad*2:width*.57-pad;
  let cursor=mobile?top+196:top+30;
  art.lines.forEach(value=>{const block=lettering(value,factsX,cursor,{size:bodySize,width:factsWidth});body+=block.svg;cursor=block.bottom+bodySize*2.2;});height=Math.max(cursor+15,top+230);
  const cx=mobile?width/2:width*.22,cy=mobile?top+79:top+94;
  body=`<rect x="4" y="4" width="${width-8}" height="${height-8}" rx="4" fill="#f8fbfa" stroke="#9ab6b7"/><path d="M4 4H${width-4}V15H4Z" fill="#20717b"/><circle cx="${cx}" cy="${cy}" r="${mobile?83:105}" fill="#dcedec"/>${penguin(cx,cy,mobile?.82:1)}${body}`;
 }else{
  const heading=lettering(art.title,pad,75,{size:mobile?25:34,width:width-pad*2,weight:700,fill:'#293d4e'});body+=heading.svg;
  const top=heading.bottom+26,x=mobile?width/2:width*.23,y=mobile?top+65:top+76;
  const textX=mobile?pad:width*.47,textWidth=mobile?width-pad*2:width*.53-pad;
  let cursor=mobile?top+200:top+55;
  art.lines.forEach(value=>{const block=lettering(value,textX,cursor,{size:bodySize,width:textWidth,fill:'#384c5d'});body+=block.svg;cursor=block.bottom+bodySize*1.7;});height=Math.max(cursor+24,top+190);
  body=`<rect x="3" y="3" width="${width-6}" height="${height-6}" rx="9" fill="#f6f8fa" stroke="#8498a7" stroke-width="2"/><path d="M4 34V11q0-7 7-7h${width-22}q7 0 7 7v23Z" fill="#e0e7ec"/><circle cx="20" cy="19" r="4" fill="#94a7b5"/><circle cx="35" cy="19" r="4" fill="#94a7b5"/><circle cx="50" cy="19" r="4" fill="#94a7b5"/>${printer(x,y,mobile?.8:1)}${body}`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${Math.ceil(height)}" role="img" data-physical="${kind}" data-style="assessment-editorial"><title>${escape(art.title)}</title><desc>${escape(art.lines.join(' '))}</desc>${body}</svg>`;
}
