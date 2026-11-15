import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const patch = await readFile(resolve(root, 'cordis.patch.yml'), 'utf8')
const required = [
  'index.js', 'client.js', 'src/zotero-db.js', 'src/http.js',
  'cordis.patch.yml', 'locale/zh.json', 'locale/en.json', 'docs/DETAIL.md', 'icon.svg',
]
for (const relative of required) await access(resolve(root, relative))
if (!manifest.dsh?.bundle?.patch || manifest.dsh.bundle.patch !== './cordis.patch.yml') throw new Error('bundle patch export is missing')
if (manifest.dsh?.client?.platform !== 'web') throw new Error('web client manifest is missing')
if (!patch.includes("id: zotero-local-reader") || !patch.includes("name: '@local/zotero-local-reader'")) throw new Error('patch row does not match the package')
if (!manifest.files?.includes('src')) throw new Error('Host source directory is not included in package files')
console.log('Bundle manifest, patch row, locale, detail page, icon, and runtime files are present.')
