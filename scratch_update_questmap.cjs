const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/QuestMap.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /\{\/\* Chapter 1 \*\/\}[\s\S]*?<span>Chapter 1 — O-NET Core<\/span>/,
  `{/* Chapter 1 */}
        <div className="chapter-1">
          <span>Chapter 1 — The Foundation</span>`
);

content = content.replace(
  /\{\/\* Chapter 2 \*\/\}[\s\S]*?<span>Chapter 2 — Advanced<\/span>/,
  `{/* Chapter 2 */}
        <div className="chapter-2 mt-4">
          <span>Chapter 2 — Social Interactions</span>`
);

content = content.replace(
  /\{\/\* Chapter 3 \*\/\}[\s\S]*?<span>Chapter 3 — Strategy Castle<\/span>/,
  `{/* Chapter 3 */}
        <div className="chapter-3 mt-4">
          <span>Chapter 3 — The Interrogation Room</span>`
);

content = content.replace(
  /\{\/\* Chapter 5 — Grammar Master & Expansion \*\/\}[\s\S]*?<div className="chapter-4 mt-6">[\s\S]*?<span>Chapter 5 — Grammar &amp; Vocab Expansion<\/span>/,
  `{/* Chapter 4 */}
        <div className="chapter-4 mt-6">
          <span>Chapter 4 — Data Detective</span>`
);

content = content.replace(
  /\{QUESTS\.filter\(q => q\.chapter === 5\)\.map\(quest => \{/g,
  `{QUESTS.filter(q => q.chapter === 4).map(quest => {`
);

content = content.replace(
  /\{\/\* ── Chapter 4: O-NET Arena \(practice\) ── \*\/\}[\s\S]*?<h2 className="text-xl font-black text-amber-800">Chapter 4: O-NET\nArena<\/h2>/,
  `{/* ── Chapter 5: O-NET Arena (practice) ── */}
      <div className="mx-4 mb-8">
        <div className="glass-card p-5 border-2 border-amber-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏟️</span>
            <div>
              <h2 className="text-xl font-black text-amber-800">Chapter 5: O-NET Arena</h2>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated QuestMap.jsx');
