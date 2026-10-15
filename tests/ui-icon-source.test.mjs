import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
}
test('all migrated icon attributes retain primitive expressions and no duplicate imports', () => {
  for (const file of files('src/components').filter(f => f.endsWith('.jsx'))) {
    const source = readFileSync(file, 'utf8');
    const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] });
    assert.ok((source.match(/^import UIIcon/gm) || []).length <= 1, file);
    traverse(ast, { JSXOpeningElement({ node }) {
      if (!['UIIcon', 'UIIconText'].includes(node.name.name)) return;
      const value = node.attributes.find(a => a.name?.name === 'value');
      assert.ok(value, file);
      assert.notEqual(value.value.type, 'JSXElement', file);
    } });
  }
});
test('static UI symbols have an explicit semantic Lucide mapping', () => {
  const iconAst = parse(readFileSync('src/components/UIIcon.jsx', 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  let keys;
  const normalize = s => s.replace(/[\uFE0E\uFE0F]/g, '');
  traverse(iconAst, { VariableDeclarator({ node }) {
    if (node.id.name === 'ICONS') keys = new Set(node.init.properties.map(p => normalize(p.key.value)));
  } });
  const missing = new Set();
  for (const file of files('src/components').filter(f => f.endsWith('.jsx'))) {
    const ast = parse(readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    traverse(ast, { JSXOpeningElement({ node }) {
      if (node.name.name !== 'UIIcon') return;
      const value = node.attributes.find(a => a.name?.name === 'value')?.value?.expression;
      if (value?.type === 'StringLiteral' && !keys.has(normalize(value.value))) missing.add(value.value);
    } });
  }
  assert.deepEqual([...missing], []);
});
