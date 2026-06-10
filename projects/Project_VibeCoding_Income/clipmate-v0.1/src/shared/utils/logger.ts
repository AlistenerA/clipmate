const PREFIX = '[ClipMate]'

export const logger = {
  info(msg: string): void {
    console.log(`${PREFIX} ${msg}`)
  },
  warn(msg: string): void {
    console.warn(`${PREFIX} ${msg}`)
  },
  error(msg: string, err?: unknown): void {
    if (err !== undefined) {
      console.error(`${PREFIX} ${msg}`, err)
    } else {
      console.error(`${PREFIX} ${msg}`)
    }
  },
}
