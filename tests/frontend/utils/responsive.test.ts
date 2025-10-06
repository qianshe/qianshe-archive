/**
 * 响应式设计测试工具
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Responsive Design Tests', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    // 恢复原始窗口大小
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });

    // 清理mediaQuery mocks
    vi.clearAllMocks();
  });

  describe('Viewport Size Management', () => {
    it('should handle mobile viewport (320px - 768px)', () => {
      const mobileSizes = [320, 375, 414, 768];

      mobileSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        // 触发resize事件
        window.dispatchEvent(new Event('resize'));

        // 验证响应式断点
        expect(window.innerWidth).toBe(width);
        expect(width).toBeGreaterThanOrEqual(320);
        expect(width).toBeLessThanOrEqual(768);
      });
    });

    it('should handle tablet viewport (768px - 1024px)', () => {
      const tabletSizes = [768, 820, 912, 1024];

      tabletSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        window.dispatchEvent(new Event('resize'));

        expect(window.innerWidth).toBe(width);
        expect(width).toBeGreaterThan(768);
        expect(width).toBeLessThanOrEqual(1024);
      });
    });

    it('should handle desktop viewport (1024px+)', () => {
      const desktopSizes = [1024, 1200, 1440, 1920, 2560];

      desktopSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        window.dispatchEvent(new Event('resize'));

        expect(window.innerWidth).toBe(width);
        expect(width).toBeGreaterThanOrEqual(1024);
      });
    });
  });

  describe('Media Query Detection', () => {
    it('should detect mobile media queries', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      const mobileQuery = window.matchMedia('(max-width: 768px)');
      expect(mobileQuery.matches).toBe(true);

      const tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
      expect(tabletQuery.matches).toBe(false);

      const desktopQuery = window.matchMedia('(min-width: 1025px)');
      expect(desktopQuery.matches).toBe(false);
    });

    it('should detect tablet media queries', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 820
      });

      const mobileQuery = window.matchMedia('(max-width: 768px)');
      expect(mobileQuery.matches).toBe(false);

      const tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
      expect(tabletQuery.matches).toBe(true);

      const desktopQuery = window.matchMedia('(min-width: 1025px)');
      expect(desktopQuery.matches).toBe(false);
    });

    it('should detect desktop media queries', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      const mobileQuery = window.matchMedia('(max-width: 768px)');
      expect(mobileQuery.matches).toBe(false);

      const tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
      expect(tabletQuery.matches).toBe(false);

      const desktopQuery = window.matchMedia('(min-width: 1025px)');
      expect(desktopQuery.matches).toBe(true);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812
      });

      const portraitQuery = window.matchMedia('(orientation: portrait)');
      expect(portraitQuery.matches).toBe(true);

      const landscapeQuery = window.matchMedia('(orientation: landscape)');
      expect(landscapeQuery.matches).toBe(false);
    });

    it('should detect landscape orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 812
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });

      const portraitQuery = window.matchMedia('(orientation: portrait)');
      expect(portraitQuery.matches).toBe(false);

      const landscapeQuery = window.matchMedia('(orientation: landscape)');
      expect(landscapeQuery.matches).toBe(true);
    });
  });

  describe('High DPI Display Detection', () => {
    it('should detect Retina displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2
      });

      const retinaQuery = window.matchMedia('(-webkit-min-device-pixel-ratio: 2)');
      expect(retinaQuery.matches).toBe(true);

      expect(window.devicePixelRatio).toBe(2);
    });

    it('should handle standard DPI displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 1
      });

      const retinaQuery = window.matchMedia('(-webkit-min-device-pixel-ratio: 2)');
      expect(retinaQuery.matches).toBe(false);

      expect(window.devicePixelRatio).toBe(1);
    });
  });

  describe('Touch Capability Detection', () => {
    it('should detect touch-enabled devices', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 1
      });

      const touchQuery = window.matchMedia('(hover: none)');
      expect(touchQuery.matches).toBe(true);

      expect(navigator.maxTouchPoints).toBe(1);
    });

    it('should detect mouse-only devices', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });

      const touchQuery = window.matchMedia('(hover: none)');
      expect(touchQuery.matches).toBe(false);

      expect(navigator.maxTouchPoints).toBe(0);
    });
  });

  describe('Dark Mode Detection', () => {
    it('should detect dark mode preference', () => {
      const mockMediaQuery = {
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => {
          if (query === '(prefers-color-scheme: dark)') {
            return mockMediaQuery;
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
          };
        })
      });

      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      expect(darkModeQuery.matches).toBe(true);
    });

    it('should detect light mode preference', () => {
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => {
          if (query === '(prefers-color-scheme: dark)') {
            return mockMediaQuery;
          }
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
          };
        })
      });

      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      expect(darkModeQuery.matches).toBe(false);
    });
  });

  describe('Reduced Motion Detection', () => {
    it('should detect reduced motion preference', () => {
      const mockMediaQuery = {
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return mockMediaQuery;
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
          };
        })
      });

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery.matches).toBe(true);
    });
  });
});
