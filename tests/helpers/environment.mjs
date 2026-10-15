import { registerHooks } from 'node:module';
import { extname } from 'node:path';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
  clear: () => values.clear(),
  key: (index) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

export const cloud = { data: null, error: null, writes: [] };
globalThis.__supabaseMock = {
  from(table) {
    const query = {
      select() { return query; },
      eq() { return query; },
      update(value) { cloud.writes.push({ table, value }); return query; },
      maybeSingle() { return Promise.resolve({ data: cloud.data, error: cloud.error }); },
      then(resolve, reject) { return Promise.resolve({ error: cloud.error }).then(resolve, reject); },
    };
    return query;
  },
};

// The app uses Vite's extensionless imports. Resolve them in Node without changing production code.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const target = new URL(specifier, context.parentURL);
      if (/\/src\/config\/supabase(?:\.js)?$/.test(target.pathname)) {
        return { url: 'data:text/javascript,export const supabase = globalThis.__supabaseMock;', shortCircuit: true };
      }
      if (!extname(target.pathname)) {
        return nextResolve(`${specifier}.js`, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
