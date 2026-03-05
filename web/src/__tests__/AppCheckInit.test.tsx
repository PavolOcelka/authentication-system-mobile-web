import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockInitializeAppCheck = vi.fn();
const mockReCaptchaV3Provider = vi.fn();
const mockGetAppInstance = vi.fn().mockReturnValue({ name: '[DEFAULT]' });

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: (...args: unknown[]) => mockInitializeAppCheck(...args),
  ReCaptchaV3Provider: class {
    constructor(...args: unknown[]) { mockReCaptchaV3Provider(...args); }
  },
}));

vi.mock('@shared/firebaseConfig', () => ({
  getAppInstance: () => mockGetAppInstance(),
}));

vi.mock('../lib/firebase', () => ({}));

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('AppCheckInit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };

    // Reset the initialized flag by re-importing fresh module each test
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('initializes App Check when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';

    // Fresh import to reset the `initialized` flag
    const { AppCheckInit } = await import('../components/AppCheckInit');
    render(<AppCheckInit />);

    expect(mockGetAppInstance).toHaveBeenCalled();
    expect(mockReCaptchaV3Provider).toHaveBeenCalledWith('test-site-key');
    expect(mockInitializeAppCheck).toHaveBeenCalledWith(
      { name: '[DEFAULT]' },
      expect.objectContaining({ isTokenAutoRefreshEnabled: true }),
    );
  });

  it('does NOT initialize App Check when site key is missing', async () => {
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    const { AppCheckInit } = await import('../components/AppCheckInit');
    render(<AppCheckInit />);

    expect(mockInitializeAppCheck).not.toHaveBeenCalled();
  });

  it('renders nothing (returns null)', async () => {
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    const { AppCheckInit } = await import('../components/AppCheckInit');
    const { container } = render(<AppCheckInit />);

    expect(container.innerHTML).toBe('');
  });

  it('only initializes once even if rendered multiple times', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';

    const { AppCheckInit } = await import('../components/AppCheckInit');
    const { unmount } = render(<AppCheckInit />);
    unmount();
    render(<AppCheckInit />);

    expect(mockInitializeAppCheck).toHaveBeenCalledTimes(1);
  });
});
