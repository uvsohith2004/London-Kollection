export interface Logger {
  info(message: string, meta?: Record<string, any>): void
  warn(message: string, meta?: Record<string, any>): void
  error(message: string, error?: unknown, meta?: Record<string, any>): void
  debug(message: string, meta?: Record<string, any>): void
}

class ConsoleLogger implements Logger {
  private formatMeta(meta?: Record<string, any>): string {
    if (!meta) return ""
    return ` | ${JSON.stringify(meta)}`
  }

  info(message: string, meta?: Record<string, any>): void {
    console.info(`[INFO] ${message}${this.formatMeta(meta)}`)
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[WARN] ${message}${this.formatMeta(meta)}`)
  }

  error(message: string, error?: unknown, meta?: Record<string, any>): void {
    const errorDetails = error instanceof Error ? ` | Error: ${error.message}` : ""
    console.error(`[ERROR] ${message}${errorDetails}${this.formatMeta(meta)}`)
    if (error instanceof Error && error.stack && process.env.NODE_ENV !== "production") {
      console.error(error.stack)
    }
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}${this.formatMeta(meta)}`)
    }
  }
}

export const logger: Logger = new ConsoleLogger()
