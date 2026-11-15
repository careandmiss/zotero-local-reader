import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const patch = await readFile(resolve(root, 'cordis.patch.yml'), 'utf8')
const required = [
  'index.js', 'client.js', 'src/zotero-db.js', 'src/http.js',
  'cordis.patch.yml', 'locale/zh.json', 'locale/en.json', 'icon.svg', 'README.md',
]
for (const relative of required) await access(resolve(root, relative))
if (!manifest.dsh?.bundle?.patch || manifest.dsh.bundle.patch !== './cordis.patch.yml') throw new Error('bundle patch export is missing')
if (manifest.dsh?.client?.platform !== 'web') throw new Error('web client manifest is missing')
for (const name of ['.', './client', './locale/*.json', './icon']) {
  if (!manifest.exports?.[name]) throw new Error(`package export ${name} is missing`)
}
if (!patch.includes("id: zotero-local-reader") || !patch.includes("name: '@local/zotero-local-reader'")) throw new Error('patch row does not match the package')
for (const file of ['index.js', 'client.js', 'src', 'cordis.patch.yml', 'locale/*.json', 'icon.svg', 'README.md']) {
  if (!manifest.files?.includes(file)) throw new Error(`package files omit ${file}`)
}
if (manifest.files.includes('docs')) throw new Error('unused detail documents must not be included')
for (const relative of ['locale/en.json', 'locale/zh.json']) {
  const locale = JSON.parse(await readFile(resolve(root, relative), 'utf8'))
  if (!locale.meta?.title || !locale.meta?.description) throw new Error(`${relative} is missing localized bundle metadata`)
  if (Object.hasOwn(locale.meta, 'detail')) throw new Error(`${relative} declares an unused detail document`)
}
const icon = await readFile(resolve(root, 'icon.svg'), 'utf8')
if (Buffer.byteLength(icon) > 256 * 1024) throw new Error('icon.svg exceeds the 256 KiB limit')
if (!icon.includes('width="36"') || !icon.includes('height="36"') || !icon.includes('viewBox="0 0 36 36"')) {
  throw new Error('icon.svg must use the DSH 36x36 canvas')
}
if (/<rect\b|<script\b|<style\b|<image\b|<text\b|<foreignObject\b|\son[a-z]+\s*=/iu.test(icon)) {
  throw new Error('icon.svg must remain self-contained artwork without a tile, text, style, or script')
}
console.log(`Bundle manifest, localized metadata, README fallback, icon (${Buffer.byteLength(icon)} bytes), and runtime files are present.`)
