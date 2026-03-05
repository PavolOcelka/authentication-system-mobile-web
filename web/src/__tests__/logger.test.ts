import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('in development mode', () => {
    it('logger.info logs with [INFO] prefix', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { logger } = await import('../lib/logger');

      logger.info('test message', { key: 'value' });

      expect(console.log).toHaveBeenCalledWith('[INFO]', 'test message', { key: 'value' });
    });

    it('logger.warn logs with [WARN] prefix', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { logger } = await import('../lib/logger');

      logger.warn('warning message');

      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'warning message');
    });

    it('logger.debug logs with [DEBUG] prefix', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { logger } = await import('../lib/logger');

      logger.debug('debug info');

      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'debug info');
    });

    it('logger.error logs with [ERROR] prefix', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { logger } = await import('../lib/logger');

      logger.error('something broke');

      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'something broke');
    });
  });

  describe('in production mode', () => {
    it('logger.info does NOT log', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { logger } = await import('../lib/logger');

      logger.info('should be silent');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('logger.warn does NOT log', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { logger } = await import('../lib/logger');

      logger.warn('should be silent');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('logger.debug does NOT log', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { logger } = await import('../lib/logger');

      logger.debug('should be silent');

      expect(console.debug).not.toHaveBeenCalled();
    });

    it('logger.error ALWAYS logs even in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { logger } = await import('../lib/logger');

      logger.error('critical error');

      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'critical error');
    });
  });
});
