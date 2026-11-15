import Schema from '@deepseek-ai/schemastery'
import { createHandler } from './src/http.js'

export const name = '@local/zotero-local-reader'

export const Config = Schema.object({
  /** Zotero data directory, or direct path to zotero.sqlite. Empty uses standard discovery. */
  dataDir: Schema.string().default('').volatile(),
})

export function apply(ctx, config) {
  const getConfig = () => ({
    dataDir: config.dataDir.get(),
  })

  ctx.inject(['webServer'], (hostCtx) => {
    const handler = createHandler({ getConfig })
    hostCtx.effect(
      () => hostCtx.webServer.register({
        kind: 'prefix',
        path: '/dsh-zotero-local/api',
        handler,
      }),
      'zotero-local-reader: HTTP API',
    )
  })
}
