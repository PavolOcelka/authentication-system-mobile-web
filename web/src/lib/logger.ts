const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /** Dev only — general flow info (stripped from production builds) */
  info: (...args: unknown[]) => isDev && console.log('[INFO]', ...args),

  /** Dev only — warnings (stripped from production builds) */
  warn: (...args: unknown[]) => isDev && console.warn('[WARN]', ...args),

  /** Dev only — verbose debugging (stripped from production builds) */
  debug: (...args: unknown[]) => isDev && console.debug('[DEBUG]', ...args),

  /** ALWAYS logs — errors that matter in production too */
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
};
