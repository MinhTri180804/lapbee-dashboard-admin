import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

/** @param {string[]} argv */
function parseOutDir(argv) {
  const i = argv.indexOf('--out');
  if (i === -1) return path.join(root, 'src/shared/api/generated');
  const value = argv[i + 1];
  if (!value) throw new Error('--out requires a directory');
  return path.resolve(value);
}

/** @param {any} spec */
function collectPermissions(spec) {
  const keys = new Set();
  for (const item of Object.values(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const perms = item?.[method]?.['x-permissions'];
      if (Array.isArray(perms)) for (const p of perms) keys.add(String(p));
    }
  }
  return [...keys].sort();
}

// Backend emits JSON-Schema-local `#/$defs/x` refs that resolve against the schema
// root, while openapi-typescript resolves against the document root. Hoist each
// `$defs` entry into components.schemas and rewrite the refs that point at it.
/** @param {any} spec */
function hoistDefs(spec) {
  /** @type {Record<string, unknown>} */
  const hoisted = {};
  /** @type {(node: any, renames: Map<string, string>) => void} */
  const rewrite = (node, renames) => {
    if (Array.isArray(node)) return node.forEach((n) => rewrite(n, renames));
    if (node === null || typeof node !== 'object') return;
    if (typeof node.$ref === 'string' && node.$ref.startsWith('#/$defs/')) {
      const target = renames.get(node.$ref.slice('#/$defs/'.length));
      if (target) node.$ref = `#/components/schemas/${target}`;
    }
    for (const v of Object.values(node)) rewrite(v, renames);
  };
  /** @type {(node: any, pointer: string) => void} */
  const walk = (node, pointer) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${pointer}/${i}`));
    if (node === null || typeof node !== 'object') return;
    if (node.$defs && typeof node.$defs === 'object') {
      const prefix = pointer.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
      /** @type {Map<string, string>} */
      const renames = new Map();
      for (const name of Object.keys(node.$defs)) renames.set(name, `${prefix}__${name}`);
      for (const [name, def] of Object.entries(node.$defs))
        hoisted[renames.get(name) ?? name] = def;
      delete node.$defs;
      rewrite(node, renames);
      for (const name of renames.values()) rewrite(hoisted[name], renames);
    }
    for (const [k, v] of Object.entries(node)) walk(v, `${pointer}/${k}`);
  };
  walk(spec, '');
  if (Object.keys(hoisted).length > 0) {
    spec.components ??= {};
    spec.components.schemas = { ...spec.components.schemas, ...hoisted };
  }
}

const specPath = path.resolve(process.env.OPENAPI_PATH ?? '../lapbee-backend/openapi.json');
const outDir = parseOutDir(process.argv.slice(2));

const spec = JSON.parse(await readFile(specPath, 'utf8'));
hoistDefs(spec);
const version = spec.info?.version ?? 'unknown';

const ast = await openapiTS(spec);
const schema =
  `// SINH TỰ ĐỘNG từ openapi.json ${version}. Không sửa tay. Chạy npm run gen:api.\n` +
  astToString(ast);

const keys = collectPermissions(spec);
const permissions =
  `// SINH TỰ ĐỘNG từ openapi.json ${version}. Không sửa tay. Chạy npm run gen:api.\n` +
  `export const PERMISSION_KEYS = [\n${keys.map((k) => `  ${JSON.stringify(k)},\n`).join('')}] as const;\n\n` +
  `export type Permission = (typeof PERMISSION_KEYS)[number];\n`;

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'schema.d.ts'), schema);
await writeFile(path.join(outDir, 'permissions.ts'), permissions);
console.log(`gen-api: wrote ${keys.length} permission keys to ${outDir}`);
