const fs = require('fs');
const files = [
  'src/components/MultiplayerArena.jsx',
  'src/components/HeadsUpCharades.jsx',
  'src/components/games/VoiceGame.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
