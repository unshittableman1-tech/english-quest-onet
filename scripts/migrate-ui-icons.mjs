import { readFile, readdir, writeFile } from 'node:fs/promises';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const emoji = /\p{Extended_Pictographic}|[✓☆✕✖←→]/u;
// These surfaces render learning stimuli; their symbols must not be restyled mechanically.
const protectedFiles = /\/(?:QuestionStimulus|QuestionChart|VocabTooltip)\.jsx$/;
const dynamicIcons = new Set(['quest.icon', 'lesson.icon', 'tip.icon', 'badge.icon', 'reward.icon', 'r.icon', 'item.icon', 'typeInfo.icon', 'mission.icon', 'tier.icon', 't.icon', 'tab.icon', 'ch.icon', 'tech.icon', 'currentTech.icon', 'cat.icon', 'selectedCategory.icon', 'mode.icon', 'p.icon', 'grade.emoji', 'sign.icon', 'crownIcon']);
const changed = [];
async function migrate(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { await migrate(path); continue; }
    if (!path.endsWith('.jsx') || path.endsWith('/UIIcon.jsx') || protectedFiles.test(path)) continue;
    let source = await readFile(path, 'utf8');
    const original = source;
    const imports = new Set();
    source = source.split('\n').filter(line => {
      if (!line.startsWith('import UIIcon')) return true;
      if (imports.has(line)) return false;
      imports.add(line); return true;
    }).join('\n');
    const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] });
    const edits = [];
    traverse(ast, {
      JSXText({ node }) {
        if (!emoji.test(node.value)) return;
        const raw = source.slice(node.start, node.end);
        const text = [...segmenter.segment(raw)].map(({ segment }) => emoji.test(segment)
          ? `<UIIcon value={${JSON.stringify(segment)}} />` : segment).join('');
        edits.push({ start: node.start, end: node.end, text });
      },
      JSXExpressionContainer({ node, parent }) {
        if (parent.type === 'JSXAttribute') return;
        const expression = node.expression;
        if (expression.type === 'JSXEmptyExpression') return;
        const raw = source.slice(expression.start, expression.end);
        if (dynamicIcons.has(raw)) edits.push({ start: node.start, end: node.end, text: `<UIIcon value={${raw}} />` });
        else if (['ConditionalExpression', 'TemplateLiteral', 'LogicalExpression'].includes(expression.type) && !raw.includes('<') && !/\.(?:front|back|emoji|symbol|word|prompt|question|options)\b/.test(raw) && (emoji.test(raw) || /\b(?:reward|r|badge)\.icon/.test(raw))) {
          edits.push({ start: node.start, end: node.end, text: `<UIIconText value={${raw}} />` });
        }
        else if (expression.type === 'StringLiteral' && emoji.test(expression.value) && [...segmenter.segment(expression.value)].every(({ segment }) => emoji.test(segment) || !segment.trim())) {
          edits.push({ start: node.start, end: node.end, text: [...segmenter.segment(expression.value)].map(({ segment }) => emoji.test(segment) ? `<UIIcon value={${JSON.stringify(segment)}} />` : segment).join('') });
        }
      },
    });
    if (!edits.length) {
      if (source !== original) await writeFile(path, source);
      continue;
    }
    for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
    const depth = path.split('/').length - 3;
    if (source.includes('import UIIcon from ')) source = source.replace('import UIIcon from ', 'import UIIcon, { UIIconText } from ');
    else if (!source.includes('import UIIcon, { UIIconText } from ')) source = `import UIIcon, { UIIconText } from '${depth ? '../'.repeat(depth) : './'}UIIcon';\n` + source;
    await writeFile(path, source);
    changed.push({ path, replacements: edits.length });
  }
}
await migrate('src/components');
console.log(JSON.stringify(changed, null, 2));
